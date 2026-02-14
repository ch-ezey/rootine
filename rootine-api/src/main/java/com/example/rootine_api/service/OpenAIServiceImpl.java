package com.example.rootine_api.service;

import com.openai.client.OpenAIClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OpenAIServiceImpl implements OpenAIService{

    private final OpenAIClient openAIClient;

    private static final String META_INSTRUCTIONS = """
    You are a structured routine generator.
    Your task is to return ONLY valid JSON that strictly follows this schema:

    {
      "detail_level": "string [low|medium|high]",
      "description": "string (optional overall routine description)",
      "tasks": [
        {
          "title": "string",
          "description": "string (optional additional context about the task)",
          "type": "string [routine|event|habit|one-time]",
          "start_time": "HH:MM:SS (24h format)",
          "duration": "integer (minutes)",
          "priority": "string [low|medium|high]"
        }
      ]
    }

    Rules:
    - Return ONLY valid JSON.
    - Do NOT include markdown formatting or code blocks.
    - Do NOT include explanations.
    - Ensure times are valid 24-hour format (HH:MM:SS).
    - Ensure duration is a positive integer.
    - The "description" fields are optional and may be omitted if unnecessary.
    - Do not include any additional properties not listed in the schema.
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
