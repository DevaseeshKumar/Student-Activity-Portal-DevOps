package com.act.backend.controllers;

import com.act.backend.dto.ContactRequest;
import com.act.backend.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<String> sendContactMessage(@RequestBody ContactRequest request) {
        String adminEmail = "thorodinsonuru@gmail.com"; // <-- replace with your receiving email
        String subject = "New Contact Inquiry from " + request.getName();
        String body = "From: " + request.getName() + " <" + request.getEmail() + ">\n\n"
                    + request.getMessage();

        emailService.sendEmail(adminEmail, subject, body);
        return ResponseEntity.ok("Message sent successfully!");
    }
}
