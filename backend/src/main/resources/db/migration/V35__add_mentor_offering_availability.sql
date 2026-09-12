CREATE TABLE mentor_offering_availability (
    offering_id UUID NOT NULL REFERENCES mentor_offerings(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    available_time TIME NOT NULL,
    PRIMARY KEY (offering_id, available_date, available_time)
);
