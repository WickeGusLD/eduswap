-- Courses table (Dynamic)
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200),
    instructor VARCHAR(100),
    time_slot VARCHAR(100),
    credits INT DEFAULT 3
);

-- Swap Requests table
-- removed foreign key for user_id to support anonymous strings/sessions
CREATE TABLE swap_requests (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL, 
    have_course_id VARCHAR(50) NOT NULL,
    want_course_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    match_type VARCHAR(20),
    FOREIGN KEY (have_course_id) REFERENCES courses(id),
    FOREIGN KEY (want_course_id) REFERENCES courses(id)
);
