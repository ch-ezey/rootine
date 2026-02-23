package com.example.rootine_api.service;

import com.example.rootine_api.model.Task;
import java.util.List;

public interface TaskService {
    List<Task> getAllTasks();
    Task getTaskById(Integer id);
    Task addTask(Task task);
    Task updateTask(Integer id, Task task);
    void deleteTask(Integer id);
    List<Task> getTasksByRoutineId(Integer routineId);

    /**
     * Bulk reorder tasks within a routine.
     * The first task id gets position 0, next gets 1, etc.
     *
     * Implementation should:
     * - validate the routine exists
     * - enforce ownership (owner/admin)
     * - ensure all taskIds belong to the routine
     * - update positions transactionally
     */
    void reorderTasks(Integer routineId, List<Integer> orderedTaskIds);
}
