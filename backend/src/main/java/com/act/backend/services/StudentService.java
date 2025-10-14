package com.act.backend.services;

import com.act.backend.dto.EventDTO;
import com.act.backend.models.Student;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;

public interface StudentService {

    // Authentication
    String signup(Student student);
    String login(String email, String password, HttpSession session);
    void logout(HttpSession session);

    // Profile
    Student updateOwnProfile(HttpSession session, Student updatedStudent);
    String updatePassword(HttpSession session, String oldPassword, String newPassword);
    Student getProfile(HttpSession session);

    // Event registration
    String registerEvent(HttpSession session, Long eventId);
    String unregisterEvent(HttpSession session, Long eventId);
    List<EventDTO> getAllEvents();
    List<EventDTO> getRegisteredEvents(HttpSession session);
    Boolean getAttendance(HttpSession session, Long eventId);

    // Admin utilities
    Student updateStudent(Long id, Student updatedStudent);
    List<Map<String, Object>> getAllStudentsWithEventCount();
}
