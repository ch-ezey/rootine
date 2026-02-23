package com.example.rootine_api.model;

import com.example.rootine_api.enums.DetailLevel;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "routine")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "routine_id")
    private Integer routineId;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "detail_level")
    private DetailLevel detailLevel = DetailLevel.medium;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    /**
     * Tasks that belong to this routine.
     *
     * This enables nested routine creation like:
     * {
     *   "name": "...",
     *   "tasks": [ { ... }, { ... } ]
     * }
     *
     * Notes:
     * - Task owns the FK via Task.routine (mappedBy="routine").
     * - cascade = ALL so tasks are persisted/updated when routine is saved.
     * - orphanRemoval = true so removed tasks are deleted.
     */
    @OneToMany(
        mappedBy = "routine",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<Task> tasks = new ArrayList<>();
}
