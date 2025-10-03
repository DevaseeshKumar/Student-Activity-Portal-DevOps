package com.act.backend.controllers;

import com.act.backend.dto.EventDTO;
import com.act.backend.models.Student;
import com.act.backend.services.StudentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // ✅ Helper to ensure student is logged in
    private Student checkStudentSession(HttpSession session) {
        Student student = (Student) session.getAttribute("student");
        if (student == null) {
            throw new RuntimeException("Not logged in");
        }
        return student;
    }

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.signup(student));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> body, HttpSession session) {
        try {
            return ResponseEntity.ok(studentService.login(body.get("email"), body.get("password"), session));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        studentService.logout(session);
        return ResponseEntity.ok("Logged out successfully");
    }
    

    // PROFILE
    @GetMapping("/profile")
    public ResponseEntity<Student> getProfile(HttpSession session) {
        try {
            Student student = checkStudentSession(session);
            return ResponseEntity.ok(student);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    // UPDATE OWN PROFILE
    @PutMapping("/profile")
    public ResponseEntity<?> updateOwnProfile(HttpSession session, @RequestBody Student updatedStudent) {
        try {
            Student student = checkStudentSession(session);
            Student savedStudent = studentService.updateOwnProfile(session, updatedStudent);
            session.setAttribute("student", savedStudent); // keep session updated
            return ResponseEntity.ok(savedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // UPDATE PASSWORD
    @PutMapping("/profile/password")
    public ResponseEntity<String> updatePassword(HttpSession session,
                                                 @RequestBody Map<String, String> body) {
        try {
            Student student = checkStudentSession(session);
            String oldPassword = body.get("oldPassword");
            String newPassword = body.get("newPassword");
            return ResponseEntity.ok(studentService.updatePassword(session, oldPassword, newPassword));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // REGISTER EVENT
    @PostMapping("/register-event/{eventId}")
    public ResponseEntity<String> registerEvent(HttpSession session, @PathVariable Long eventId) {
        try {
            Student student = checkStudentSession(session);
            return ResponseEntity.ok(studentService.registerEvent(session, eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // UNREGISTER EVENT
    @PostMapping("/unregister-event/{eventId}")
    public ResponseEntity<String> unregisterEvent(HttpSession session, @PathVariable Long eventId) {
        try {
            Student student = checkStudentSession(session);
            return ResponseEntity.ok(studentService.unregisterEvent(session, eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET ALL EVENTS
    @GetMapping("/events")
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        return ResponseEntity.ok(studentService.getAllEvents());
    }

    // GET REGISTERED EVENTS
    @GetMapping("/registered-events")
    public ResponseEntity<List<EventDTO>> getRegisteredEvents(HttpSession session) {
        try {
            Student student = checkStudentSession(session);
            return ResponseEntity.ok(studentService.getRegisteredEvents(session));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    // GET ATTENDANCE
    @GetMapping("/events/{eventId}/attendance")
    public ResponseEntity<Boolean> getAttendance(HttpSession session, @PathVariable Long eventId) {
        try {
            Student student = checkStudentSession(session);
            return ResponseEntity.ok(studentService.getAttendance(session, eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }
}
