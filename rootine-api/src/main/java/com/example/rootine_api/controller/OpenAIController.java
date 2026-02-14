package com.example.rootine_api.controller;

import com.example.rootine_api.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/openai")
@CrossOrigin
public class OpenAIController {

    @Autowired
    private OpenAIService openAIService;

    @PostMapping("/response")
    private ResponseEntity<String> getOpenAIResponse(@RequestBody String prompt){
        String response = openAIService.generateRoutine(prompt);
        return ResponseEntity.ok(response);
    }

}