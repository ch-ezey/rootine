package com.example.rootine_api.controller;

import com.example.rootine_api.model.User;
import com.example.rootine_api.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;


    @Test
    void getAllUsers_shouldReturnOk() throws Exception {
        Mockito.when(userService.getAllUser()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/user/users"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllUsers_shouldReturnEmptyList() throws Exception {
        Mockito.when(userService.getAllUser()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/user/users"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void getAllUsers_shouldReturnUsers() throws Exception {
        User user = new User();
        user.setUserId(1);
        user.setEmail("test@example.com");
        Mockito.when(userService.getAllUser()).thenReturn(List.of(user));
        mockMvc.perform(get("/user/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1))
                .andExpect(jsonPath("$[0].email").value("test@example.com"));
    }

    @Test
    void getUserById_shouldReturnUser() throws Exception {
        User user = new User();
        user.setUserId(1);
        user.setEmail("test@example.com");
//        userService.addUser(user);
        Mockito.when(userService.getUserById(1)).thenReturn(user);

        mockMvc.perform(get("/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

}