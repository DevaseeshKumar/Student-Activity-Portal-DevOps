package com.act.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class StudentWithEventsDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String gender;
    private List<String> registeredEvents; // List of event names
}
