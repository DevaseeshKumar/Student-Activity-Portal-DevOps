package com.act.backend.repositories;

import com.act.backend.models.Event;
import com.act.backend.models.Faculty;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByFaculty(Faculty faculty);

}
