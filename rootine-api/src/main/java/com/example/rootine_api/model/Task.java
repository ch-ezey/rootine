package com.example.rootine_api.model;

import com.example.rootine_api.enums.Priority;
import com.example.rootine_api.enums.TaskType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "task")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Integer taskId;

    @ManyToOne(fetch = FetchType.EAGER)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TaskType taskType = TaskType.routine;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "duration")
    private Integer duration;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.medium;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    /**
     * Persistent ordering of tasks within a routine.
     * Lower numbers appear first.
     */
    @Column(name = "position")
    private Integer position;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP(0)")
    @CreationTimestamp
    private LocalDateTime createdAt;
}
