# Product Requirements Document: Congregation Ministry Tracker

## 1. Introduction/Overview

The Congregation Ministry Tracker is a web application designed to help users manage and track their ministry activities within their congregation. The app addresses the need for organized record-keeping of ministry visits and time spent in various congregation activities, providing users with a centralized system to manage their spiritual responsibilities.

**Problem Solved:** Currently, congregation members lack a dedicated digital tool to systematically track their ministry visits to individuals and time spent in congregation activities. This leads to scattered records, missed follow-ups, and difficulty in reviewing ministry progress over time.

**Goal:** Create an intuitive, secure web application that enables users to efficiently manage their ministry records, track visits to congregation members, and log time spent in various congregation activities.

## 2. Goals

- **Primary Goal:** Provide a simple, user-friendly interface for congregation members to track their ministry activities
- **Data Organization Goal:** Centralize all ministry-related records in one secure location
- **Accessibility Goal:** Enable users to access their records from any device with internet connectivity
- **Privacy Goal:** Ensure users can only access their own ministry records through secure authentication
- **Efficiency Goal:** Reduce administrative overhead by 50% compared to paper-based tracking methods

## 3. User Stories

### Core User Stories

1. **As a congregation member**, I want to create and manage records of people I visit, so that I can keep track of who I've visited and when.

2. **As a congregation member**, I want to add detailed visit notes for each person, so that I can remember important details about our conversations and follow-up needs.

3. **As a congregation member**, I want to log my ministry time by category, so that I can accurately track how much time I spend in different congregation activities.

4. **As a congregation member**, I want to securely log in and out of the app, so that my personal ministry records remain private and accessible only to me.

5. **As a congregation member**, I want to view a summary of my ministry activities, so that I can review my progress and identify areas for improvement.

### Extended User Stories

6. **As a congregation member**, I want to search and filter my person records, so that I can quickly find specific individuals or visit histories.

7. **As a congregation member**, I want to edit and update person information, so that I can keep contact details and notes current.

8. **As a congregation member**, I want to delete outdated records, so that my data remains clean and relevant.

## 4. Functional Requirements

### 4.1 Authentication System

**FR-1:** The system must provide secure user authentication using email and password credentials.
- **FR-1.1:** Users must be able to register with a valid email address and secure password
- **FR-1.2:** Users must be able to log in with their registered email and password
- **FR-1.3:** Users must be able to log out securely
- **FR-1.4:** The system must prevent unauthorized access to user data
- **FR-1.5:** Passwords must be encrypted and stored securely

### 4.2 Person Management

**FR-2:** The system must allow users to create, read, update, and delete person records.

**FR-3:** Each person record must contain the following required fields:
- **FR-3.1:** Name (text, required, max 100 characters)
- **FR-3.2:** Address (text, optional, max 500 characters)
- **FR-3.3:** Notes (text, optional, max 2000 characters)
- **FR-3.4:** Created timestamp (automatically generated)
- **FR-3.5:** Last updated timestamp (automatically updated)

**FR-4:** The system must provide the following person management capabilities:
- **FR-4.1:** Create new person records
- **FR-4.2:** View all person records in a list format
- **FR-4.3:** View detailed information for individual persons
- **FR-4.4:** Edit existing person records
- **FR-4.5:** Delete person records (with confirmation)
- **FR-4.6:** Search/filter person records by name

### 4.3 Visit Management

**FR-5:** The system must allow users to add visits to person records.

**FR-6:** Each visit must contain the following required fields:
- **FR-6.1:** VisitedAt (datetime, required)
- **FR-6.2:** Notes (text, optional, max 2000 characters)
- **FR-6.3:** Created timestamp (automatically generated)

**FR-7:** The system must provide the following visit management capabilities:
- **FR-7.1:** Add new visits to any person record
- **FR-7.2:** View all visits for a specific person in chronological order
- **FR-7.3:** Edit existing visit records
- **FR-7.4:** Delete visit records (with confirmation)
- **FR-7.5:** Display visit history with most recent visits first

### 4.4 Time Tracking

**FR-8:** The system must allow users to create, read, update, and delete time records.

**FR-9:** Each time record must contain the following required fields:
- **FR-9.1:** Type (enum: Ministry, LDC, Other, required)
- **FR-9.2:** RecordedOn (date, required)
- **FR-9.3:** Hours (integer, required, min 0, max 24)
- **FR-9.4:** Minutes (integer, required, min 0, max 59)
- **FR-9.5:** Created timestamp (automatically generated)
- **FR-9.6:** Last updated timestamp (automatically updated)

**FR-10:** The system must provide the following time management capabilities:
- **FR-10.1:** Create new time records
- **FR-10.2:** View all time records in chronological order
- **FR-10.3:** View time records filtered by type
- **FR-10.4:** View time records filtered by a specific month
- **FR-10.4:** View time records filtered by a specific service year (service years run from September 1 to August 31)
- **FR-10.5:** Edit existing time records
- **FR-10.6:** Delete time records (with confirmation)
- **FR-10.7:** Calculate and display total time by current filter

### 4.5 Data Privacy and Security

**FR-11:** The system must ensure data privacy through user isolation:
- **FR-11.1:** Users can only access their own person records
- **FR-11.2:** Users can only access their own visit records
- **FR-11.3:** Users can only access their own time records
- **FR-11.4:** No user can access another user's data under any circumstances

### 4.6 User Interface Requirements

**FR-12:** The system must provide an intuitive web-based interface:
- **FR-12.1:** Responsive design that works on desktop, tablet, and mobile devices
- **FR-12.2:** Clear navigation between Persons and Time sections
- **FR-12.3:** Form validation with helpful error messages
- **FR-12.4:** Confirmation dialogs for destructive actions (delete)
- **FR-12.5:** Loading states during data operations
- **FR-12.6:** Success notifications for completed actions

## 5. Non-Goals (Out of Scope)

The following features are explicitly **not** included in this version:

1. **Multi-user collaboration** - No sharing of records between users
2. **Reporting/analytics** - No advanced charts, graphs, or statistical analysis
3. **Data export/import** - No CSV, PDF, or other format exports
4. **Offline functionality** - Application requires internet connectivity
5. **Push notifications** - No email or browser notifications
6. **Multi-language support** - English language only
7. **Advanced search** - No complex filtering beyond basic name search
8. **Data backup/recovery** - Users cannot restore deleted records
9. **Admin panel** - No administrative interface for managing users
10. **Integration with external services** - No calendar, email, or other app integrations

## 6. Design Considerations

### 6.1 User Interface Design

- **Clean, minimalist design** with focus on usability and readability
- **Consistent color scheme** using calming, professional colors appropriate for religious context
- **Clear typography** with good contrast for accessibility
- **Intuitive navigation** with clear section labels ("Persons" and "Time")
- **Mobile-first responsive design** ensuring usability on all devices

### 6.2 User Experience Flow

1. **Landing page** - Simple login/registration screen
2. **Dashboard** - Overview of recent activity with quick access to both sections
3. **Persons section** - List view with search, detail view with visit history
4. **Time section** - List view with filtering, simple form for adding time records
5. **Settings** - Basic account management (password change, email update)

## 7. Technical Considerations

### 7.1 Technology Stack

- **Frontend:** Modern web framework (Vue)
- **Backend:** Serverless architecture with RESTful API
- **Database:** PostgreSQL with row-level security for user isolation
- **Authentication:** JWT-based authentication with secure token storage
- **Hosting:** Cloud platform with automatic scaling

### 7.2 Security Requirements

- **HTTPS encryption** for all data transmission
- **Input validation** on both client and server sides
- **SQL injection prevention** through parameterized queries
- **XSS protection** through proper output encoding
- **Rate limiting** on authentication endpoints
- **Secure session management** with automatic timeout

### 7.3 Performance Requirements

- **Page load time** under 3 seconds on 3G connections
- **Form submission** response time under 1 second
- **List views** should load 50 records efficiently with pagination
- **Search functionality** should return results within 500ms

## 8. Success Metrics

- **User adoption:** 80% of target congregation members actively using the app within 3 months
- **User retention:** 70% of users continue using the app after 6 months
- **Task completion:** 90% of users successfully complete basic tasks (add person, add visit, add time) within first session
- **Error rate:** Less than 2% of form submissions result in errors
- **User satisfaction:** Average user rating of 4.5/5 or higher in feedback surveys

## 9. Open Questions

1. **Data retention policy:** How long should deleted records be retained for potential recovery?
2. **Account recovery:** What process should users follow if they forget their password?
3. **Data validation:** Should there be any restrictions on visit frequency (e.g., can't add future visits)?
4. **Time rounding:** Should minutes be rounded to nearest 15-minute increment for consistency?
5. ~~Address format: Should address field have structured format (street, city, state, zip) or free text?~~ **RESOLVED: Address field will use free text format**
6. **Visit types:** Should visits have categories (e.g., shepherding call, return visit, Bible study)?
7. **Bulk operations:** Should users be able to perform bulk actions (delete multiple records, duplicate visits)?

## 10. Future Considerations

While not part of the initial scope, these features may be considered for future versions:

- **Reporting dashboard** with monthly/yearly summaries
- **Data export** to PDF or Excel formats
- **Visit reminders** based on last visit date
- **Photo attachments** for visit records
- **Voice notes** for quick visit documentation
- **Family grouping** for related person records
- **Territory management** for organizing visits by geographic area
