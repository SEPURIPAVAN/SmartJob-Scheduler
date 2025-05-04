# Smart Job Scheduler

A sophisticated job scheduling application that helps manage interview slots for companies using a greedy algorithm. The application features a modern, premium interface.

## Quick Start

1. Open `index.html` in your browser
2. Add jobs using the form:
   - Company name
   - Profit (priority score)
   - Deadline (days)
   - Date
   - Description (optional)
3. Click "Run Scheduler" to generate the optimal schedule
4. Export results to Excel with detailed information

## Features

- **Smart Scheduling**: Uses a greedy algorithm to maximize profit while respecting deadlines
- **Job Management**:
  - Add, delete, and clear all jobs
  - Sort jobs by profit or deadline
  - Detailed job information including descriptions
- **Data Import/Export**:
  - Import jobs from Excel files
  - Export schedule to Excel with two sheets:
    - Scheduled Interviews
    - All Jobs (with status)
- **Modern Interface**:
  - Premium design with intuitive navigation
  - Responsive layout
- **Statistics & History**:
  - Real-time job statistics
  - Activity history tracking
  - Last schedule run and export timestamps

## Technical Details

- Pure HTML, CSS, and JavaScript implementation
- Local storage for data persistence
- Excel file handling using SheetJS library
- Responsive design with Tailwind CSS 
