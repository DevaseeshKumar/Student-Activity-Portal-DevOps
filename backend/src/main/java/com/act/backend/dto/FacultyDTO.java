package com.act.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String gender;
    private boolean approved;
    private int assignedEventsCount; // ✅ NEW
}
