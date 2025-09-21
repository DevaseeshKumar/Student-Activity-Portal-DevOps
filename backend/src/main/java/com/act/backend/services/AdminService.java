package com.act.backend.services;

import com.act.backend.dto.LoginRequest;
import com.act.backend.models.*;
import com.act.backend.repositories.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepo;
    private final FacultyRepository facultyRepo;
    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final EmailService emailService;

    // ✅ Authenticate Admin
    public Optional<Admin> authenticate(String email, String password) {
        return adminRepo.findByEmail(email)
                .filter(admin -> admin.getPassword().equals(password));
    }

    // ✅ Update profile
    public Admin updateProfile(Admin admin, Admin updated) {
        admin.setUsername(updated.getUsername());
        admin.setEmail(updated.getEmail());
        return adminRepo.save(admin);
    }

    // ✅ Update password
    public boolean updatePassword(Admin admin, String currentPassword, String newPassword) {
        if (!admin.getPassword().equals(currentPassword)) {
            return false;
        }
        admin.setPassword(newPassword);
        adminRepo.save(admin);
        return true;
    }

    // ✅ Faculties
    public List<Faculty> getUnapprovedFaculties() {
        return facultyRepo.findAll().stream().filter(f -> !f.isApproved()).toList();
    }

    public String approveFaculty(Long id) {
        Faculty f = facultyRepo.findById(id).orElseThrow();
        f.setApproved(true);
        facultyRepo.save(f);
        emailService.sendEmail(
                f.getEmail(),
                "Faculty Approval",
                "Congratulations " + f.getName() + ", your account has been approved.\n" +
                        "Set your password here: http://localhost:5173/set-faculty-password?email=" + f.getEmail()
        );
        return "Faculty approved and email sent";
    }

    public String rejectFaculty(Long id, String reason) {
        Faculty f = facultyRepo.findById(id).orElseThrow();
        facultyRepo.delete(f);
        emailService.sendEmail(
                f.getEmail(),
                "Faculty Rejected",
                "Sorry " + f.getName() + ", your account was rejected.\nReason: " + reason
        );
        return "Faculty rejected and email sent";
    }

    public List<Faculty> getAllFaculties() {
        return facultyRepo.findAll();
    }

    // ✅ Students
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    // ✅ Events
    public Event addEvent(Event e) {
        return eventRepo.save(e);
    }

    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }
}
