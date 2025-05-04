// Store jobs
let jobs = [];
let currentTheme = 'dark';

// DOM Elements
const jobForm = document.getElementById('jobForm');
const jobList = document.getElementById('jobList');
const runScheduler = document.getElementById('runScheduler');
const scheduledInterviews = document.getElementById('scheduledInterviews');
const scheduledList = document.getElementById('scheduledList');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');
const sortByProfit = document.getElementById('sortByProfit');
const sortByDeadline = document.getElementById('sortByDeadline');
const totalJobs = document.getElementById('totalJobs');
const scheduledJobs = document.getElementById('scheduledJobs');
const totalProfit = document.getElementById('totalProfit');
const fileUpload = document.getElementById('fileUpload');
const parseFile = document.getElementById('parseFile');

// Theme Toggle
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
    updateThemeIcon();
});

function updateThemeIcon() {
    const icon = themeToggle.querySelector('svg');
    if (currentTheme === 'dark') {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
    } else {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
    }
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
    updateJobList();
    updateStats();
}

// Update the job list table
function updateJobList() {
    jobList.innerHTML = '';
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

// Delete a job
function deleteJob(id) {
    jobs = jobs.filter(job => job.id !== id);
    updateJobList();
    updateStats();
}

// Update statistics
function updateStats() {
    totalJobs.textContent = jobs.length;
    const scheduledCount = document.querySelectorAll('#scheduledList tr').length;
    scheduledJobs.textContent = scheduledCount;
    
    const total = jobs.reduce((sum, job) => sum + job.profit, 0);
    totalProfit.textContent = total;
}

// Sort jobs
sortByProfit.addEventListener('click', () => {
    jobs.sort((a, b) => b.profit - a.profit);
    updateJobList();
});

sortByDeadline.addEventListener('click', () => {
    jobs.sort((a, b) => a.deadline - b.deadline);
    updateJobList();
});

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
}

// Display scheduled interviews
function displayScheduledInterviews(slots) {
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
                <td class="py-3 px-6">Day ${day}</td>
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
        ['Company', 'Profit', 'Deadline', 'Date', 'Description', 'Scheduled Day']
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
            job?.date || '',
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
        {wch: 15}, // Date
        {wch: 30}, // Description
        {wch: 15}  // Scheduled Day
    ];

    // Create All Jobs sheet
    const allJobsData = [
        ['Company', 'Profit', 'Deadline', 'Date', 'Description', 'Status']
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
            job.date,
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
        {wch: 15}, // Date
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

        // Clear existing jobs
        jobs = [];
        
        // Add jobs from Excel
        jsonData.forEach(row => {
            addJob(
                row.Company || row.company || '',
                row.Profit || row.profit || 0,
                row.Deadline || row.deadline || 0,
                row.Date || row.date || '',
                row.Description || row.description || ''
            );
        });

        updateJobList();
        updateStats();
    };
    reader.readAsArrayBuffer(file);
}

async function parsePDFFile(file) {
    // PDF parsing would require PDF.js library
    // For now, we'll just show an alert
    alert('PDF parsing is not implemented yet. Please use Excel (.xlsx) format.');
}

// Event Listeners
jobForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const company = document.getElementById('companyName').value;
    const profit = document.getElementById('profit').value;
    const deadline = document.getElementById('deadline').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    addJob(company, profit, deadline, date, description);
    jobForm.reset();
});

runScheduler.addEventListener('click', () => {
    if (jobs.length === 0) {
        alert('Please add at least one job before running the scheduler.');
        return;
    }
    scheduleJobs();
}); 