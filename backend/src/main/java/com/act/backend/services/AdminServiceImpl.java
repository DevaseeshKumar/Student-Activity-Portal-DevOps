package com.act.backend.services;

import com.act.backend.dto.*;
import com.act.backend.models.*;
import com.act.backend.repositories.*;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepo;
    private final FacultyRepository facultyRepo;
    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final StudentEventRepository studentEventRepo;
    private final EmailService emailService;

    // ------------------- SESSION -------------------
    @Override
    public void checkAdminSession(HttpSession session) {
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin == null) {
            throw new RuntimeException("Not logged in");
        }
    }

    @Override
    public Admin getAdminFromSession(HttpSession session) {
        return (Admin) session.getAttribute("admin");
    }

    // ------------------- ADMIN -------------------
    @Override
    public Optional<Admin> authenticate(String email, String password) {
        return adminRepo.findByEmail(email)
                .filter(admin -> admin.getPassword().equals(password));
    }

    @Override
    public Admin updateProfile(Admin admin, Admin updated) {
        admin.setUsername(updated.getUsername());
        admin.setEmail(updated.getEmail());
        return adminRepo.save(admin);
    }

    @Override
    public boolean updatePassword(Admin admin, String currentPassword, String newPassword) {
        if (!admin.getPassword().equals(currentPassword)) return false;
        admin.setPassword(newPassword);
        adminRepo.save(admin);
        return true;
    }

    // ------------------- FACULTY -------------------
    @Override
    public List<Faculty> getUnapprovedFaculties() {
        return facultyRepo.findAll().stream().filter(f -> !f.isApproved()).toList();
    }

    @Override
    public List<FacultyDTO> getAllFaculties() {
        return facultyRepo.findAll().stream().map(f -> new FacultyDTO(
                f.getId(),
                f.getName(),
                f.getEmail(),
                f.getPhone(),
                f.getDepartment(),
                f.getGender(),
                f.isApproved(),
                (f.getEventsAssigned() == null) ? 0 : f.getEventsAssigned().size()
        )).toList();
    }

    @Override
    public String approveFaculty(Long id) {
        Faculty f = facultyRepo.findById(id).orElseThrow();
        f.setApproved(true);
        facultyRepo.save(f);
        String link = "http://localhost:5173/faculty/set-password?email=" + f.getEmail();
        emailService.sendEmail(f.getEmail(), "Faculty Approval", "Approved! Set password: " + link);
        return "Faculty approved and email sent";
    }

    @Override
    public String rejectFaculty(Long id, String reason) {
        Faculty f = facultyRepo.findById(id).orElseThrow();
        emailService.sendEmail(f.getEmail(), "Faculty Rejected", "Reason: " + reason);
        facultyRepo.delete(f);
        return "Faculty rejected and email sent";
    }

    @Override
    public FacultyDTO updateFaculty(Long id, FacultyDTO updatedFaculty) {
        Faculty saved = facultyRepo.findById(id).map(faculty -> {
            faculty.setName(updatedFaculty.getName());
            faculty.setEmail(updatedFaculty.getEmail());
            faculty.setPhone(updatedFaculty.getPhone());
            faculty.setDepartment(updatedFaculty.getDepartment());
            faculty.setGender(updatedFaculty.getGender());
            faculty.setApproved(updatedFaculty.isApproved());
            return facultyRepo.save(faculty);
        }).orElseThrow(() -> new RuntimeException("Faculty not found"));

        return new FacultyDTO(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getDepartment(),
                saved.getGender(),
                saved.isApproved(),
                (saved.getEventsAssigned() == null) ? 0 : saved.getEventsAssigned().size()
        );
    }

    @Override
    @Transactional
    public String deleteFaculty(Long facultyId, Long replacementFacultyId) {
        Faculty facultyToDelete = facultyRepo.findById(facultyId).orElseThrow(() -> new RuntimeException("Faculty not found"));
        List<Event> assignedEvents = eventRepo.findByFaculty(facultyToDelete);

        if (!assignedEvents.isEmpty() && replacementFacultyId == null) {
            throw new RuntimeException("Faculty has assigned events. Provide replacementFacultyId.");
        }

        if (replacementFacultyId != null) {
            Faculty replacementFaculty = facultyRepo.findById(replacementFacultyId).orElseThrow(() -> new RuntimeException("Replacement faculty not found"));
            assignedEvents.forEach(e -> { e.setFaculty(replacementFaculty); eventRepo.save(e); });
        }

        facultyRepo.delete(facultyToDelete);
        return "Faculty deleted successfully";
    }

    // ------------------- STUDENT -------------------
    @Override
public List<StudentWithEventsDTO> getAllStudentsWithEvents() {
    List<Student> students = studentRepo.findAll();

    return students.stream().map(s -> {
        List<String> events = studentEventRepo.findByStudent(s)
                .stream()
                .map(se -> se.getEvent().getName())
                .toList();

        return new StudentWithEventsDTO(
                s.getId(),
                s.getName(),
                s.getEmail(),
                s.getPhone(),
                s.getDepartment(),
                s.getGender(),
                events
        );
    }).toList();
}



@Override
@Transactional
public Student updateStudent(Long id, Student updatedStudent) {
    return studentRepo.findById(id).map(student -> {
        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setPhone(updatedStudent.getPhone());
        student.setDepartment(updatedStudent.getDepartment());
        student.setGender(updatedStudent.getGender());
        // registeredEvents NOT updated here
        return studentRepo.save(student);
    }).orElseThrow(() -> new RuntimeException("Student not found"));
}





   @Override
@Transactional
public String deleteStudent(Long id) {
    Student student = studentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    // Clear all registered events
    student.getRegisteredEvents().clear();

    // Delete student
    studentRepo.delete(student);

    return "Student and registered events deleted successfully";
}



    // ------------------- EVENT -------------------
    @Override
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

    @Override
    public Event addEvent(Map<String, Object> body) {
        Event event = new Event();
        event.setName((String) body.get("name"));
        event.setVenue((String) body.get("venue"));
        event.setDate((String) body.get("date"));
        event.setDescription((String) body.get("description"));

        Long facultyId = body.get("facultyId") != null ? Long.valueOf(body.get("facultyId").toString()) : null;
        if (facultyId != null) {
            Faculty faculty = facultyRepo.findById(facultyId).orElse(null);
            if (faculty != null) {
                event.setFaculty(faculty);
                emailService.sendEmail(faculty.getEmail(), "New Event Assigned", "You have been assigned to event: " + event.getName() + " on " + event.getDate());
            }
        }

        return eventRepo.save(event);
    }

    @Override
    public Event updateEvent(Long id, Map<String, Object> body) {
        Event event = eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));

        if (body.containsKey("name")) event.setName((String) body.get("name"));
        if (body.containsKey("venue")) event.setVenue((String) body.get("venue"));
        if (body.containsKey("date")) event.setDate((String) body.get("date"));
        if (body.containsKey("description")) event.setDescription((String) body.get("description"));
        if (body.containsKey("facultyId")) {
            Long facultyId = body.get("facultyId") != null ? Long.valueOf(body.get("facultyId").toString()) : null;
            event.setFaculty(facultyId != null ? facultyRepo.findById(facultyId).orElse(null) : null);
        }

        return eventRepo.save(event);
    }

    @Override
    @Transactional
    public String deleteEvent(Long id) {
        Event event = eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        studentEventRepo.deleteByEvent(event);
        event.setFaculty(null);
        eventRepo.save(event);
        eventRepo.delete(event);
        return "Event deleted successfully";
    }

    @Override
    public List<StudentAttendanceDTO> getStudentsByEvent(Long eventId) {
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        return studentEventRepo.findByEvent(event).stream().map(se -> {
            Student s = se.getStudent();
            return new StudentAttendanceDTO(s.getId(), s.getName(), s.getEmail(), s.getPhone(), s.getDepartment(), se.getAttendance());
        }).toList();
    }

    @Override
    public String reassignEvent(Long eventId, Long newFacultyId) {
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        Faculty faculty = facultyRepo.findById(newFacultyId).orElseThrow(() -> new RuntimeException("Faculty not found"));
        event.setFaculty(faculty);
        eventRepo.save(event);
        return "Event reassigned successfully";
    }
}
