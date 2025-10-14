package com.act.backend.controllers;

import com.act.backend.dto.EventDTO;
import com.act.backend.models.Student;
import com.act.backend.services.StudentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
// @RequiredArgsConstructor
public class StudentController {
    @Autowired
    private StudentService studentService;

    // ✅ Helper: ensure student is logged in
    private Student checkStudentSession(HttpSession session) {
        Student student = (Student) session.getAttribute("student");
        if (student == null) throw new RuntimeException("Not logged in");
        return student;
    }

    // ---------------- PUBLIC ----------------

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.signup(student));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> body, HttpSession session) {
        try {
            return ResponseEntity.ok(studentService.login(body.get("email"), body.get("password"), session));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ---------------- PROTECTED ----------------

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        checkStudentSession(session);
        studentService.logout(session);
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/profile")
    public ResponseEntity<Student> getProfile(HttpSession session) {
        return ResponseEntity.ok(checkStudentSession(session));
    }

    @PutMapping("/profile")
    public ResponseEntity<Student> updateProfile(HttpSession session, @RequestBody Student updated) {
        Student saved = studentService.updateOwnProfile(session, updated);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/profile/password")
    public ResponseEntity<String> updatePassword(HttpSession session, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(studentService.updatePassword(session, body.get("oldPassword"), body.get("newPassword")));
    }

    @PostMapping("/register-event/{eventId}")
    public ResponseEntity<String> registerEvent(HttpSession session, @PathVariable Long eventId) {
        return ResponseEntity.ok(studentService.registerEvent(session, eventId));
    }

    @PostMapping("/unregister-event/{eventId}")
    public ResponseEntity<String> unregisterEvent(HttpSession session, @PathVariable Long eventId) {
        return ResponseEntity.ok(studentService.unregisterEvent(session, eventId));
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventDTO>> getAllEvents(HttpSession session) {
        checkStudentSession(session);
        return ResponseEntity.ok(studentService.getAllEvents());
    }

    @GetMapping("/registered-events")
    public ResponseEntity<List<EventDTO>> getRegisteredEvents(HttpSession session) {
        return ResponseEntity.ok(studentService.getRegisteredEvents(session));
    }

    @GetMapping("/events/{eventId}/attendance")
    public ResponseEntity<Boolean> getAttendance(HttpSession session, @PathVariable Long eventId) {
        return ResponseEntity.ok(studentService.getAttendance(session, eventId));
    }
}
