package com.act.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name, description, date, venue;

    @ManyToOne
@JoinColumn(name = "faculty_id")
@JsonBackReference
private Faculty faculty;  // assigned faculty

}
