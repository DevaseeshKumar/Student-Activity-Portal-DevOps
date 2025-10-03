package com.act.backend.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.act.backend.models.Event;
import com.act.backend.models.Student;
import com.act.backend.models.StudentEvent;

@Repository
public interface StudentEventRepository extends JpaRepository<StudentEvent, Long> {

    // ✅ Add this method so you can check if a student is already registered for an event
    boolean existsByStudentAndEvent(Student student, Event event);
    // ✅ get all events registered by a student
    List<StudentEvent> findByStudent(Student student);
    Optional<StudentEvent> findByStudentAndEvent(Student student, Event event);
    List<StudentEvent> findByEvent(Event event);
    @Modifying
    @Transactional
    @Query(value = "UPDATE student_event SET attendance = :present WHERE event_id = :eventId AND student_id = :studentId", nativeQuery = true)
    void updateAttendance(Long eventId, Long studentId, Boolean present);

    @Query(value = "SELECT attendance FROM student_event WHERE event_id = :eventId AND student_id = :studentId", nativeQuery = true)
    Boolean findAttendance(Long eventId, Long studentId);
    void deleteByEvent(Event event);
}
