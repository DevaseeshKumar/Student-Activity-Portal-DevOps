package com.act.backend.controllers;

import com.act.backend.dto.StudentAttendanceDTO;
import com.act.backend.models.Faculty;
import com.act.backend.services.FacultyService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    // ✅ Helper to ensure faculty is logged in
    private Faculty checkFacultySession(HttpSession session) {
        Faculty f = (Faculty) session.getAttribute("faculty");
        if (f == null) {
            throw new RuntimeException("Not logged in"); // will be returned as 401 in response handling
        }
        return f;
    }

    // ✅ REGISTER (initially unapproved)
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Faculty faculty) {
        return ResponseEntity.ok(facultyService.register(faculty));
    }

    // ✅ LOGIN (only after approval + password set)
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

    // ✅ LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Faculty logged out successfully");
    }

    // ✅ GET PROFILE
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        try {
            Faculty f = checkFacultySession(session);
            return ResponseEntity.ok(f);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ✅ UPDATE PROFILE
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(HttpSession session, @RequestBody Faculty updated) {
        try {
            Faculty f = checkFacultySession(session);
            Faculty saved = facultyService.updateProfile(f, updated);
            session.setAttribute("faculty", saved); // keep session updated
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ✅ UPDATE PASSWORD
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

    // ✅ SET PASSWORD (after approval link)
    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestParam String email, @RequestParam String password) {
        try {
            facultyService.setPassword(email, password);
            return ResponseEntity.ok("Password set successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Failed to set password: " + e.getMessage());
        }
    }

    // ✅ GET EVENTS ASSIGNED TO FACULTY
    @GetMapping("/events")
    public ResponseEntity<?> getAssignedEvents(HttpSession session) {
        try {
            Faculty f = checkFacultySession(session);
            return ResponseEntity.ok(facultyService.getAssignedEvents(f));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ✅ GET STUDENTS OF AN EVENT
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

    // ✅ MARK ATTENDANCE
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
