package com.example.rootine_api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Request payload for bulk reordering tasks within a routine.

 * Expected JSON:
 * {
 *   "orderedTaskIds": [12, 5, 9]
 * }

 * The first id gets position 0, next gets 1, etc.
 */
@Setter
@Getter
public class ReorderTasksRequest {

    @NotNull
    @NotEmpty
    private List<Integer> orderedTaskIds;

    public ReorderTasksRequest() {}

    public ReorderTasksRequest(List<Integer> orderedTaskIds) {
        this.orderedTaskIds = orderedTaskIds;
    }

}
