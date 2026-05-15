# 🎟️ Event Ticket Booking System - Backend Documentation

This documentation covers the backend architecture, security implementation, and API endpoints for the Event Ticket Booking System, developed using Vanilla PHP.

## 1. System Overview
The backend serves as a RESTful API for managing events, user registrations, and ticket bookings. It follows a modular structure with clear separation between routing, controllers, and configuration.

## 2. Technology Stack
- **Language**: PHP 8.1+
- **Database**: MySQL / MariaDB
- **Authentication**: Custom JWT (JSON Web Token) Implementation
- **Architecture**: RESTful API (JSON output)
- **Environment**: MAMP / XAMPP (Apache)

---

## 3. Security Implementation (Mandatory Requirements)

### 🔐 AES-256-GCM Encryption
As per the security constraints, sensitive data is encrypted using the **AES-256-GCM** algorithm before storage.

- **Encrypted Fields**:
    1. `users.email`: User personal data is protected to ensure privacy.
    2. `registrations.ticket_code`: Booking identifiers are encrypted to prevent tampering.
- **Implementation**:
    - **IV Generation**: A random 12-byte Initialization Vector is generated for every encryption.
    - **Authentication Tag**: GCM mode generates a tag to verify data integrity.
    - **Key Management**: The 256-bit (32-byte) secret key is stored in `backend/config/jwt.php` and loaded via `hex2bin()`. It is never hardcoded in controllers.

### 🔑 Password Hashing
- Passwords are **never encrypted**.
- They are hashed using `password_hash()` with the `PASSWORD_BCRYPT` algorithm.
- Verification is handled via `password_verify()`.

---

## 4. Database Schema
The system utilizes four main tables:
- `users`: Stores user credentials, roles (admin/user), and encrypted personal info.
- `events`: Stores event details (title, description, price, capacity, etc.).
- `categories`: Organizes events into types (Technology, Music, etc.).
- `registrations`: Maps users to events and stores encrypted ticket codes.

---

## 5. API Endpoints

### 🔑 Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user (Auto-encrypts email) |
| POST | `/api/auth/login` | Authenticate and receive a JWT |

### 👤 Profile & User Management
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Retrieve decrypted user profile data |
| PUT | `/api/users/profile` | Update user information |

### 📅 Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List all published events |
| GET | `/api/events/{id}` | Get specific event details |
| POST | `/api/events` | **(Admin)** Create a new event |
| DELETE | `/api/events/{id}` | **(Admin/Host)** Delete an event |

### 🎫 Tickets
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tickets/book` | Book a ticket (Generates encrypted code) |
| GET | `/api/tickets/user/{id}` | List all tickets for a specific user |

### 📊 Admin & Reporting
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/events` | List all events with management metadata |
| GET | `/api/admin/tickets` | List all registrations system-wide |
| GET | `/api/dashboard/stats` | **(Admin)** Aggregate statistics for the dashboard |
| GET | `/api/reports/ticket-sales` | Summary of revenue and ticket volume |
| GET | `/api/reports/event-attendance`| Attendance tracking by event |

---

## 6. How to Run (Local Environment)
1. **MAMP Setup**:
   - Point your document root or a symlink to the project folder.
   - Import `eventticket.sql` into your MySQL server.
   - Configure `backend/config/database.php` with your local DB credentials.
2. **Key Config**:
   - Ensure `ENCRYPTION_KEY` is set in `backend/config/jwt.php`.
3. **Usage**:
   - The API base URL is `http://localhost/eventticketing/backend/`.
   - All protected routes require an `Authorization: Bearer <token>` header.

---
**Instructor**: Melner Balce  
**Subject**: CS Elective 3 - Backend Development
