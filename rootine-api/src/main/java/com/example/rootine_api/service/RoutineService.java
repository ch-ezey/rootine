package com.example.rootine_api.service;

import com.example.rootine_api.dto.RoutineDetailResponse;
import com.example.rootine_api.dto.RoutineRequest;
import com.example.rootine_api.dto.RoutineSummaryResponse;
import com.example.rootine_api.dto.RoutineUpdateRequest;
import java.util.List;

/** All operations act on the current user's routines only. */
public interface RoutineService {
    List<RoutineSummaryResponse> getMyRoutines();
    RoutineDetailResponse getRoutine(Integer id);
    RoutineDetailResponse addRoutine(RoutineRequest request);
    RoutineSummaryResponse updateRoutine(Integer id, RoutineUpdateRequest request);
    void deleteRoutine(Integer id);
    RoutineSummaryResponse activateRoutine(Integer id);
}
