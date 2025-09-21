
package com.act.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
 @Override
 public void addCorsMappings(CorsRegistry registry) {
     registry.addMapping("/api/**")
             .allowedOrigins("http://localhost:5173") // your Vite frontend URL
             .allowedMethods("GET", "POST", "PUT", "DELETE")
             .allowedHeaders("*")
             .allowCredentials(true);
 }
}
