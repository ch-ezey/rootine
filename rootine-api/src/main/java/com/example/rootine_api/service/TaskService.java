package com.example.rootine_api.service;

import com.example.rootine_api.dto.TaskRequest;
import com.example.rootine_api.dto.TaskResponse;
import com.example.rootine_api.dto.TaskUpdateRequest;
import java.util.List;

/** All operations act on tasks in the current user's routines only. */
public interface TaskService {
    TaskResponse getTask(Integer id);
    List<TaskResponse> getTasksByRoutineId(Integer routineId);
    TaskResponse addTask(Integer routineId, TaskRequest request);
    TaskResponse updateTask(Integer id, TaskUpdateRequest request);
    void deleteTask(Integer id);

    /**
     * Bulk reorder tasks within a routine.
     * The first task id gets position 0, next gets 1, etc.
     * The ids must be exactly the routine's tasks.
     */
    void reorderTasks(Integer routineId, List<Integer> orderedTaskIds);
}
