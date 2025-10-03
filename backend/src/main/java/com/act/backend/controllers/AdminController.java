package com.act.backend.controllers;

import com.act.backend.models.*;
import com.act.backend.repositories.*;
import com.act.backend.dto.*;
import com.act.backend.services.EmailService;
import com.act.backend.services.StudentService;

import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminRepository adminRepo;
    private final FacultyRepository facultyRepo;
    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final EmailService emailService;
    private final StudentEventRepository studentEventRepo;
    private final StudentService studentService;

    // ------------------- SESSION CHECK -------------------
    private ResponseEntity<String> checkAdminSession(HttpSession session) {
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }
        return null; // session valid
    }

    private Admin getAdminFromSession(HttpSession session) {
        return (Admin) session.getAttribute("admin");
    }

    // ------------------- LOGIN / LOGOUT -------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        Optional<Admin> adminOpt = adminRepo.findByEmail(req.getEmail());
        if (adminOpt.isPresent() && adminOpt.get().getPassword().equals(req.getPassword())) {
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
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;
        return ResponseEntity.ok(getAdminFromSession(session));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(HttpSession session, @RequestBody Admin updated) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Admin admin = getAdminFromSession(session);
        admin.setUsername(updated.getUsername());
        admin.setEmail(updated.getEmail());

        return ResponseEntity.ok(adminRepo.save(admin));
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(HttpSession session, @RequestBody Map<String, String> body) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Admin admin = getAdminFromSession(session);
        if (!admin.getPassword().equals(body.get("currentPassword"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password incorrect");
        }
        admin.setPassword(body.get("newPassword"));
        adminRepo.save(admin);
        return ResponseEntity.ok("Password updated");
    }

    // ------------------- FACULTY -------------------
    @GetMapping("/unapproved-faculties")
    public ResponseEntity<?> getUnapprovedFaculties(HttpSession session) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        List<Faculty> list = facultyRepo.findAll().stream().filter(f -> !f.isApproved()).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/faculties")
    public ResponseEntity<?> getAllFaculties(HttpSession session) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        List<FacultyDTO> faculties = facultyRepo.findAll().stream().map(f -> new FacultyDTO(
                f.getId(),
                f.getName(),
                f.getEmail(),
                f.getPhone(),
                f.getDepartment(),
                f.getGender(),
                f.isApproved(),
                (f.getEventsAssigned() == null) ? 0 : f.getEventsAssigned().size()
        )).toList();

        return ResponseEntity.ok(faculties);
    }

    @PutMapping("/approve-faculty/{id}")
    public ResponseEntity<?> approveFaculty(HttpSession session, @PathVariable Long id) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Faculty f = facultyRepo.findById(id).orElseThrow();
        f.setApproved(true);
        facultyRepo.save(f);

        String link = "http://localhost:5173/faculty/set-password?email=" + f.getEmail();
        emailService.sendEmail(f.getEmail(), "Faculty Approval", "Approved! Set password: " + link);

        return ResponseEntity.ok("Faculty approved and email sent");
    }

    @PutMapping("/reject-faculty/{id}")
    public ResponseEntity<?> rejectFaculty(HttpSession session, @PathVariable Long id, @RequestParam String reason) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Faculty f = facultyRepo.findById(id).orElseThrow();
        emailService.sendEmail(f.getEmail(), "Faculty Rejected", "Reason: " + reason);
        facultyRepo.delete(f);

        return ResponseEntity.ok("Faculty rejected and email sent");
    }

    @PutMapping("/faculties/{id}")
    public ResponseEntity<?> updateFaculty(HttpSession session, @PathVariable Long id, @RequestBody FacultyDTO updatedFaculty) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        return facultyRepo.findById(id)
                .map(faculty -> {
                    faculty.setName(updatedFaculty.getName());
                    faculty.setEmail(updatedFaculty.getEmail());
                    faculty.setPhone(updatedFaculty.getPhone());
                    faculty.setDepartment(updatedFaculty.getDepartment());
                    faculty.setGender(updatedFaculty.getGender());
                    faculty.setApproved(updatedFaculty.isApproved());

                    Faculty saved = facultyRepo.save(faculty);

                    FacultyDTO dto = new FacultyDTO(
                            saved.getId(),
                            saved.getName(),
                            saved.getEmail(),
                            saved.getPhone(),
                            saved.getDepartment(),
                            saved.getGender(),
                            saved.isApproved(),
                            (saved.getEventsAssigned() == null) ? 0 : saved.getEventsAssigned().size()
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/faculties/{facultyId}")
    public ResponseEntity<?> deleteFaculty(HttpSession session, @PathVariable Long facultyId,
                                           @RequestParam(required = false) Long replacementFacultyId) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Faculty facultyToDelete = facultyRepo.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        List<Event> assignedEvents = eventRepo.findByFaculty(facultyToDelete);
        if (!assignedEvents.isEmpty()) {
            if (replacementFacultyId == null) {
                return ResponseEntity.badRequest().body("Faculty has assigned events. Provide replacementFacultyId.");
            }
            Faculty replacementFaculty = facultyRepo.findById(replacementFacultyId)
                    .orElseThrow(() -> new RuntimeException("Replacement faculty not found"));
            assignedEvents.forEach(e -> { e.setFaculty(replacementFaculty); eventRepo.save(e); });
        }

        facultyRepo.delete(facultyToDelete);
        return ResponseEntity.ok("Faculty deleted successfully");
    }

    // ------------------- STUDENTS -------------------
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(HttpSession session) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        return ResponseEntity.ok(studentService.getAllStudentsWithEventCount());
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(HttpSession session, @PathVariable Long id, @RequestBody Student updatedStudent) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Student student = studentService.updateStudent(id, updatedStudent);
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/students/{id}")
    @Transactional
    public ResponseEntity<?> deleteStudent(HttpSession session, @PathVariable Long id) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Student student = studentRepo.findById(id).orElse(null);
        if (student == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");

        studentEventRepo.deleteAll(studentEventRepo.findByStudent(student));
        studentRepo.delete(student);

        return ResponseEntity.ok("Student and registered events deleted successfully");
    }

    // ------------------- EVENTS -------------------
    @GetMapping("/events")
    public ResponseEntity<?> getAllEvents(HttpSession session) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        List<EventDTO> events = eventRepo.findAll().stream().map(e -> {
            EventDTO dto = new EventDTO();
            dto.setId(e.getId());
            dto.setName(e.getName());
            dto.setDescription(e.getDescription());
            dto.setDate(e.getDate());
            dto.setVenue(e.getVenue());
            dto.setFacultyName(e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned");
            return dto;
        }).toList();
        return ResponseEntity.ok(events);
    }

    @PostMapping("/create-event")
    public ResponseEntity<?> addEvent(HttpSession session, @RequestBody Map<String, Object> body) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        String name = (String) body.get("name");
        String venue = (String) body.get("venue");
        String date = (String) body.get("date");
        String description = (String) body.get("description");
        Long facultyId = body.get("facultyId") != null ? Long.valueOf(body.get("facultyId").toString()) : null;

        Event event = new Event();
        event.setName(name);
        event.setVenue(venue);
        event.setDate(date);
        event.setDescription(description);

        if (facultyId != null) {
            Faculty faculty = facultyRepo.findById(facultyId).orElse(null);
            if (faculty != null) {
                event.setFaculty(faculty);
                emailService.sendEmail(faculty.getEmail(), "New Event Assigned",
                        "You have been assigned to event: " + name + " on " + date);
            }
        }

        Event saved = eventRepo.save(event);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(HttpSession session, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Event event = eventRepo.findById(id).orElse(null);
        if (event == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");

        if (body.containsKey("name")) event.setName((String) body.get("name"));
        if (body.containsKey("venue")) event.setVenue((String) body.get("venue"));
        if (body.containsKey("date")) event.setDate((String) body.get("date"));
        if (body.containsKey("description")) event.setDescription((String) body.get("description"));
        if (body.containsKey("facultyId")) {
            Long facultyId = body.get("facultyId") != null ? Long.valueOf(body.get("facultyId").toString()) : null;
            event.setFaculty(facultyId != null ? facultyRepo.findById(facultyId).orElse(null) : null);
        }

        Event updated = eventRepo.save(event);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/events/{id}")
    @Transactional
    public ResponseEntity<?> deleteEvent(HttpSession session, @PathVariable Long id) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Event event = eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        studentEventRepo.deleteByEvent(event);
        event.setFaculty(null);
        eventRepo.save(event);
        eventRepo.delete(event);

        return ResponseEntity.ok("Event deleted successfully");
    }

    @GetMapping("/events/{eventId}/students")
    public ResponseEntity<?> getStudentsByEvent(HttpSession session, @PathVariable Long eventId) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Event event = eventRepo.findById(eventId).orElse(null);
        if (event == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");

        List<StudentEvent> studentEvents = studentEventRepo.findByEvent(event);

        List<StudentAttendanceDTO> response = studentEvents.stream().map(se -> {
            Student s = se.getStudent();
            return new StudentAttendanceDTO(s.getId(), s.getName(), s.getEmail(), s.getPhone(), s.getDepartment(), se.getAttendance());
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/events/{eventId}/reassign/{newFacultyId}")
    public ResponseEntity<?> reassignEvent(HttpSession session, @PathVariable Long eventId, @PathVariable Long newFacultyId) {
        ResponseEntity<String> check = checkAdminSession(session);
        if (check != null) return check;

        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        Faculty faculty = facultyRepo.findById(newFacultyId).orElseThrow(() -> new RuntimeException("Faculty not found"));

        event.setFaculty(faculty);
        eventRepo.save(event);

        return ResponseEntity.ok("Event reassigned successfully");
    }
}
