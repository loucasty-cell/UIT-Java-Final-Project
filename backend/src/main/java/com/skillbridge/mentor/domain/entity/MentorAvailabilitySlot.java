package com.skillbridge.mentor.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

/** A specific date and session start time in which an offering can be booked. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class MentorAvailabilitySlot {

    @Column(name = "available_date", nullable = false)
    private LocalDate date;

    @Column(name = "available_time", nullable = false)
    private LocalTime time;

    public MentorAvailabilitySlot(LocalDate date, LocalTime time) {
        this.date = date;
        this.time = time;
    }
}
