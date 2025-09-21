package com.act.backend.services;

import com.act.backend.dto.EventDTO;
import com.act.backend.models.Event;
import com.act.backend.models.Student;
import com.act.backend.models.StudentEvent;
import com.act.backend.repositories.EventRepository;
import com.act.backend.repositories.StudentRepository;
import com.act.backend.repositories.StudentEventRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepo;
    private final EventRepository eventRepo;
    private final StudentEventRepository studentEventRepo;

    // SIGNUP
    public String signup(Student student) {
        if (studentRepo.findByEmail(student.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        studentRepo.save(student);
        return "Signup successful";
    }

    // LOGIN
    public String login(String email, String password, HttpSession session) {
        Optional<Student> sOpt = studentRepo.findByEmail(email);
        if (sOpt.isPresent() && sOpt.get().getPassword().equals(password)) {
            session.setAttribute("student", sOpt.get());
            return "Login successful";
        }
        throw new RuntimeException("Invalid credentials");
    }

    // LOGOUT
    public void logout(HttpSession session) {
        session.invalidate();
    }

    // PROFILE
    public Student getProfile(HttpSession session) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");
        return s;
    }

    // REGISTER EVENT
    public String registerEvent(HttpSession session, Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        Event e = eventRepo.findById(eventId).orElseThrow();

        if (studentEventRepo.existsByStudentAndEvent(s, e)) {
            throw new RuntimeException("Already registered for this event");
        }

        StudentEvent se = new StudentEvent();
        se.setStudent(s);
        se.setEvent(e);
        se.setAttendance(null);
        studentEventRepo.save(se);

        return "Event registered successfully";
    }

    // UNREGISTER EVENT
    public String unregisterEvent(HttpSession session, Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        Event e = eventRepo.findById(eventId).orElseThrow();

        Optional<StudentEvent> seOpt = studentEventRepo.findByStudentAndEvent(s, e);
        if (seOpt.isPresent()) {
            studentEventRepo.delete(seOpt.get());
            return "Unregistered from event";
        } else {
            throw new RuntimeException("Event was not registered");
        }
    }

    // GET ALL EVENTS
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
                ))
                .toList();
    }

    // GET REGISTERED EVENTS
    public List<EventDTO> getRegisteredEvents(HttpSession session) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        List<StudentEvent> registrations = studentEventRepo.findByStudent(s);

        return registrations.stream()
                .map(se -> {
                    Event e = se.getEvent();
                    return new EventDTO(
                            e.getId(),
                            e.getName(),
                            e.getDescription(),
                            e.getDate(),
                            e.getVenue(),
                            e.getFaculty() != null ? e.getFaculty().getName() : "Unassigned",
                            e.getFaculty() != null ? e.getFaculty().getEmail() : null,
                            e.getFaculty() != null ? e.getFaculty().getDepartment() : null
                    );
                })
                .toList();
    }

    // GET ATTENDANCE
    public Boolean getAttendance(HttpSession session, Long eventId) {
        Student s = (Student) session.getAttribute("student");
        if (s == null) throw new RuntimeException("Unauthorized");

        return studentEventRepo.findAttendance(eventId, s.getId());
    }
    public Student updateStudent(Long id, Student updatedStudent) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // update only fields you allow to be changed
        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setDepartment(updatedStudent.getDepartment());
        student.setPhone(updatedStudent.getPhone());
        student.setGender(updatedStudent.getGender());

        return studentRepo.save(student);
    }
    public List<Map<String, Object>> getAllStudentsWithEventCount() {
    List<Student> students = studentRepo.findAll();
    List<Map<String, Object>> result = new ArrayList<>();

    for (Student s : students) {
        int eventCount = studentEventRepo.findByStudent(s).size();
        Map<String, Object> data = new HashMap<>();
        data.put("id", s.getId());
        data.put("name", s.getName());
        data.put("email", s.getEmail());
        data.put("phone", s.getPhone());
        data.put("gender", s.getGender());
        data.put("department", s.getDepartment());
        data.put("eventCount", eventCount);
        result.add(data);
    }

    return result;
}
// UPDATE OWN PROFILE
public Student updateOwnProfile(HttpSession session, Student updatedStudent) {
    Student s = (Student) session.getAttribute("student");
    if (s == null) throw new RuntimeException("Unauthorized");

    // fetch fresh entity from DB
    Student student = studentRepo.findById(s.getId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + s.getId()));

    // update only allowed fields
    student.setName(updatedStudent.getName());
    student.setDepartment(updatedStudent.getDepartment());
    student.setPhone(updatedStudent.getPhone());
    student.setGender(updatedStudent.getGender());

    Student saved = studentRepo.save(student);

    // also update session so new values reflect immediately
    session.setAttribute("student", saved);

    return saved;
}
// UPDATE PASSWORD
public String updatePassword(HttpSession session, String oldPassword, String newPassword) {
    Student s = (Student) session.getAttribute("student");
    if (s == null) throw new RuntimeException("Unauthorized");

    Student student = studentRepo.findById(s.getId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + s.getId()));

    // check old password
    if (!student.getPassword().equals(oldPassword)) {
        throw new RuntimeException("Incorrect old password");
    }

    // set new password
    student.setPassword(newPassword);
    studentRepo.save(student);

    // refresh session data
    session.setAttribute("student", student);

    return "Password updated successfully";
}

}
