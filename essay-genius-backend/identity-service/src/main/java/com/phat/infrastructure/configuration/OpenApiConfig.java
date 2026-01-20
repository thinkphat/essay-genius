package com.phat.infrastructure.configuration;


import io.swagger.v3.oas.models.OpenAPI;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import static com.phat.common.configs.OpenApiConfig.createOpenAPI;

@Configuration
@Profile("!prod")
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI(
            @Value("${openapi.service.title}") String title,
            @Value("${openapi.service.description}") String description,
            @Value("${openapi.service.version}") String version,
            @Value("${openapi.service.server-description}") String serverDescription,
            @Value("${server.servlet.context-path}") String contextPath
    ) {
        return createOpenAPI(
                title,
                description,
                version,
                serverDescription,
                contextPath
        );
    }

}