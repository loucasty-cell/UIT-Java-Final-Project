package com.skillbridge.mentor.infrastructure.persistence;

import com.skillbridge.mentor.domain.entity.MentorOffering;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorOfferingRepository extends JpaRepository<MentorOffering, UUID> {
    Page<MentorOffering> findByMentorId(UUID mentorId, Pageable pageable);
    List<MentorOffering> findByMentorId(UUID mentorId);
    List<MentorOffering> findByMentorIdAndActiveTrue(UUID mentorId);
    List<MentorOffering> findByActiveTrue();
}
