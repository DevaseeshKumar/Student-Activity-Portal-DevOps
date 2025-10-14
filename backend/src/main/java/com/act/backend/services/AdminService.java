package com.act.backend.services;

import com.act.backend.dto.*;
import com.act.backend.models.*;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AdminService {

    // Admin
    Optional<Admin> authenticate(String email, String password);
    Admin updateProfile(Admin admin, Admin updated);
    boolean updatePassword(Admin admin, String currentPassword, String newPassword);
    Admin getAdminFromSession(HttpSession session);
    void checkAdminSession(HttpSession session);

    // Faculty
    List<Faculty> getUnapprovedFaculties();
    List<FacultyDTO> getAllFaculties();
    String approveFaculty(Long id);
    String rejectFaculty(Long id, String reason);
    FacultyDTO updateFaculty(Long id, FacultyDTO updatedFaculty);
    String deleteFaculty(Long facultyId, Long replacementFacultyId);

    // Student
    // Student
List<StudentWithEventsDTO> getAllStudentsWithEvents();


    Student updateStudent(Long id, Student updatedStudent);
    String deleteStudent(Long id);

    // Event
    List<EventDTO> getAllEvents();
    Event addEvent(Map<String, Object> body);
    Event updateEvent(Long id, Map<String, Object> body);
    String deleteEvent(Long id);
    List<StudentAttendanceDTO> getStudentsByEvent(Long eventId);
    String reassignEvent(Long eventId, Long newFacultyId);
}
