package com.example.rootine_api.config;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {

    /** Only created when OPENAI_API_KEY is set, so the app can run without AI features. */
    @Bean
    @ConditionalOnExpression("!'${openai.api.key:}'.isBlank()")
    public OpenAIClient openAIClient(@Value("${openai.api.key}") String openAIApiKey) {
        return OpenAIOkHttpClient.builder().apiKey(openAIApiKey).build();
    }
}
