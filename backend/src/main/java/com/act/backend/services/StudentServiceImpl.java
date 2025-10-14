package com.act.backend.services;

import com.act.backend.dto.EventDTO;
import com.act.backend.models.Event;
import com.act.backend.models.Student;
import com.act.backend.models.StudentEvent;
import com.act.backend.repositories.EventRepository;
import com.act.backend.repositories.StudentRepository;
import com.act.backend.repositories.StudentEventRepository;
import com.act.backend.services.StudentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepo;
    private final EventRepository eventRepo;
    private final StudentEventRepository studentEventRepo;

    // ---------------- AUTH ----------------

    @Override
    public String signup(Student student) {
        if (studentRepo.findByEmail(student.getEmail()).isPresent())
            throw new RuntimeException("Email already exists");
        studentRepo.save(student);
        return "Signup successful";
    }

    @Override
    public String login(String email, String password, HttpSession session) {
        Student student = studentRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!student.getPassword().equals(password))
            throw new RuntimeException("Invalid credentials");

        session.setAttribute("student", student);
        return "Login successful";
    }

    @Override
    public void logout(HttpSession session) {
        session.invalidate();
    }

    // ---------------- PROFILE ----------------

    @Override
    public Student getProfile(HttpSession session) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");
        return s;
    }

    @Override
    public Student updateOwnProfile(HttpSession session, Student updatedStudent) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        Student student = studentRepo.findById(s.getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(updatedStudent.getName());
        student.setPhone(updatedStudent.getPhone());
        student.setDepartment(updatedStudent.getDepartment());
        student.setGender(updatedStudent.getGender());

        Student saved = studentRepo.save(student);
        session.setAttribute("student", saved);
        return saved;
    }

    @Override
    public String updatePassword(HttpSession session, String oldPassword, String newPassword) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        Student student = studentRepo.findById(s.getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.getPassword().equals(oldPassword))
            throw new RuntimeException("Incorrect old password");

        student.setPassword(newPassword);
        studentRepo.save(student);
        session.setAttribute("student", student);
        return "Password updated successfully";
    }

    // ---------------- EVENT ----------------

    @Override
    public String registerEvent(HttpSession session, Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        Event e = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (studentEventRepo.existsByStudentAndEvent(s, e))
            throw new RuntimeException("Already registered");

        StudentEvent se = new StudentEvent();
        se.setStudent(s);
        se.setEvent(e);
        se.setAttendance(null);
        studentEventRepo.save(se);

        return "Event registered successfully";
    }

    @Override
    public String unregisterEvent(HttpSession session, Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        Event e = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        StudentEvent se = studentEventRepo.findByStudentAndEvent(s, e)
                .orElseThrow(() -> new RuntimeException("Not registered for this event"));

        studentEventRepo.delete(se);
        return "Unregistered from event";
    }

    @Override
    public List<EventDTO> getAllEvents() {
        return eventRepo.findAll().stream()
                .map(e -> new EventDTO(
                        e.getId(),
                        e.getName(),
                        e.getDescription(),
                        e.getDate(),
                        e.getVenue(),
                        e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned",
                        e.getFaculty() != null ? e.getFaculty().getEmail() : null,
                        e.getFaculty() != null ? e.getFaculty().getDepartment() : null
                )).toList();
    }

    @Override
    public List<EventDTO> getRegisteredEvents(HttpSession session) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        List<StudentEvent> regs = studentEventRepo.findByStudent(s);
        List<EventDTO> events = new ArrayList<>();

        for (StudentEvent se : regs) {
            Event e = se.getEvent();
            events.add(new EventDTO(
                    e.getId(),
                    e.getName(),
                    e.getDescription(),
                    e.getDate(),
                    e.getVenue(),
                    e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned",
                    e.getFaculty() != null ? e.getFaculty().getEmail() : null,
                    e.getFaculty() != null ? e.getFaculty().getDepartment() : null
            ));
        }

        return events;
    }

    @Override
    public Boolean getAttendance(HttpSession session, Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        return studentEventRepo.findAttendance(eventId, s.getId());
    }

    // ---------------- ADMIN ----------------

    @Override
    public Student updateStudent(Long id, Student updatedStudent) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setPhone(updatedStudent.getPhone());
        student.setDepartment(updatedStudent.getDepartment());
        student.setGender(updatedStudent.getGender());

        return studentRepo.save(student);
    }

    @Override
    public List<Map<String, Object>> getAllStudentsWithEventCount() {
        List<Student> students = studentRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Student s : students) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("email", s.getEmail());
            map.put("phone", s.getPhone());
            map.put("gender", s.getGender());
            map.put("department", s.getDepartment());
            map.put("eventCount", studentEventRepo.findByStudent(s).size());
            result.add(map);
        }

        return result;
    }
}
