package com.phat.common.configs;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;


public class OpenApiConfig {

    public static OpenAPI createOpenAPI(
            String title,
            String description,
            String version,
            String serverDescription,
            String contextPath
    ) {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url(contextPath).description(serverDescription)
                ))
                .info(new Info()
                        .title(title)
                        .description(description)
                        .version(version)
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")
                        )
                        .termsOfService("http://swagger.io/terms/")
                        .contact(new Contact()
                                .email("nguyenthinhphat3009@gmail.com")
                                .name("Phat's side projects")
                        )
                )
                .externalDocs(new ExternalDocumentation()
                        .description("Find out more about this service")
                        .url("http://abc.com")
                )
                .components(new Components()
                        .addSecuritySchemes(
                                "bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        )
                )
                .security(List.of(new SecurityRequirement().addList("bearerAuth")));
    }
}

