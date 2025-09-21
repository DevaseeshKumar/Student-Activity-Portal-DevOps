package com.act.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_event")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private Boolean attendance;
}
