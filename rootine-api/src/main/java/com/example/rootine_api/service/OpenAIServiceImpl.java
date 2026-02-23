package com.example.rootine_api.service;

import com.openai.client.OpenAIClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OpenAIServiceImpl implements OpenAIService {

    private final OpenAIClient openAIClient;

    /**
     * IMPORTANT:
     * This schema is intended to match the API contract you chose:
     * - camelCase JSON keys
     * - Task.startTime is time-of-day only (LocalTime) serialized as "HH:mm:ss"
     * - Task.taskType values match your enum: routine | one_time | event | habit
     * - Routine.detailLevel values match your enum: low | medium | high
     */
    private static final String META_INSTRUCTIONS = """
    You are a structured routine generator.

    Return ONLY valid JSON. Do not include markdown, code blocks, or explanations.

    The JSON MUST strictly follow this schema (camelCase keys only):

    {
      "name": "string",
      "detailLevel": "low|medium|high",
      "description": "string (optional overall routine description)",
      "tasks": [
        {
          "title": "string",
          "description": "string (optional)",
          "taskType": "routine|one_time|event|habit",
          "startTime": "HH:mm:ss (24h format, time-of-day only)",
          "duration": "integer (minutes, positive)",
          "priority": "low|medium|high"
        }
      ]
    }

    Rules:
    - Output MUST be a single JSON object (not an array).
    - Use camelCase keys exactly as shown: detailLevel, taskType, startTime.
    - taskType MUST be one of: routine, one_time, event, habit (use one_time, not one-time).
    - startTime MUST be a valid 24-hour time string in HH:mm:ss.
    - duration MUST be a positive integer.
    - Do not include any additional properties not listed in the schema.
    - If you are unsure or cannot comply, return exactly:
      { "detailLevel": "medium", "tasks": [] }
    """;

    @Override
    public String generateRoutine(String userPrompt) {
        String fullPrompt = META_INSTRUCTIONS + "\n\nUser request: " + userPrompt;

        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .addUserMessage(fullPrompt)
                .model(ChatModel.GPT_5_MINI)
                .build();

        ChatCompletion chatCompletion = openAIClient.chat().completions().create(params);

        return chatCompletion.choices().get(0).message().content().orElse(getEmptyRoutine());
    }

    private String getEmptyRoutine() {
        return """
            { "detailLevel": "medium", "tasks": [] }
            """;
    }
}
