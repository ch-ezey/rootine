package com.example.rootine_api.service;

import com.example.rootine_api.dto.RoutineDetailResponse;
import com.example.rootine_api.dto.RoutineRequest;
import com.example.rootine_api.dto.RoutineSummaryResponse;
import com.example.rootine_api.dto.RoutineUpdateRequest;
import com.example.rootine_api.dto.TaskRequest;
import com.example.rootine_api.model.Routine;
import com.example.rootine_api.model.Task;
import com.example.rootine_api.repository.RoutineRepo;
import com.example.rootine_api.repository.TaskRepo;
import com.example.rootine_api.repository.UserRepo;
import com.example.rootine_api.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoutineServiceImpl implements RoutineService {

    private final RoutineRepo routineRepo;
    private final TaskRepo taskRepo;
    private final UserRepo userRepo;
    private final AuthService authService;

    public RoutineServiceImpl(
        RoutineRepo routineRepo,
        TaskRepo taskRepo,
        UserRepo userRepo,
        AuthService authService
    ) {
        this.routineRepo = routineRepo;
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
        this.authService = authService;
    }

    // ─── Retrieval ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<RoutineSummaryResponse> getMyRoutines() {
        return routineRepo
            .findByUserUserIdOrderByRoutineIdAsc(authService.getCurrentUserId())
            .stream()
            .map(RoutineSummaryResponse::from)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoutineDetailResponse getRoutine(Integer id) {
        Routine routine = routineRepo
            .findWithTasks(id, authService.getCurrentUserId())
            .orElseThrow(() -> notFound(id));
        return RoutineDetailResponse.from(routine);
    }

    // ─── Create ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoutineDetailResponse addRoutine(RoutineRequest request) {
        Routine routine = new Routine();
        routine.setUser(userRepo.getReferenceById(authService.getCurrentUserId()));
        routine.setName(request.name());
        routine.setDescription(request.description());
        if (request.detailLevel() != null) routine.setDetailLevel(request.detailLevel());

        // Nested tasks keep the order they were sent in unless positions are given
        if (request.tasks() != null) {
            int nextPosition = 0;
            for (TaskRequest taskRequest : request.tasks()) {
                Task task = TaskServiceImpl.newTask(taskRequest, routine);
                if (task.getPosition() == null) task.setPosition(nextPosition);
                nextPosition = task.getPosition() + 1;
                routine.getTasks().add(task);
            }
        }

        return RoutineDetailResponse.from(routineRepo.save(routine));
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoutineSummaryResponse updateRoutine(Integer id, RoutineUpdateRequest updates) {
        Routine existing = findOwned(id);

        if (updates.name() != null) existing.setName(updates.name());
        if (updates.description() != null) existing.setDescription(updates.description());
        if (updates.detailLevel() != null) existing.setDetailLevel(updates.detailLevel());

        return RoutineSummaryResponse.from(existing);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteRoutine(Integer id) {
        routineRepo.delete(findOwned(id));
    }

    // ─── Activate (Single-active enforcement) ───────────────────────────────────────

    @Override
    @Transactional
    public RoutineSummaryResponse activateRoutine(Integer id) {
        Integer userId = authService.getCurrentUserId();
        Routine target = findOwned(id);

        // Deactivate the others first: a partial unique index allows only one active routine per user
        routineRepo.deactivateOthersForUser(userId, id);
        target.setIsActive(true);

        return RoutineSummaryResponse.from(target);
    }

    // ─── Reset ─────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoutineDetailResponse resetRoutine(Integer id) {
        Integer userId = authService.getCurrentUserId();
        if (!routineRepo.existsByRoutineIdAndUserUserId(id, userId)) throw notFound(id);

        // One UPDATE statement, then reload the routine with its tasks
        taskRepo.resetCompletion(id);
        return RoutineDetailResponse.from(
            routineRepo.findWithTasks(id, userId).orElseThrow(() -> notFound(id))
        );
    }

    // ─── Utility ───────────────────────────────────────────────────────────────────

    private Routine findOwned(Integer id) {
        return routineRepo
            .findByRoutineIdAndUserUserId(id, authService.getCurrentUserId())
            .orElseThrow(() -> notFound(id));
    }

    private static EntityNotFoundException notFound(Integer id) {
        return new EntityNotFoundException("Routine not found with id: " + id);
    }
}
