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

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        Optional<Admin> adminOpt = adminRepo.findByEmail(req.getEmail());
        if (adminOpt.isPresent() && adminOpt.get().getPassword().equals(req.getPassword())) {
            session.setAttribute("admin", adminOpt.get());
            return ResponseEntity.ok(adminOpt.get()); // return Admin object
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }

    // PROFILE
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin == null) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.ok(admin);
    }

    @PutMapping("/update")
public ResponseEntity<Admin> updateProfile(HttpSession session, @RequestBody Admin updated) {
    Admin admin = (Admin) session.getAttribute("admin");
    if (admin == null) return ResponseEntity.status(401).build();

    // ✅ use username not name
    admin.setUsername(updated.getUsername());
    admin.setEmail(updated.getEmail());

    return ResponseEntity.ok(adminRepo.save(admin));
}



    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(HttpSession session,
                                            @RequestBody Map<String, String> body) {
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin == null) return ResponseEntity.status(401).body("Not logged in");
        if (!admin.getPassword().equals(body.get("currentPassword")))
            return ResponseEntity.status(400).body("Current password incorrect");
        admin.setPassword(body.get("newPassword"));
        adminRepo.save(admin);
        return ResponseEntity.ok("Password updated");
    }

    // FACULTY APPROVALS
    @GetMapping("/unapproved-faculties")
    public List<Faculty> getUnapprovedFaculties() {
        return facultyRepo.findAll().stream().filter(f -> !f.isApproved()).toList();
    }

    @PutMapping("/approve-faculty/{id}")
public ResponseEntity<String> approveFaculty(@PathVariable Long id) {
    Faculty f = facultyRepo.findById(id).orElseThrow();
    f.setApproved(true);
    facultyRepo.save(f);

    // ✅ send correct frontend link for password setup
    String link = "http://localhost:5173/faculty/set-password?email=" + f.getEmail();
    emailService.sendEmail(
            f.getEmail(),
            "Faculty Approval",
            "Congratulations! Your registration has been approved. Please set your password here: " + link
    );

    return ResponseEntity.ok("Faculty approved and email sent");
}

@PutMapping("/reject-faculty/{id}")
public ResponseEntity<String> rejectFaculty(@PathVariable Long id, @RequestParam String reason) {
    Faculty f = facultyRepo.findById(id).orElseThrow();

    // ✅ send rejection email first
    emailService.sendEmail(
            f.getEmail(),
            "Faculty Registration Rejected",
            "We regret to inform you that your registration was rejected.\nReason: " + reason
    );

    // then remove faculty
    facultyRepo.delete(f);

    return ResponseEntity.ok("Faculty rejected and email sent");
}


    @GetMapping("/faculties")
public List<FacultyDTO> getAllFaculties() {
    return facultyRepo.findAll().stream().map(f -> new FacultyDTO(
        f.getId(),
        f.getName(),
        f.getEmail(),
        f.getPhone(),
        f.getDepartment(),
        f.getGender(),
        f.isApproved(),
        (f.getEventsAssigned() == null) ? 0 : f.getEventsAssigned().size() // ✅ NEW
    )).toList();
}



    @GetMapping("/students")
public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
    return ResponseEntity.ok(studentService.getAllStudentsWithEventCount());
}


   @PostMapping("/create-event")
public ResponseEntity<Event> addEvent(@RequestBody Map<String, Object> body) {
    String name = (String) body.get("name");
    String venue = (String) body.get("venue");
    String date = (String) body.get("date");
    String description = (String) body.get("description"); // <-- add this
    Long facultyId = body.get("facultyId") != null ? Long.valueOf(body.get("facultyId").toString()) : null;

    Event event = new Event();
    event.setName(name);
    event.setVenue(venue);
    event.setDate(date);
    event.setDescription(description); // <-- set it here

    if (facultyId != null) {
        Faculty faculty = facultyRepo.findById(facultyId).orElse(null);
        if (faculty != null) {
            event.setFaculty(faculty);
            emailService.sendEmail(
                faculty.getEmail(),
                "New Event Assigned",
                "You have been assigned to event: " + name + " on " + date
            );
        }
    }

    Event saved = eventRepo.save(event);
    return ResponseEntity.ok(saved);
}



    @GetMapping("/events")
public List<EventDTO> getAllEvents() {
    return eventRepo.findAll().stream().map(e -> {
        EventDTO dto = new EventDTO();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setDescription(e.getDescription());
        dto.setDate(e.getDate());
        dto.setVenue(e.getVenue());
        dto.setFacultyName(e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned");
        return dto;
    }).toList();
}

@GetMapping("/events/{eventId}/students")
public ResponseEntity<?> getStudentsByEvent(@PathVariable Long eventId) {
    Event event = eventRepo.findById(eventId).orElse(null);
    if (event == null) {
        return ResponseEntity.status(404).body("Event not found");
    }

    List<StudentEvent> studentEvents = studentEventRepo.findByEvent(event);

    List<StudentAttendanceDTO> response = studentEvents.stream().map(se -> {
        Student s = se.getStudent();
        return new StudentAttendanceDTO(
                s.getId(),
                s.getName(),
                s.getEmail(),
                s.getPhone(),
                s.getDepartment(),
                se.getAttendance()
        );
    }).toList();

    return ResponseEntity.ok(response);
}

// ✅ Update Event
@PutMapping("/events/{id}")
public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Map<String, Object> body) {
    Event event = eventRepo.findById(id).orElse(null);
    if (event == null) {
        return ResponseEntity.status(404).body("Event not found");
    }

    // Update fields if provided
    if (body.containsKey("name")) {
        event.setName((String) body.get("name"));
    }
    if (body.containsKey("venue")) {
        event.setVenue((String) body.get("venue"));
    }
    if (body.containsKey("date")) {
        event.setDate((String) body.get("date"));
    }
    if (body.containsKey("description")) {
        event.setDescription((String) body.get("description"));
    }
    if (body.containsKey("facultyId")) {
        Long facultyId = body.get("facultyId") != null ? Long.valueOf(body.get("facultyId").toString()) : null;
        if (facultyId != null) {
            Faculty faculty = facultyRepo.findById(facultyId).orElse(null);
            if (faculty != null) {
                event.setFaculty(faculty);
            }
        } else {
            event.setFaculty(null); // remove faculty assignment
        }
    }

    Event updated = eventRepo.save(event);
    return ResponseEntity.ok(updated);
}
@DeleteMapping("/events/{id}")
public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
    if (!eventRepo.existsById(id)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");
    }
    eventRepo.deleteById(id);
    return ResponseEntity.ok("Event deleted successfully");
}


// ✅ DELETE Faculty (with optional reassignment)
    @DeleteMapping("/faculties/{facultyId}")
    public ResponseEntity<String> deleteFaculty(
            @PathVariable Long facultyId,
            @RequestParam(required = false) Long replacementFacultyId) {

        // Find faculty to delete
        Faculty facultyToDelete = facultyRepo.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found with id: " + facultyId));

        // Find all events assigned to this faculty
        List<Event> assignedEvents = eventRepo.findByFaculty(facultyToDelete);

        // Case 1: Faculty has events
        if (!assignedEvents.isEmpty()) {
            if (replacementFacultyId == null) {
                return ResponseEntity.badRequest()
                        .body("Faculty has assigned events. Please provide replacementFacultyId.");
            }

            Faculty replacementFaculty = facultyRepo.findById(replacementFacultyId)
                    .orElseThrow(() -> new RuntimeException("Replacement faculty not found with id: " + replacementFacultyId));

            // Reassign events
            for (Event event : assignedEvents) {
                event.setFaculty(replacementFaculty);
                eventRepo.save(event);
            }
        }

        // Case 2: Faculty has no events → delete directly
        facultyRepo.delete(facultyToDelete);

        return ResponseEntity.ok("Faculty deleted successfully.");
    }

@PutMapping("/faculties/{id}")
public ResponseEntity<FacultyDTO> updateFaculty(@PathVariable Long id, @RequestBody FacultyDTO updatedFaculty) {
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

@PutMapping("/events/{eventId}/reassign/{newFacultyId}")
public ResponseEntity<?> reassignEvent(
    @PathVariable Long eventId,
    @PathVariable Long newFacultyId
) {
    Event event = eventRepo.findById(eventId)
        .orElseThrow(() -> new RuntimeException("Event not found"));
    Faculty faculty = facultyRepo.findById(newFacultyId)
        .orElseThrow(() -> new RuntimeException("Faculty not found"));

    event.setFaculty(faculty);
    eventRepo.save(event);

    return ResponseEntity.ok("Event reassigned successfully");
}
@DeleteMapping("/students/{id}")
@Transactional
public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
    Student student = studentRepo.findById(id).orElse(null);
    if (student == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
    }

    // Delete student-event associations first
    studentEventRepo.deleteAll(studentEventRepo.findByStudent(student));

    // Now delete student
    studentRepo.delete(student);

    return ResponseEntity.ok("Student and registered events deleted successfully");
}

@PutMapping("/students/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student updatedStudent) {

        Student student = studentService.updateStudent(id, updatedStudent);
        return ResponseEntity.ok(student);
    }

}
