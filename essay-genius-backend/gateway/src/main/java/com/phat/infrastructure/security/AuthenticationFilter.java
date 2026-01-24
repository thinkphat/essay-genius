package com.phat.infrastructure.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phat.api.model.response.CommonResponse;
import com.phat.app.exception.AppErrorCode;
import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.core.HttpHeaders;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.CollectionUtils;
import org.springframework.util.PathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import static com.phat.app.exception.AppErrorCode.TOKEN_INVALID;
import static com.phat.app.helper.Constants.MICROSERVICE_NAME;
import static com.phat.infrastructure.component.Translator.getLocalizedMessage;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
public class AuthenticationFilter implements GlobalFilter, Ordered {

    ObjectMapper objectMapper;

    @NonFinal
    private String[] publicEndpoints = {
            "/identity",
            "/identity/sign-up",
            "/identity/mock/init",
            "/identity/verify-email-by-code",
            "/identity/verify-email-by-token",
            "/identity/send-email-verification",
            "/identity/send-forgot-password",
            "/identity/forgot-password",
            "/identity/reset-password",
            "/identity/refresh-token",
            "/identity/sign-in",
            "/identity/sign-out",
            "/identity/v3/api-docs/**",
            "/identity/swagger-ui/**",
            "/essay/swagger-ui/**",
            "/essay/v3/api-docs/**",
            "/interaction/swagger-ui/**",
            "/interaction/v3/api-docs/**",
            "/swagger-ui/**",
            "/api-docs/**",
            "/actuator/prometheus"
    };

    List<Locale> LOCALES = List.of(
            Locale.forLanguageTag("en"),
            Locale.forLanguageTag("vi")
    );

    @Bean
    public MessageSource messageSource(
            @Value("${spring.messages.basename}") String basename,
            @Value("${spring.messages.encoding}") String encoding,
            @Value("${spring.messages.default-locale}") String defaultLocale,
            @Value("${spring.messages.cache-duration}") int cacheSeconds
    ) {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename(basename);
        messageSource.setDefaultEncoding(encoding);
        messageSource.setDefaultLocale(Locale.of(defaultLocale));
        messageSource.setCacheSeconds(cacheSeconds);
        return messageSource;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("[{}]: Enter authentication filter....", MICROSERVICE_NAME);

        String headerLang = exchange.getRequest().getHeaders().getFirst("Accept-Language");
        log.info("Accept-Language: {}", headerLang);
        Locale locale = StringUtils.hasLength(headerLang)
                ? Locale.lookup(Locale.LanguageRange.parse(headerLang), LOCALES)
                : Locale.getDefault();

        LocaleContextHolder.setLocale(locale);
        ServerHttpRequest request = exchange.getRequest();

        log.info("Incoming Request -> Method: {}, Path: {}, Headers: {}",
                request.getMethod(), request.getURI(), request.getHeaders());

        log.info("Resolved Locale: {}", LocaleContextHolder.getLocale());

        long startTime = System.currentTimeMillis();

        if ("OPTIONS".equalsIgnoreCase(request.getMethod().name())) { return chain.filter(exchange); }
        exchange.getRequest().getMethod();
        if (isPublicEndpoint(exchange.getRequest()))
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            ServerHttpResponse response = exchange.getResponse();
            long duration = System.currentTimeMillis() - startTime;
        }));

        // Get token from authorization header
        List<String> authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (CollectionUtils.isEmpty(authHeader))
            return unauthenticated(exchange.getResponse());

        String token = authHeader.getFirst().replace("Bearer ", "");
        log.info("[{}]: Token: {}", MICROSERVICE_NAME, token);

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            ServerHttpResponse response = exchange.getResponse();
            long duration = System.currentTimeMillis() - startTime;

            log.info("Outgoing Response -> Status: {}, Duration: {}ms, Headers: {}",
                    response.getStatusCode(), duration, response.getHeaders());
        }));
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicEndpoint(ServerHttpRequest request) {
        PathMatcher pathMatcher = new AntPathMatcher();
        String requestPath = request.getURI().getPath();

        return Arrays.stream(publicEndpoints)
                .anyMatch(pattern -> pathMatcher.match(pattern, requestPath));
    }

    Mono<Void> unauthenticated(ServerHttpResponse response) {
        AppErrorCode errorCode = TOKEN_INVALID;
        CommonResponse<?, ?> apiResponse = CommonResponse.builder()
                .errorCode(errorCode.getCode())
                .message(getLocalizedMessage(errorCode.getMessage()))
                .build();

        String body = null;
        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(
                Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

}

