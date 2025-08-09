// App state
let currentView = 'list';
let currentMonth = new Date();
let isAdmin = false;
let adminPin = '1234'; // Default PIN - should be configurable

// Mock data - will be replaced with localStorage/database
let openingHours = [
    // Denne uken (uken som starter med mandag 4. august 2025)
    {
        id: '1',
        date: '2025-08-04', // Mandag
        dayOfWeek: 'Mandag',
        startTime: '09:00',
        endTime: '17:00',
        activities: ['Jaktskyting'],
        colors: ['#3B82F6'],
        comment: 'Vanlig åpningstid for jaktskyting',
        rangeOfficer: 'Ola Nordmann'
    },
    {
        id: '2',
        date: '2025-08-05', // Tirsdag
        dayOfWeek: 'Tirsdag',
        startTime: '10:00',
        endTime: '16:00',
        activities: ['DFS'],
        colors: ['#10B981'],
        comment: 'DFS trening',
        rangeOfficer: 'Kari Hansen'
    },
    {
        id: '3',
        date: '2025-08-06', // Onsdag
        dayOfWeek: 'Onsdag',
        startTime: '14:00',
        endTime: '20:00',
        activities: ['Pistol'],
        colors: ['#F59E0B'],
        comment: 'Pistolskyting for alle nivåer',
        rangeOfficer: 'Per Olsen'
    },
    {
        id: '4',
        date: '2025-08-07', // Torsdag (I DAG!)
        dayOfWeek: 'Torsdag',
        startTime: '08:00',
        endTime: '12:00',
        activities: ['Oppskyting'],
        colors: ['#EF4444'],
        comment: 'Oppskyting av nye medlemmer - I DAG!',
        rangeOfficer: 'Anne Berg'
    },
    {
        id: '5',
        date: '2025-08-09', // Lørdag
        dayOfWeek: 'Lørdag',
        startTime: '09:00',
        endTime: '18:00',
        activities: ['Stevne'],
        colors: ['#8B5CF6'],
        comment: 'Lørdagsstevne - alle velkomne!',
        rangeOfficer: 'Erik Johansen'
    },
    {
        id: '6',
        date: '2025-08-10', // Søndag
        dayOfWeek: 'Søndag',
        startTime: '10:00',
        endTime: '16:00',
        activities: ['Jaktskyting', 'Oppskyting'],
        colors: ['#3B82F6', '#EF4444'],
        comment: 'Jaktskyting med oppskyting av nye medlemmer',
        rangeOfficer: 'Ola Nordmann'
    },
    
    // Neste uke (uken som starter med mandag 11. august 2025)
    {
        id: '7',
        date: '2025-08-11', // Mandag
        dayOfWeek: 'Mandag',
        startTime: '09:00',
        endTime: '17:00',
        activities: ['Jaktskyting'],
        colors: ['#3B82F6'],
        comment: 'Vanlig åpningstid for jaktskyting',
        rangeOfficer: 'Ola Nordmann'
    },
    {
        id: '8',
        date: '2025-08-12', // Tirsdag
        dayOfWeek: 'Tirsdag',
        startTime: '10:00',
        endTime: '16:00',
        activities: ['DFS'],
        colors: ['#10B981'],
        comment: 'DFS trening',
        rangeOfficer: 'Kari Hansen'
    },
    {
        id: '9',
        date: '2025-08-13', // Onsdag
        dayOfWeek: 'Onsdag',
        startTime: '14:00',
        endTime: '20:00',
        activities: ['Pistol'],
        colors: ['#F59E0B'],
        comment: 'Pistolskyting for alle nivåer',
        rangeOfficer: 'Per Olsen'
    },
    {
        id: '10',
        date: '2025-08-14', // Torsdag
        dayOfWeek: 'Torsdag',
        startTime: '09:00',
        endTime: '17:00',
        activities: ['Jaktskyting', 'Oppskyting'],
        colors: ['#3B82F6', '#EF4444'],
        comment: 'Jaktskyting med oppskyting',
        rangeOfficer: 'Anne Berg'
    },
    {
        id: '11',
        date: '2025-08-16', // Lørdag
        dayOfWeek: 'Lørdag',
        startTime: '09:00',
        endTime: '18:00',
        activities: ['Stevne'],
        colors: ['#8B5CF6'],
        comment: 'Lørdagsstevne - alle velkomne!',
        rangeOfficer: 'Erik Johansen'
    },
    {
        id: '12',
        date: '2025-08-17', // Søndag
        dayOfWeek: 'Søndag',
        startTime: '10:00',
        endTime: '16:00',
        activities: ['DFS', 'Pistol'],
        colors: ['#10B981', '#F59E0B'],
        comment: 'DFS og pistolskyting',
        rangeOfficer: 'Kari Hansen'
    }
];

// Norwegian month names
const monthNames = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
];

// Norwegian day names
const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    renderList();
    renderCalendar();
    updateViewToggle();
    
    // Debug: Add button to clear localStorage if needed
    if (window.location.search.includes('debug')) {
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear Data';
        clearBtn.style.position = 'fixed';
        clearBtn.style.top = '10px';
        clearBtn.style.right = '10px';
        clearBtn.style.zIndex = '9999';
        clearBtn.onclick = () => {
            localStorage.clear();
            location.reload();
        };
        document.body.appendChild(clearBtn);
    }
});

// Data management
function loadData() {
    const saved = localStorage.getItem('skytebaneData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Check if saved data has the new structure
            if (parsed.length > 0 && parsed[0].activities) {
                openingHours = parsed;
            } else {
                // Old data structure, clear it and use default
                localStorage.removeItem('skytebaneData');
                console.log('Cleared old data structure, using defaults');
            }
        } catch (e) {
            console.log('Error parsing saved data, using defaults');
            localStorage.removeItem('skytebaneData');
        }
    }
    
    const savedPin = localStorage.getItem('adminPin');
    if (savedPin) {
        adminPin = savedPin;
    }
    
    console.log('Loaded data:', openingHours);
}

function saveData() {
    localStorage.setItem('skytebaneData', JSON.stringify(openingHours));
}

// Event listeners
function setupEventListeners() {
    // View toggle
    document.getElementById('viewToggle').addEventListener('click', toggleView);
    
    // Admin button
    document.getElementById('adminBtn').addEventListener('click', openAdminModal);
    
    // Modal events
    document.getElementById('closeModal').addEventListener('click', closeAdminModal);
    
    // Form submission
    document.getElementById('addForm').addEventListener('submit', addNewOpening);
    
    // Filter checkboxes
    document.querySelectorAll('.filter-item input').forEach(checkbox => {
        checkbox.addEventListener('change', filterData);
    });
    
    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
    
    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });
    
    // Close modal on outside click
    document.getElementById('adminModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAdminModal();
        }
    });
}

// View management
function toggleView() {
    currentView = currentView === 'list' ? 'calendar' : 'list';
    
    document.getElementById('listView').classList.toggle('active', currentView === 'list');
    document.getElementById('calendarView').classList.toggle('active', currentView === 'calendar');
    
    updateViewToggle();
}

function updateViewToggle() {
    const button = document.getElementById('viewToggle');
    if (currentView === 'list') {
        button.innerHTML = '<i class="fas fa-calendar"></i> Kalender';
    } else {
        button.innerHTML = '<i class="fas fa-list"></i> Liste';
    }
}

// List view rendering
function renderList() {
    const container = document.querySelector('.list-container');
    const filteredData = getFilteredData();
    const activeFilters = Array.from(document.querySelectorAll('.filter-item input:checked'))
        .map(checkbox => checkbox.value);
    
    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureActivities = openingHours.filter(item => {
        const activityDate = new Date(item.date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate >= today;
    });
    
    if (filteredData.length === 0) {
        if (futureActivities.length === 0) {
            container.innerHTML = '<p class="no-data">Ingen fremtidige åpningstider planlagt.</p>';
        } else if (activeFilters.length === 0) {
            container.innerHTML = '<p class="no-data">Ingen filtre valgt. Velg minst én aktivitet for å se åpningstider.</p>';
        } else {
            container.innerHTML = '<p class="no-data">Ingen fremtidige åpningstider funnet for de valgte aktivitetene.</p>';
        }
        return;
    }
    
    container.innerHTML = filteredData
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => createListItem(item))
        .join('');
}

function createListItem(item) {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('no-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const activityBadges = item.activities.map((activity, index) => 
        `<span class="activity-badge ${activity}" style="background-color: ${item.colors[index]}">${activity}</span>`
    ).join('');
    
    return `
        <div class="list-item ${item.activities[0]}">
            <div class="item-header">
                <div class="item-date">${formattedDate} (${item.dayOfWeek})</div>
                <div class="item-time">${item.startTime} - ${item.endTime}</div>
            </div>
            <div class="item-activity">
                ${activityBadges}
            </div>
            <div class="item-details">
                <strong>Standsplassleder:</strong> ${item.rangeOfficer || 'Ikke satt'}
            </div>
            ${item.comment ? `<div class="item-comment">${item.comment}</div>` : ''}
        </div>
    `;
}

// Calendar view rendering
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Update header
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Create calendar grid
    const grid = document.querySelector('.calendar-grid');
    let html = '';
    
    // Add day headers
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day.slice(0, 3)}</div>`;
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }
    
            // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            // Use local date string to avoid timezone issues
            const dateString = date.getFullYear() + '-' + 
                              String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(date.getDate()).padStart(2, '0');
            const isToday = date.toDateString() === new Date().toDateString();
            
            // Filter events to only show future activities
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dayEvents = openingHours.filter(item => {
                if (item.date !== dateString) return false;
                const activityDate = new Date(item.date);
                activityDate.setHours(0, 0, 0, 0);
                return activityDate >= today;
            });
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateString}">
                    <div class="day-number">${day}</div>
                    <div class="day-events">
                        ${dayEvents.map(event => `
                            <div class="day-event" style="background: linear-gradient(45deg, ${event.colors.join(', ')})">
                                ${event.startTime} ${event.activities.join(' + ')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    
    // Add empty cells for days after month ends
    const totalCells = 42; // 6 rows * 7 days
    const remainingCells = totalCells - startingDay - daysInMonth;
    for (let i = 0; i < remainingCells; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }
    
    grid.innerHTML = html;
    
    // Add click handlers for calendar days
    document.querySelectorAll('.calendar-day[data-date]').forEach(day => {
        day.addEventListener('click', () => {
            const date = day.dataset.date;
            showDayDetails(date);
        });
    });
}

function showDayDetails(date) {
    const events = openingHours.filter(item => item.date === date);
    if (events.length === 0) return;
    
    const formattedDate = new Date(date).toLocaleDateString('no-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    alert(`${formattedDate}\n\n${events.map(event => 
        `${event.startTime} - ${event.endTime}: ${event.activities.join(' + ')}\n${event.comment || ''}`
    ).join('\n\n')}`);
}

// Filtering
function getFilteredData() {
    const activeFilters = Array.from(document.querySelectorAll('.filter-item input:checked'))
        .map(checkbox => checkbox.value);
    
    // Get today's date (start of day for comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter out past activities first
    const futureActivities = openingHours.filter(item => {
        const activityDate = new Date(item.date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate >= today;
    });
    
    // If no filters are selected, show all future activities
    if (activeFilters.length === 0) {
        return futureActivities;
    }
    
    // Apply activity type filters to future activities
    return futureActivities.filter(item => 
        item.activities.some(activity => activeFilters.includes(activity))
    );
}

function filterData() {
    if (currentView === 'list') {
        renderList();
    } else {
        renderCalendar();
    }
}

function clearAllFilters() {
    // Uncheck all filter checkboxes
    document.querySelectorAll('.filter-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Re-render views
    filterData();
}

// Admin functionality
function openAdminModal() {
    document.getElementById('adminModal').classList.add('active');
    document.getElementById('pinSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
    isAdmin = false;
}



function addNewOpening(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const date = formData.get('date');
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const comment = formData.get('comment');
    const rangeOfficer = formData.get('rangeOfficer');
    
    // Get selected activities
    const selectedActivities = Array.from(document.querySelectorAll('input[name="activities"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedActivities.length === 0) {
        alert('Velg minst én aktivitet!');
        return;
    }
    
    // Get colors for selected activities
    const colors = {
        'Jaktskyting': '#3B82F6',
        'DFS': '#10B981',
        'Pistol': '#F59E0B',
        'Oppskyting': '#EF4444',
        'Stevne': '#8B5CF6',
        'Annet': '#6B7280'
    };
    
    const selectedColors = selectedActivities.map(activity => colors[activity]);
    
    const newOpening = {
        id: Date.now().toString(),
        date: date,
        dayOfWeek: dayNames[new Date(date).getDay()],
        startTime: startTime,
        endTime: endTime,
        activities: selectedActivities,
        colors: selectedColors,
        comment: comment,
        rangeOfficer: rangeOfficer
    };
    
    openingHours.push(newOpening);
    saveData();
    
    // Reset form and close modal
    e.target.reset();
    closeAdminModal();
    
    // Re-render views
    renderList();
    renderCalendar();
    
    alert('Ny åpningstid lagt til!');
}

// Utility functions
function formatDate(date) {
    return date.toLocaleDateString('no-NO');
}

function formatTime(time) {
    return time;
}

// Add some CSS for calendar day headers
const style = document.createElement('style');
style.textContent = `
    .calendar-day-header {
        background: #2c3e50;
        color: white;
        padding: 0.5rem;
        text-align: center;
        font-weight: 600;
        font-size: 0.9rem;
    }
    
    .no-data {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        padding: 2rem;
    }
`;
document.head.appendChild(style); 