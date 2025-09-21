package com.act.backend.services;

import com.act.backend.models.Faculty;
import com.act.backend.models.Event;
import com.act.backend.models.Student;
import com.act.backend.models.StudentEvent;
import com.act.backend.dto.EventDTO;
import com.act.backend.dto.StudentAttendanceDTO;
import com.act.backend.repositories.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepository facultyRepo;
    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final StudentEventRepository studentEventRepo;

    // ✅ Faculty Registration
    public String register(Faculty faculty) {
        faculty.setApproved(false);
        faculty.setPassword(null); // no password until approved
        facultyRepo.save(faculty);
        return "Faculty registered. Wait for admin approval.";
    }

    // ✅ Faculty Login
    public Faculty login(String email, String password) {
        Faculty faculty = facultyRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!faculty.isApproved()) throw new RuntimeException("Not approved yet");
        if (faculty.getPassword() == null) throw new RuntimeException("Password not set yet");
        if (!faculty.getPassword().equals(password)) throw new RuntimeException("Invalid credentials");

        return faculty;
    }

    // ✅ Profile Update
    public Faculty updateProfile(Faculty existing, Faculty updated) {
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        existing.setGender(updated.getGender());
        return facultyRepo.save(existing);
    }

    // ✅ Update Password
    public void updatePassword(Faculty faculty, String currentPassword, String newPassword) {
        if (faculty.getPassword() == null || !faculty.getPassword().equals(currentPassword)) {
            throw new RuntimeException("Current password incorrect");
        }
        faculty.setPassword(newPassword);
        facultyRepo.save(faculty);
    }

    // ✅ Set Password (after approval link)
    public void setPassword(String email, String password) {
        Faculty f = facultyRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        f.setPassword(password);
        facultyRepo.save(f);
    }

    // ✅ Assigned Events
    @Transactional
    public List<EventDTO> getAssignedEvents(Faculty faculty) {
        return faculty.getEventsAssigned().stream()
                .map(e -> new EventDTO(
                        e.getId(),
                        e.getName(),
                        e.getDescription(),
                        e.getDate(),
                        e.getVenue(),
                        faculty.getName(),
                        faculty.getEmail(),
                        faculty.getDepartment()
                ))
                .toList();
    }

    // ✅ Students for Event
    public List<StudentAttendanceDTO> getStudentsByEvent(Faculty faculty, Long eventId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getFaculty().getId().equals(faculty.getId())) {
            throw new RuntimeException("Unauthorized access to this event");
        }

        return studentEventRepo.findByEvent(event).stream()
                .map(se -> new StudentAttendanceDTO(
                        se.getStudent().getId(),
                        se.getStudent().getName(),
                        se.getStudent().getEmail(),
                        se.getStudent().getPhone(),
                        se.getStudent().getDepartment(),
                        se.getAttendance()
                ))
                .toList();
    }

    // ✅ Mark Attendance
    @Transactional
    public void markAttendance(Faculty faculty, Long eventId, Long studentId, Boolean present) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getFaculty().getId().equals(faculty.getId())) {
            throw new RuntimeException("Unauthorized access to this event");
        }

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Optional<StudentEvent> studentEventOpt = studentEventRepo.findByStudentAndEvent(student, event);
        if (studentEventOpt.isEmpty()) {
            throw new RuntimeException("Student not registered for this event");
        }

        studentEventRepo.updateAttendance(eventId, studentId, present);
    }
}
