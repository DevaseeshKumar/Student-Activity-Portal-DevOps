package com.act.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentAttendanceDTO {
    private Long studentId;
    private String name;
    private String email;
    private String phone;
    private String department;
    private Boolean attendance; // true=present, false=absent, null=not marked
}
