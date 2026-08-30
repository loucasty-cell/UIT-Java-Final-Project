package com.skillbridge.session.domain.entity;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.swap.domain.entity.SwapSession;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "session_confirmations")
@Getter
@Setter
public class SessionConfirmation {

    @Id
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private SwapSession session;

    @Column(name = "confirmed_by", nullable = false)
    private UUID confirmedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by", insertable = false, updatable = false)
    private User user;

    @Column(name = "confirmed_at", nullable = false)
    private OffsetDateTime confirmedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (confirmedAt == null) {
            confirmedAt = OffsetDateTime.now();
        }
    }
}

