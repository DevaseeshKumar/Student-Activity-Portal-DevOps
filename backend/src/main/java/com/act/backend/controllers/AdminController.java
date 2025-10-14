package com.act.backend.controllers;

import com.act.backend.dto.*;
import com.act.backend.models.*;
import com.act.backend.services.AdminService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")

public class AdminController {
    @Autowired
    private AdminService adminService;

    // ------------------- LOGIN / LOGOUT -------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        var adminOpt = adminService.authenticate(req.getEmail(), req.getPassword());
        if (adminOpt.isPresent()) {
            session.setAttribute("admin", adminOpt.get());
            return ResponseEntity.ok(adminOpt.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }

    // ------------------- PROFILE -------------------
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.getAdminFromSession(session));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(HttpSession session, @RequestBody Admin updated) {
        try {
            adminService.checkAdminSession(session);
            Admin admin = adminService.getAdminFromSession(session);
            return ResponseEntity.ok(adminService.updateProfile(admin, updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(HttpSession session, @RequestBody Map<String, String> body) {
        try {
            adminService.checkAdminSession(session);
            Admin admin = adminService.getAdminFromSession(session);
            boolean success = adminService.updatePassword(admin, body.get("currentPassword"), body.get("newPassword"));
            if (!success) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password incorrect");
            return ResponseEntity.ok("Password updated");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ------------------- FACULTY -------------------
    @GetMapping("/unapproved-faculties")
    public ResponseEntity<?> getUnapprovedFaculties(HttpSession session) {
        try {
            adminService.checkAdminSession(session);
            List<Faculty> list = adminService.getUnapprovedFaculties();
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/faculties")
    public ResponseEntity<?> getAllFaculties(HttpSession session) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.getAllFaculties());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PutMapping("/approve-faculty/{id}")
    public ResponseEntity<?> approveFaculty(HttpSession session, @PathVariable Long id) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.approveFaculty(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PutMapping("/reject-faculty/{id}")
    public ResponseEntity<?> rejectFaculty(HttpSession session, @PathVariable Long id, @RequestParam String reason) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.rejectFaculty(id, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PutMapping("/faculties/{id}")
    public ResponseEntity<?> updateFaculty(HttpSession session, @PathVariable Long id, @RequestBody FacultyDTO updatedFaculty) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.updateFaculty(id, updatedFaculty));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/faculties/{facultyId}")
    public ResponseEntity<?> deleteFaculty(HttpSession session,
                                           @PathVariable Long facultyId,
                                           @RequestParam(required = false) Long replacementFacultyId) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.deleteFaculty(facultyId, replacementFacultyId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ------------------- STUDENTS -------------------
    @GetMapping("/students")
public ResponseEntity<?> getAllStudents(HttpSession session) {
    try {
        adminService.checkAdminSession(session);
        return ResponseEntity.ok(adminService.getAllStudentsWithEvents());
    } catch (RuntimeException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }
}



    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(HttpSession session, @PathVariable Long id, @RequestBody Student updatedStudent) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.updateStudent(id, updatedStudent));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(HttpSession session, @PathVariable Long id) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.deleteStudent(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ------------------- EVENTS -------------------
    @GetMapping("/events")
    public ResponseEntity<?> getAllEvents(HttpSession session) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.getAllEvents());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/create-event")
    public ResponseEntity<?> addEvent(HttpSession session, @RequestBody Map<String, Object> body) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.addEvent(body));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(HttpSession session, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.updateEvent(id, body));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(HttpSession session, @PathVariable Long id) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.deleteEvent(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/events/{eventId}/students")
    public ResponseEntity<?> getStudentsByEvent(HttpSession session, @PathVariable Long eventId) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.getStudentsByEvent(eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/events/{eventId}/reassign/{newFacultyId}")
    public ResponseEntity<?> reassignEvent(HttpSession session, @PathVariable Long eventId, @PathVariable Long newFacultyId) {
        try {
            adminService.checkAdminSession(session);
            return ResponseEntity.ok(adminService.reassignEvent(eventId, newFacultyId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
