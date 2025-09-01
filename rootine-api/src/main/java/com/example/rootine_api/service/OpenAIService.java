package com.example.rootine_api.service;

import com.openai.client.OpenAIClient;
import com.openai.core.JsonObject;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OpenAIService {

    private final OpenAIClient openAIClient;

    private static final String META_INSTRUCTIONS = """
        You are a structured routine generator.
        Your task is to return ONLY valid JSON that strictly follows this schema:

        {
          "detail_level": "string [low|medium|high]",
          "tasks": [
            {
              "title": "string",
              "type": "string [routine|event|habit|one-time]",
              "start_time": "HH:MM:SS (24h format)",
              "duration": "integer (minutes)",
              "priority": "string [low|medium|high]"
            }
          ]
        }

        - Do not include any text outside the JSON.
        - Do not include code blocks or markdown formatting.
        - Ensure times are valid 24h times.
        - Ensure durations are positive integers.
        - If unsure, return: { "detail_level": "medium", "tasks": [] }.
        """;

    public String generateRoutine(String userPrompt) {
        // Build the complete prompt for OpenAI
        String fullPrompt = META_INSTRUCTIONS + "\n\nUser request: " + userPrompt;

        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .addUserMessage(fullPrompt)
                .model(ChatModel.GPT_5_MINI) // or whichever model you want
                .build();

        ChatCompletion chatCompletion = openAIClient.chat().completions().create(params);

        String rawResponse = chatCompletion.choices().get(0).message().content().orElse("{}");

        return rawResponse;
    }


    private String getEmptyRoutine() {
        return """
            {
              "detail_level": "medium",
              "tasks": []
            }
            """;
    }
}
