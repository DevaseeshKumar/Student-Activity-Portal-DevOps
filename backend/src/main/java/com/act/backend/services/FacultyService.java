package com.act.backend.services;

import com.act.backend.dto.EventDTO;
import com.act.backend.dto.StudentAttendanceDTO;
import com.act.backend.models.Event;
import com.act.backend.models.Faculty;

import java.util.List;

public interface FacultyService {

    String register(Faculty faculty);

    Faculty login(String email, String password);

    Faculty updateProfile(Faculty existing, Faculty updated);

    void updatePassword(Faculty faculty, String currentPassword, String newPassword);

    void setPassword(String email, String password);

    List<EventDTO> getAssignedEvents(Faculty faculty);

    List<StudentAttendanceDTO> getStudentsByEvent(Faculty faculty, Long eventId);

    void markAttendance(Faculty faculty, Long eventId, Long studentId, Boolean present);
}
