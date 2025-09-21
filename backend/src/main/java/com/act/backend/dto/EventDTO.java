package com.act.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String name;
    private String description;
    private String date;
    private String venue;
    private String facultyName;      
    private String facultyEmail;     
    private String facultyDepartment;
}
