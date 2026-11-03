package com.example.rootine_api.controller;

import com.example.rootine_api.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/openai")
public class OpenAIController {

    @Autowired
    private OpenAIService openAIService;

    private static final int MAX_PROMPT_LENGTH = 2000;

    @PostMapping("/response")
    public ResponseEntity<String> getOpenAIResponse(@RequestBody String prompt){
        if (prompt.isBlank() || prompt.length() > MAX_PROMPT_LENGTH) {
            throw new IllegalArgumentException("Prompt must be 1-" + MAX_PROMPT_LENGTH + " characters");
        }
        String response = openAIService.generateRoutine(prompt);
        return ResponseEntity.ok(response);
    }

}