# Virtual Tutor Application - Administrator Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Administrator Access](#administrator-access)
3. [Admin Dashboard](#admin-dashboard)
4. [Course Management](#course-management)
5. [Avatar Management](#avatar-management)
6. [User Management](#user-management)
7. [Analytics and Reporting](#analytics-and-reporting)
8. [System Configuration](#system-configuration)
9. [Best Practices](#best-practices)

## Introduction

This Administrator Guide provides detailed instructions for managing the Virtual Tutor application. As an administrator, you have access to powerful tools for managing courses, avatars, users, and system settings.

## Administrator Access

### Obtaining Admin Privileges

Admin privileges are granted by a super administrator. If you need admin access:
1. Contact the system owner or super administrator
2. Provide your registered email address
3. Once granted, you'll have access to the admin dashboard

### Admin Login

1. Navigate to the application's login page
2. Enter your email and password
3. You'll be automatically redirected to the admin dashboard if you have admin privileges

## Admin Dashboard

The admin dashboard provides an overview of the system and quick access to all administrative functions.

### Dashboard Components

- **Statistics Overview**: User counts, course counts, active enrollments, and completed enrollments
- **Quick Actions**: Shortcuts to common administrative tasks
- **Recent Activity**: Latest system events and user activities
- **System Status**: Current system health and performance metrics

### Navigation

The sidebar menu provides access to all administrative sections:
- Dashboard (home)
- Courses
- Modules
- Lessons
- Exercises
- Avatars
- Users
- Analytics

## Course Management

### Course List

The course list displays all courses in the system with:
- Title
- Subject
- Enrollment count
- Creation date
- Status (active/inactive)

### Creating a New Course

1. Click "Create New Course" from the course list page
2. Fill in the course details:
   - **Title**: The name of the course
   - **Subject**: The subject area (e.g., Mathematics, Science)
   - **Description**: Detailed description of the course content
   - **Grade Level**: Target education level
   - **Thumbnail**: URL to the course thumbnail image
   - **Duration**: Estimated completion time
   - **Skill Levels**: Beginner, Intermediate, Advanced, or All Levels
3. Click "Create Course" to save

### Editing a Course

1. From the course list, click on a course to view details
2. Click "Edit Course" to modify course information
3. Update the course details
4. Click "Update Course" to save changes

### Managing Course Structure

#### Adding Modules
1. From the course details page, click "Add Module"
2. Fill in the module details:
   - Title
   - Description
   - Order (sequence in the course)
3. Click "Create Module" to save

#### Managing Lessons
1. From the module details page, click "Add Lesson"
2. Fill in the lesson details:
   - Title
   - Content (supports rich text and media)
   - Duration
   - Order (sequence in the module)
3. Click "Create Lesson" to save

#### Creating Exercises
1. From the lesson details page, click "Add Exercise"
2. Fill in the exercise details:
   - Title
   - Instructions
   - Question type (multiple choice, free text, etc.)
   - Questions and answers
   - Difficulty level
3. Click "Create Exercise" to save

### Course Activation/Deactivation

1. From the course details page, use the "Status" toggle
2. Active courses are visible to students
3. Inactive courses are hidden from students but remain in the system

## Avatar Management

### Avatar List

The avatar list displays all virtual tutors with:
- Name
- Thumbnail
- Specializations
- Voice ID
- Status (active/inactive)

### Creating a New Avatar

1. Click "Create New Avatar" from the avatar list page
2. Fill in the avatar details:
   - **Name**: The name of the virtual tutor
   - **3D Model URL**: URL to the 3D model file (glTF/GLB format)
   - **Thumbnail URL**: URL to the avatar thumbnail image
   - **Voice ID**: Voice identifier for speech synthesis
   - **Personality Traits**: Comma-separated list (e.g., Friendly, Patient)
   - **Specializations**: Comma-separated list of subjects
   - **Teaching Styles**: Comma-separated list (e.g., Interactive, Visual)
3. Click "Create Avatar" to save

### Editing an Avatar

1. From the avatar list, click on an avatar to view details
2. Click "Edit Avatar" to modify avatar information
3. Update the avatar details
4. Click "Update Avatar" to save changes

### Avatar Preview

1. From the avatar details page, click "Preview Avatar"
2. Test the avatar's appearance and voice
3. Ensure the 3D model loads correctly and animations work

### Avatar Activation/Deactivation

1. From the avatar details page, use the "Status" toggle
2. Active avatars are available for selection by students
3. Inactive avatars are hidden from students but remain in the system

## User Management

### User List

The user list displays all registered users with:
- Name
- Email
- Role (Student/Admin)
- Registration date
- Status (Active/Inactive)

### User Details

1. Click on a user from the list to view details:
   - Personal information
   - Enrolled courses
   - Progress statistics
   - Activity history

### User Role Management

1. From the user details page, click "Edit Role"
2. Select the appropriate role (Student or Admin)
3. Click "Update" to save changes

### Account Status Management

1. From the user details page, use the "Status" toggle
2. Active accounts can access the system
3. Inactive accounts cannot log in but data is preserved

## Analytics and Reporting

### Overview Dashboard

The analytics dashboard provides high-level metrics:
- Total users and growth rate
- Course enrollments and completion rates
- Average session duration
- Most popular courses and avatars

### Detailed Reports

#### User Engagement Report
- Active users (daily, weekly, monthly)
- Session frequency and duration
- Feature usage statistics

#### Course Performance Report
- Enrollment rates
- Completion rates
- Average time to completion
- Dropout points

#### Learning Outcomes Report
- Exercise completion rates
- Average scores
- Improvement over time
- Difficult topics identified

### Exporting Data

1. From any report, click "Export"
2. Select the format (CSV, Excel, PDF)
3. Choose the data range
4. Click "Download" to get the file

## System Configuration

### General Settings

1. Navigate to "Settings" from the admin sidebar
2. Modify general settings:
   - Application name
   - Logo URL
   - Contact email
   - Terms of service URL
   - Privacy policy URL

### Email Templates

1. Navigate to "Email Templates" from the settings page
2. Edit templates for:
   - Welcome email
   - Password reset
   - Course enrollment confirmation
   - Session reminders
   - Progress reports

### Feature Toggles

1. Navigate to "Features" from the settings page
2. Enable or disable specific features:
   - Speech recognition
   - Voice synthesis
   - 3D avatars (fallback to 2D)
   - Analytics tracking

## Best Practices

### Course Creation

- **Clear Structure**: Organize content logically with a clear progression
- **Varied Content**: Include text, images, videos, and interactive exercises
- **Consistent Difficulty**: Ensure a smooth learning curve
- **Regular Updates**: Keep content current and relevant
- **Comprehensive Coverage**: Ensure all key topics are covered

### Avatar Configuration

- **Appropriate Personality**: Match avatar personality to subject and audience
- **Clear Voice**: Choose voices that are easy to understand
- **Diverse Options**: Provide avatars with different appearances and voices
- **Specialized Tutors**: Create avatars with specific subject expertise

### User Management

- **Regular Audits**: Review user accounts periodically
- **Prompt Support**: Address user issues quickly
- **Privacy First**: Minimize access to personal information
- **Clear Communication**: Inform users about system changes

### System Maintenance

- **Regular Backups**: Ensure data is backed up frequently
- **Performance Monitoring**: Watch for slowdowns or errors
- **Update Content**: Keep course materials current
- **Security Updates**: Apply security patches promptly
