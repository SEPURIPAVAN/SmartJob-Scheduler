// Store jobs
let jobs = [];
let history = [];

// DOM Elements
const jobForm = document.getElementById('jobForm');
const jobList = document.getElementById('jobList');
const runScheduler = document.getElementById('runScheduler');
const scheduledInterviews = document.getElementById('scheduledInterviews');
const scheduledList = document.getElementById('scheduledList');
const exportBtn = document.getElementById('exportBtn');
const sortByProfit = document.getElementById('sortByProfit');
const sortByDeadline = document.getElementById('sortByDeadline');
const historyList = document.getElementById('historyList');
const historyTotalJobs = document.getElementById('historyTotalJobs');
const lastScheduleRun = document.getElementById('lastScheduleRun');
const lastExport = document.getElementById('lastExport');
const totalJobs = document.getElementById('totalJobs');
const scheduledJobs = document.getElementById('scheduledJobs');
const totalProfit = document.getElementById('totalProfit');
const fileUpload = document.getElementById('fileUpload');
const parseFile = document.getElementById('parseFile');

// Initialize stats from localStorage
function initializeStats() {
    const savedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    jobs = savedJobs;
    updateStats();
    updateJobList();
}

// Save jobs to localStorage
function saveJobs() {
    localStorage.setItem('jobs', JSON.stringify(jobs));
    updateStats();
}

// Add job to the list
function addJob(company, profit, deadline, date, description) {
    const job = {
        company,
        profit: parseInt(profit),
        deadline: parseInt(deadline),
        date,
        description,
        id: Date.now()
    };
    
    jobs.push(job);
    saveJobs();
    updateJobList();
    addToHistory('Added job', `${company} (Profit: ${profit}, Deadline: ${deadline} days)`);
}

// Update the job list table
function updateJobList() {
    if (jobList) {
        jobList.innerHTML = '';
        
        // Add Clear All button row
        const clearRow = document.createElement('tr');
        clearRow.className = 'border-b border-gray-700 bg-slate-800';
        clearRow.innerHTML = `
            <td colspan="6" class="py-3 px-6 text-center">
                <button onclick="clearAllJobs()" class="text-red-500 hover:text-red-400 font-medium flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Jobs
                </button>
            </td>
        `;
        jobList.appendChild(clearRow);
        
        jobs.forEach(job => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-700';
            row.innerHTML = `
                <td class="py-3 px-6">${job.company}</td>
                <td class="py-3 px-6">${job.profit}</td>
                <td class="py-3 px-6">${job.deadline}</td>
                <td class="py-3 px-6">${job.date}</td>
                <td class="py-3 px-6 max-w-xs truncate" title="${job.description}">${job.description}</td>
                <td class="py-3 px-6">
                    <button onclick="deleteJob(${job.id})" class="text-red-500 hover:text-red-400">
                        Delete
                    </button>
                </td>
            `;
            jobList.appendChild(row);
        });
    }
}

// Delete a job
function deleteJob(id) {
    const job = jobs.find(j => j.id === id);
    if (job) {
        jobs = jobs.filter(j => j.id !== id);
        saveJobs();
        updateJobList();
        addToHistory('Deleted job', `${job.company}`);
    }
}

// Update statistics
function updateStats() {
    const total = jobs.length;
    const scheduledCount = document.querySelectorAll('#scheduledList tr')?.length || 0;
    const profit = jobs.reduce((sum, job) => sum + job.profit, 0);

    if (totalJobs) totalJobs.textContent = total;
    if (scheduledJobs) scheduledJobs.textContent = scheduledCount;
    if (totalProfit) totalProfit.textContent = profit;
    if (historyTotalJobs) historyTotalJobs.textContent = total;
}

// Add entry to history
function addToHistory(action, details) {
    const entry = {
        timestamp: new Date(),
        action,
        details
    };
    
    history.unshift(entry);
    if (history.length > 10) {
        history.pop();
    }
    
    updateHistoryList();
}

// Update history list display
function updateHistoryList() {
    if (historyList) {
        historyList.innerHTML = '';
        history.forEach(entry => {
            const time = entry.timestamp.toLocaleTimeString();
            const div = document.createElement('div');
            div.className = 'text-sm';
            div.innerHTML = `
                <div class="text-primary font-medium">${entry.action}</div>
                <div class="text-gray-400">${entry.details}</div>
                <div class="text-gray-500 text-xs">${time}</div>
            `;
            historyList.appendChild(div);
        });
    }
}

// Sort jobs by profit
function sortJobsByProfit() {
    jobs.sort((a, b) => b.profit - a.profit);
    saveJobs();
    updateJobList();
    addToHistory('Sorted jobs', 'By profit (descending)');
}

// Sort jobs by deadline
function sortJobsByDeadline() {
    jobs.sort((a, b) => a.deadline - b.deadline);
    saveJobs();
    updateJobList();
    addToHistory('Sorted jobs', 'By deadline (ascending)');
}

// Greedy Algorithm implementation
function scheduleJobs() {
    // Sort jobs by profit in descending order
    const sortedJobs = [...jobs].sort((a, b) => b.profit - a.profit);
    
    // Find maximum deadline
    const maxDeadline = Math.max(...jobs.map(job => job.deadline));
    
    // Initialize slots array
    const slots = new Array(maxDeadline + 1).fill(null);
    
    // Schedule jobs
    sortedJobs.forEach(job => {
        // Find the latest available slot before deadline
        for (let i = job.deadline; i > 0; i--) {
            if (!slots[i]) {
                slots[i] = job;
                break;
            }
        }
    });
    
    // Display scheduled interviews
    displayScheduledInterviews(slots);
    addToHistory('Ran scheduler', `Scheduled ${slots.filter(job => job).length} jobs`);
    updateStats(); // Ensure stats are updated after scheduling
}

// Display scheduled interviews
function displayScheduledInterviews(slots) {
    if (scheduledList) {
        scheduledList.innerHTML = '';
        scheduledInterviews.classList.remove('hidden');
        
        // First, show all scheduled jobs
        slots.forEach((job, day) => {
            if (job) {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-700';
                row.setAttribute('data-job-id', job.id);
                row.innerHTML = `
                    <td class="py-3 px-6">${job.company}</td>
                    <td class="py-3 px-6">${job.profit}</td>
                    <td class="py-3 px-6">${job.deadline}</td>
                    <td class="py-3 px-6">${job.date} (Day ${day})</td>
                `;
                scheduledList.appendChild(row);
            }
        });

        // Then, show unscheduled jobs
        const scheduledJobIds = new Set(slots.filter(job => job).map(job => job.id));
        jobs.forEach(job => {
            if (!scheduledJobIds.has(job.id)) {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-700 text-gray-500';
                row.setAttribute('data-job-id', job.id);
                row.innerHTML = `
                    <td class="py-3 px-6">${job.company}</td>
                    <td class="py-3 px-6">${job.profit}</td>
                    <td class="py-3 px-6">${job.deadline}</td>
                    <td class="py-3 px-6">Not Scheduled</td>
                `;
                scheduledList.appendChild(row);
            }
        });
        
        updateStats();
    }
}

// Export schedule to Excel
exportBtn.addEventListener('click', () => {
    if (jobs.length === 0) {
        alert('No jobs to export.');
        return;
    }
    
    const scheduledJobs = document.querySelectorAll('#scheduledList tr');
    if (scheduledJobs.length === 0) {
        alert('Please run the scheduler first.');
        return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Create Scheduled Interviews sheet
    const scheduledData = [
        ['Company', 'Profit', 'Deadline', 'Description', 'Scheduled Day']
    ];

    // Add scheduled jobs data
    scheduledJobs.forEach(row => {
        const cells = row.querySelectorAll('td');
        const jobId = row.getAttribute('data-job-id');
        const job = jobs.find(j => j.id.toString() === jobId);
        
        scheduledData.push([
            cells[0].textContent,
            cells[1].textContent,
            cells[2].textContent,
            job?.description || '',
            cells[3].textContent
        ]);
    });

    const scheduledWs = XLSX.utils.aoa_to_sheet(scheduledData);
    
    // Set column widths for scheduled sheet
    scheduledWs['!cols'] = [
        {wch: 20}, // Company
        {wch: 10}, // Profit
        {wch: 10}, // Deadline
        {wch: 30}, // Description
        {wch: 20}  // Scheduled Day
    ];

    // Create All Jobs sheet
    const allJobsData = [
        ['Company', 'Profit', 'Deadline', 'Description', 'Status']
    ];

    // Add all jobs data
    jobs.forEach(job => {
        const isScheduled = scheduledJobs.length > 0 && 
            Array.from(scheduledJobs).some(row => 
                row.querySelector('td:first-child').textContent === job.company
            );
        
        allJobsData.push([
            job.company,
            job.profit,
            job.deadline,
            job.description,
            isScheduled ? 'Scheduled' : 'Not Scheduled'
        ]);
    });

    const allJobsWs = XLSX.utils.aoa_to_sheet(allJobsData);
    
    // Set column widths for all jobs sheet
    allJobsWs['!cols'] = [
        {wch: 20}, // Company
        {wch: 10}, // Profit
        {wch: 10}, // Deadline
        {wch: 30}, // Description
        {wch: 15}  // Status
    ];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, scheduledWs, "Scheduled Interviews");
    XLSX.utils.book_append_sheet(wb, allJobsWs, "All Jobs");

    // Generate Excel file
    const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    
    // Create blob and download
    const blob = new Blob([wbout], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-schedule.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addToHistory('Exported schedule', 'To Excel file');
    lastExport.textContent = new Date().toLocaleString();
});

// Handle file upload and parsing
parseFile.addEventListener('click', async () => {
    const file = fileUpload.files[0];
    if (!file) {
        alert('Please select a file first.');
        return;
    }

    try {
        if (file.name.endsWith('.xlsx')) {
            await parseExcelFile(file);
        } else if (file.name.endsWith('.pdf')) {
            await parsePDFFile(file);
        } else {
            alert('Unsupported file format. Please upload an Excel (.xlsx) or PDF (.pdf) file.');
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the file format and try again.');
    }
});

async function parseExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Keep existing jobs and add new ones
        const newJobs = [];
        
        // Add jobs from Excel
        jsonData.forEach(row => {
            // Skip empty rows
            if (!row.Company && !row.company) return;
            
            const job = {
                company: row.Company || row.company || '',
                profit: parseInt(row.Profit || row.profit || 0),
                deadline: parseInt(row.Deadline || row.deadline || 0),
                date: row.Date || row.date || '',
                description: row.Description || row.description || '',
                id: Date.now() + Math.random() // Ensure unique ID
            };
            
            newJobs.push(job);
        });

        // Add new jobs to existing jobs array
        jobs = [...jobs, ...newJobs];
        saveJobs();
        updateJobList();
        updateStats();
        addToHistory('Imported jobs', `From Excel file: ${file.name} (${newJobs.length} rows)`);
    };
    reader.readAsArrayBuffer(file);
}

async function parsePDFFile(file) {
    // PDF parsing would require PDF.js library
    // For now, we'll just show an alert
    alert('PDF parsing is not implemented yet. Please use Excel (.xlsx) format.');
}

// Event Listeners
if (sortByProfit) sortByProfit.addEventListener('click', sortJobsByProfit);
if (sortByDeadline) sortByDeadline.addEventListener('click', sortJobsByDeadline);

if (jobForm) {
    jobForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const company = document.getElementById('companyName').value;
        const profit = document.getElementById('profit').value;
        const deadline = document.getElementById('deadline').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        
        addJob(company, profit, deadline, date, description);
        
        // Reset form and focus on company name
        jobForm.reset();
        document.getElementById('companyName').focus();
    });
}

if (runScheduler) {
    runScheduler.addEventListener('click', () => {
        if (jobs.length === 0) {
            alert('Please add at least one job before running the scheduler.');
            return;
        }
        scheduleJobs();
    });
}

// Clear all jobs
function clearAllJobs() {
    if (confirm('Are you sure you want to clear all jobs? This action cannot be undone.')) {
        jobs = [];
        saveJobs();
        updateJobList();
        updateStats();
        addToHistory('Cleared all jobs', 'All job data has been removed');
    }
}

// Initialize the app
initializeStats(); 