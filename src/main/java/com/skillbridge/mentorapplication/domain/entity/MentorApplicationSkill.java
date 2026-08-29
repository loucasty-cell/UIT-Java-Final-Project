package com.skillbridge.mentorapplication.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "mentor_application_skills")
@IdClass(MentorApplicationSkill.MentorApplicationSkillId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MentorApplicationSkill {

    @Id
    @Column(name = "application_id", nullable = false)
    private UUID applicationId;

    @Id
    @Column(name = "skill_id", nullable = false)
    private UUID skillId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorApplicationSkillId implements Serializable {
        private UUID applicationId;
        private UUID skillId;
    }
}
