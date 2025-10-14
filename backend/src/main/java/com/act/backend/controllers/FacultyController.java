package com.act.backend.controllers;

import com.act.backend.dto.StudentAttendanceDTO;
import com.act.backend.dto.EventDTO;
import com.act.backend.models.Faculty;
import com.act.backend.services.FacultyService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
// @RequiredArgsConstructor
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    // Helper: check session
    private Faculty checkFacultySession(HttpSession session) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) throw new RuntimeException("Not logged in");
        return f;
    }

    // Register
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Faculty faculty) {
        return ResponseEntity.ok(facultyService.register(faculty));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        try {
            Faculty f = facultyService.login(body.get("email"), body.get("password"));
            session.setAttribute("faculty", f);
            return ResponseEntity.ok(f);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("Invalid credentials: " + e.getMessage());
        }
    }

    // Logout
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Faculty logged out successfully");
    }

    // Get Profile
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        try {
            Faculty f = checkFacultySession(session);
            return ResponseEntity.ok(f);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Update Profile
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(HttpSession session, @RequestBody Faculty updated) {
        try {
            Faculty f = checkFacultySession(session);
            Faculty saved = facultyService.updateProfile(f, updated);
            session.setAttribute("faculty", saved);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Update Password
    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(HttpSession session, @RequestBody Map<String, String> body) {
        try {
            Faculty f = checkFacultySession(session);
            facultyService.updatePassword(f, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok("Password updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed: " + e.getMessage());
        }
    }

    // Set Password (after approval)
    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestParam String email, @RequestParam String password) {
        try {
            facultyService.setPassword(email, password);
            return ResponseEntity.ok("Password set successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Failed to set password: " + e.getMessage());
        }
    }

    // Get Assigned Events
    @GetMapping("/events")
    public ResponseEntity<?> getAssignedEvents(HttpSession session) {
        try {
            Faculty f = checkFacultySession(session);
            List<EventDTO> events = facultyService.getAssignedEvents(f);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Get Students for Event
    @GetMapping("/events/{eventId}/students")
    public ResponseEntity<?> getStudentsByEvent(@PathVariable Long eventId, HttpSession session) {
        try {
            Faculty f = checkFacultySession(session);
            List<StudentAttendanceDTO> students = facultyService.getStudentsByEvent(f, eventId);
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to fetch students: " + e.getMessage());
        }
    }

    // Mark Attendance
    @PostMapping("/events/{eventId}/attendance")
    public ResponseEntity<?> markAttendance(@PathVariable Long eventId,
                                            @RequestParam Long studentId,
                                            @RequestParam Boolean present,
                                            HttpSession session) {
        try {
            Faculty f = checkFacultySession(session);
            facultyService.markAttendance(f, eventId, studentId, present);
            return ResponseEntity.ok("Attendance marked as " + (present ? "Present" : "Absent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to mark attendance: " + e.getMessage());
        }
    }
}
