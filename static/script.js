// App state
let currentView = 'list';
let currentMonth = new Date();
let isAdmin = false;
let adminPin = '1234'; // Default PIN - should be configurable
let adminMode = false;

// Initialize openingHours as empty array
let openingHours = [];

// Test loading overlay on page load
document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('importLoadingOverlay');
    console.log('DOM loaded - Loading overlay element:', loadingOverlay);
    if (loadingOverlay) {
        console.log('Loading overlay found and ready');
    } else {
        console.error('Loading overlay not found!');
    }
});

// Function to get default data
function getDefaultData() {
    return [
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
            activities: ['Storviltprøve'],
            colors: ['#10B981'],
            comment: 'Storviltprøve av nye medlemmer - I DAG!',
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
            id: '5b',
            date: '2025-08-08', // Fredag
            dayOfWeek: 'Fredag',
            startTime: '14:00',
            endTime: '20:00',
            activities: ['Åpen for alle'],
            colors: ['#98FB98'],
            comment: 'Åpen skytebane - alle medlemmer velkomne!',
            rangeOfficer: 'Maria Hansen'
        },
        {
            id: '6',
            date: '2025-08-10', // Søndag
            dayOfWeek: 'Søndag',
            startTime: '10:00',
            endTime: '16:00',
            activities: ['Jeger', 'Storviltprøve'],
            colors: ['#228B22', '#3B82F6'],
            comment: 'Jaktskyting med storviltprøve av nye medlemmer',
            rangeOfficer: 'Ola Nordmann'
        },
        
        // Neste uke (uken som starter med mandag 11. august 2025)
        {
            id: '7',
            date: '2025-08-11', // Mandag
            dayOfWeek: 'Mandag',
            startTime: '09:00',
            endTime: '17:00',
            activities: ['Jeger'],
            colors: ['#228B22'],
            comment: 'Vanlig åpningstid for jeger',
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
            activities: ['Jeger', 'Oppskyting'],
            colors: ['#228B22', '#EF4444'],
            comment: 'Jaktskyting med oppskyting',
            rangeOfficer: 'Anne Berg'
        },
        {
            id: '11',
            date: '2025-08-16', // Lørdag
            dayOfWeek: 'Lørdag',
            startTime: '09:00',
            endTime: '18:00',
            activities: ['PRS'],
            colors: ['#8B5CF6'],
            comment: 'PRS trening - alle velkomne!',
            rangeOfficer: 'Erik Johansen'
        },
        {
            id: '12',
            date: '2025-08-17', // Søndag
            dayOfWeek: 'Søndag',
            startTime: '10:00',
            endTime: '16:00',
            activities: ['DFS', 'Pistol'],
            colors: ['#FFFFFF', '#F59E0B'],
            comment: 'DFS og pistolskyting',
            rangeOfficer: 'Kari Hansen'
        }
    ];
}

// Norwegian month names
const monthNames = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
];

// Norwegian day names (Monday first)
const dayNames = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupEventListeners();
    
    // Set initial view to list
    document.getElementById('listView').classList.add('active');
    document.getElementById('calendarView').classList.remove('active');
    
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
        
        // Add button to show all activities
        const showBtn = document.createElement('button');
        showBtn.textContent = 'Show All Data';
        showBtn.style.position = 'fixed';
        showBtn.style.top = '50px';
        showBtn.style.right = '10px';
        showBtn.style.zIndex = '9999';
        showBtn.onclick = () => {
            console.log('Alle lagrede aktiviteter:', openingHours);
            console.log('localStorage data:', localStorage.getItem('skytebaneData'));
        };
        document.body.appendChild(showBtn);
    }
});

// Data management
async function loadData() {
    try {
        console.log('loadData: Starting to fetch data from API...');
        const response = await fetch('/api/activities');
        console.log('loadData: Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('loadData: Raw data from API:', data);
            console.log('loadData: Data type:', typeof data);
            console.log('loadData: Data length:', data ? data.length : 'undefined');
            
            if (data && data.length > 0) {
                openingHours = data;
                // Migrate "Ledig" to "Uavklart" in existing data
                migrateLedigToUavklart();
                console.log('loadData: Loaded existing data from database:', data.length, 'activities');
                console.log('loadData: First activity sample:', data[0]);
            } else {
                // No data in database - start with empty array
                openingHours = [];
                console.log('loadData: Database is empty - starting with blank slate');
            }
        } else {
            console.log('loadData: Error loading data from API, starting with empty array');
            openingHours = [];
        }
    } catch (error) {
        console.log('loadData: Error loading data from API, starting with empty array:', error);
        openingHours = [];
    }
    
    console.log('loadData: Final openingHours:', openingHours);
    console.log('loadData: openingHours length:', openingHours ? openingHours.length : 'undefined');
    
    // Update activity counter if admin panel is open
    updateActivityCounter();
}

function migrateLedigToUavklart() {
    let migrated = false;
    openingHours.forEach(activity => {
        if (activity.activities) {
            for (let i = 0; i < activity.activities.length; i++) {
                if (activity.activities[i] === 'Ledig') {
                    activity.activities[i] = 'Uavklart';
                    migrated = true;
                }
            }
        }
    });
    
    if (migrated) {
        console.log('Migrated "Ledig" activities to "Uavklart"');
        // Note: Migration is now handled in memory, no need to save
    }
}

async function saveData() {
    // This function is now handled by individual API calls
    // Keeping it for backward compatibility but it's no longer needed
    console.log('saveData called - data is now saved via API calls');
}

// Event listeners
function setupEventListeners() {
    // View toggle
    document.getElementById('viewToggle').addEventListener('click', toggleView);
    
    // Admin button
    document.getElementById('adminBtn').addEventListener('click', openAdminModal);
    
    // Admin mode controls on main page
    document.getElementById('addActivityBtnMain').addEventListener('click', async () => {
        document.getElementById('adminModal').classList.add('active');
        document.getElementById('pinSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        switchAdminPanel('addActivityPanel');
        resetEditForm(); // Clear form for new activity
        setupTimeInputs(); // Setup time inputs for 24-hour format
        updateActivityCounter();
    });
    
    document.getElementById('importCalendarBtnMain').addEventListener('click', async () => {
        document.getElementById('adminModal').classList.add('active');
        document.getElementById('pinSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        switchAdminPanel('importCalendarPanel');
    });
    
    document.getElementById('checkDuplicatesBtnMain').addEventListener('click', async () => {
        document.getElementById('adminModal').classList.add('active');
        document.getElementById('pinSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        switchAdminPanel('checkDuplicatesPanel');
        await checkForDuplicates();
    });
    
    // Admin dashboard menu
    document.getElementById('addActivityBtn').addEventListener('click', async () => {
        switchAdminPanel('addActivityPanel');
        resetEditForm(); // Clear form for new activity
        setupTimeInputs(); // Setup time inputs for 24-hour format
    });
    document.getElementById('importCalendarBtn').addEventListener('click', async () => {
        console.log('Import calendar button clicked');
        switchAdminPanel('importCalendarPanel');
        console.log('Switched to import panel');
        setupImportDateDefaults();
        console.log('Setup import date defaults called');
        
        // Update activity counter to show/hide empty database message
        updateActivityCounter();
    });
    document.getElementById('checkDuplicatesBtn').addEventListener('click', async () => {
        switchAdminPanel('checkDuplicatesPanel');
        await checkForDuplicates();
    });

    
    // Import calendar button
    const startImportBtn = document.getElementById('startImportBtn');
    if (startImportBtn) {
        startImportBtn.addEventListener('click', async () => await startImport());
    }
    
    // Remove duplicates button
    const removeDuplicatesBtn = document.getElementById('removeDuplicatesBtn');
    if (removeDuplicatesBtn) {
        removeDuplicatesBtn.addEventListener('click', async () => await removeDuplicates());
    }
    
    // Modal events
    document.getElementById('closeModal').addEventListener('click', closeAdminModal);
    
    // Form submission
    const addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => await addNewOpening(e));
        console.log('Form event listener added');
        
        // Also add click listener to submit button as backup
        const submitBtn = addForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                console.log('Submit button clicked');
                // Don't prevent default here, let the form submit event handle it
            });
        }
    } else {
        console.error('addForm not found!');
    }
    
    // Delete activity button
    document.getElementById('deleteActivityBtn').addEventListener('click', async () => await deleteActivity());
    
    // Delete all activities button
    document.getElementById('deleteAllActivitiesBtnMain').addEventListener('click', async () => await deleteAllActivities());
    
    // Close admin modal button
    document.getElementById('closeAdminModalBtn').addEventListener('click', closeAdminModal);
    
    // Filter checkboxes
    document.querySelectorAll('.filter-item input').forEach(checkbox => {
        checkbox.addEventListener('change', filterData);
    });
    
    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
    
    // Toggle filters button
    document.getElementById('toggleFilters').addEventListener('click', toggleFilters);
    
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
        // Currently in list view, button should show "Kalender" (what happens when clicked)
        button.innerHTML = '<i class="fas fa-calendar"></i> Kalender';
    } else {
        // Currently in calendar view, button should show "Liste" (what happens when clicked)
        button.innerHTML = '<i class="fas fa-list"></i> Liste';
    }
}

// List view rendering
function renderList() {
    const container = document.querySelector('.list-container');
    const filteredData = getFilteredData();
    const activeFilters = Array.from(document.querySelectorAll('.filter-item input:checked'))
        .map(checkbox => checkbox.value);
    
    // Check if database is completely empty
    if (!openingHours || openingHours.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <p>Ingen aktiviteter i databasen ennå.</p>
                <p>Bruk "Last inn ekstern kalender" i admin-panelet for å importere aktiviteter.</p>
            </div>
        `;
        return;
    }
    
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
    
    // Make activities editable if admin mode is active
    if (adminMode) {
        makeActivitiesEditable();
    }
}

function createListItem(item) {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('no-NO', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
    
    const activityBadges = item.activities.map((activity, index) => {
        // Handle both string and array colors
        const color = Array.isArray(item.colors) ? item.colors[index] : item.colors;
        return `<span class="activity-badge ${activity}" style="background-color: ${color}">${activity}</span>`;
    }).join('');
    
    // Only show admin buttons in admin mode
    const adminButtons = adminMode ? `
        <div class="admin-buttons">
            <button class="edit-btn" onclick="event.stopPropagation(); openEditModalById('${item.id}')" title="Rediger aktivitet">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteActivityById('${item.id}')" title="Slett aktivitet">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    ` : '';
    
    // Create a safe CSS class name (replace spaces and special chars)
    const primaryActivity = item.activities[0] || 'Annet';
    const safeClass = primaryActivity.replace(/[^a-zA-Z0-9]/g, '-');
    
    return `
        <div class="list-item ${safeClass}" data-id="${item.id}">
            ${adminButtons}
            <div class="item-content">
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
    const startingDay = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    
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
            
            // Get filtered data and filter by date
            const filteredData = getFilteredData();
            const dayEvents = filteredData ? filteredData.filter(item => item.date === dateString) : [];
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateString}">
                    <div class="day-number">${day}</div>
                    <div class="day-events">
                        ${dayEvents.map(event => `
                            <div class="day-event" style="background-color: ${Array.isArray(event.colors) ? event.colors[0] : event.colors}">
                                <span class="event-text">${event.startTime} ${event.activities.join(' + ')}</span>
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
    const filteredData = getFilteredData();
    if (!filteredData || filteredData.length === 0) return;
    
    const events = filteredData.filter(item => item.date === date);
    if (events.length === 0) return;
    
    const formattedDate = new Date(date).toLocaleDateString('no-NO', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
    
    // Create custom modal instead of alert
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content day-details-modal">
            <div class="modal-header">
                <h2>${formattedDate}</h2>
                <button class="btn-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${events.map(event => `
                    <div class="event-detail-item">
                        <div class="event-info">
                            <div class="event-time">${event.startTime} - ${event.endTime}</div>
                            <div class="event-activities">${event.activities.join(' + ')}</div>
                            ${event.comment ? `<div class="event-comment">${event.comment}</div>` : ''}
                        </div>
                        ${adminMode ? `
                            <div class="event-actions">
                                <button class="btn btn-edit" onclick="openEditModalById('${event.id}'); this.closest('.modal').remove();" title="Rediger">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-delete" onclick="deleteActivityById('${event.id}'); this.closest('.modal').remove();" title="Slett">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Lukk</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Filtering
function getFilteredData() {
    // Handle empty database
    if (!openingHours || openingHours.length === 0) {
        return [];
    }
    
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
    
    // Check if "Utelat udefinert" filter is active
    const excludeUndefined = activeFilters.includes('Utelat udefinert');
    
    // Apply activity type filters to future activities
    let filteredActivities = futureActivities.filter(item => 
        item.activities.some(activity => activeFilters.includes(activity))
    );
    
    // If "Utelat udefinert" is active, filter out items that contain "Uavklart"
    if (excludeUndefined) {
        filteredActivities = filteredActivities.filter(item => 
            !item.activities.includes('Uavklart')
        );
    }
    
    return filteredActivities;
}

function filterData() {
    if (currentView === 'list') {
        renderList();
    } else {
        renderCalendar();
    }
}

function clearAllFilters() {
    const checkboxes = document.querySelectorAll('.filter-item input[type="checkbox"]');
    const clearBtn = document.getElementById('clearFilters');
    const icon = clearBtn.querySelector('i');
    
    // Check if all checkboxes are unchecked
    const allUnchecked = Array.from(checkboxes).every(checkbox => !checkbox.checked);
    
    if (allUnchecked) {
        // Re-enable all filters
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        icon.className = 'fas fa-times';
        clearBtn.innerHTML = '<i class="fas fa-times"></i> Fjern alle valg';
    } else {
        // Uncheck all filters
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        icon.className = 'fas fa-check';
        clearBtn.innerHTML = '<i class="fas fa-check"></i> Velg alle';
    }
    
    // Re-render views
    filterData();
}

function toggleFilters() {
    const filterCheckboxes = document.getElementById('filterCheckboxes');
    const toggleBtn = document.getElementById('toggleFilters');
    const icon = toggleBtn.querySelector('i');
    
    if (filterCheckboxes.classList.contains('collapsed')) {
        // Expand
        filterCheckboxes.classList.remove('collapsed');
        filterCheckboxes.classList.add('expanded');
        icon.className = 'fas fa-chevron-up';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Skjul filtre';
    } else {
        // Collapse
        filterCheckboxes.classList.remove('expanded');
        filterCheckboxes.classList.add('collapsed');
        icon.className = 'fas fa-chevron-down';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Vis filtre';
    }
}

// Admin functionality
function openAdminModal() {
    // If already in admin mode, just toggle it off
    if (adminMode) {
        toggleAdminMode();
        return;
    }
    
    // Show PIN dialog first
    showPinDialog();
}

function showPinDialog() {
    // Create PIN dialog if it doesn't exist
    if (!document.getElementById('pinDialog')) {
        createPinDialog();
    }
    
    // Show PIN dialog
    document.getElementById('pinDialog').classList.add('active');
    document.getElementById('pinInput').focus();
}

function createPinDialog() {
    // Remove any existing PIN dialog first
    const existingDialog = document.getElementById('pinDialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    // Remove any existing PIN input elements
    const existingInputs = document.querySelectorAll('#pinInput');
    existingInputs.forEach(input => input.remove());
    
    const pinDialog = document.createElement('div');
    pinDialog.id = 'pinDialog';
    pinDialog.className = 'modal';
    pinDialog.innerHTML = `
        <div class="modal-content pin-dialog">
            <div class="modal-header">
                <h2><i class="fas fa-lock"></i> Admin Tilgang</h2>
                <button class="btn-close" onclick="closePinDialog()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Skriv inn PIN-kode for å få tilgang til admin-panelet:</p>
                <div class="form-group">
                    <input type="text" id="pinInput" placeholder="PIN-kode" maxlength="4" autocomplete="off" style="background: white; color: black;">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closePinDialog()">Avbryt</button>
                    <button type="button" class="btn btn-primary" onclick="verifyPin()">OK</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(pinDialog);
    
    // Add event listeners
    setTimeout(() => {
        const pinInput = document.getElementById('pinInput');
        if (pinInput) {
            pinInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    verifyPin();
                }
            });
        }
    }, 100);
}

function verifyPin() {
    const pinInput = document.getElementById('pinInput');
    
    if (!pinInput) {
        console.error('PIN input element not found!');
        return;
    }
    
    const enteredPin = pinInput.value;
    const correctPin = '0406';
    
    if (enteredPin === correctPin) {
        closePinDialog();
        toggleAdminMode();
        pinInput.value = ''; // Clear input
    } else {
        pinInput.value = ''; // Clear input
        pinInput.placeholder = 'Feil PIN-kode!';
        pinInput.style.borderColor = '#dc2626';
        setTimeout(() => {
            pinInput.placeholder = 'PIN-kode';
            pinInput.style.borderColor = '';
        }, 2000);
    }
}



function closePinDialog() {
    const pinDialog = document.getElementById('pinDialog');
    if (pinDialog) {
        pinDialog.classList.remove('active');
        document.getElementById('pinInput').value = '';
        document.getElementById('pinInput').placeholder = 'PIN-kode';
        document.getElementById('pinInput').style.borderColor = '';
    }
}

function toggleAdminMode() {
    adminMode = !adminMode;
    updateUIForAdminMode();
}

function updateUIForAdminMode() {
    const adminControls = document.getElementById('adminModeControls');
    const adminBtn = document.getElementById('adminBtn');
    const activityCounterMain = document.getElementById('activityCounterMain');
    
    if (adminMode) {
        adminControls.classList.remove('hidden');
        adminBtn.style.background = '#b91c1c';
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i>';
        makeActivitiesEditable();
        // Show activity counter in main view
        if (activityCounterMain) {
            activityCounterMain.classList.remove('hidden');
            // Update the counter when showing it
            updateActivityCounter();
        }
    } else {
        adminControls.classList.add('hidden');
        adminBtn.style.background = '#e74c3c';
        adminBtn.innerHTML = '<i class="fas fa-cog"></i>';
        removeEditableActivities();
        // Hide activity counter in main view
        if (activityCounterMain) {
            activityCounterMain.classList.add('hidden');
        }
    }
    
    // Re-render current view to show/hide delete buttons
    if (currentView === 'list') {
        renderList();
    } else {
        renderCalendar();
    }
}

function makeActivitiesEditable() {
    // Don't make items clickable when we have dedicated edit/delete buttons
    // const listItems = document.querySelectorAll('.list-item');
    // listItems.forEach(item => {
    //     item.classList.add('admin-clickable');
    //     item.addEventListener('click', handleActivityClick);
    // });
}

function removeEditableActivities() {
    // Don't make items clickable when we have dedicated edit/delete buttons
    // const listItems = document.querySelectorAll('.list-item');
    // listItems.forEach(item => {
    //     item.classList.remove('admin-clickable');
    //     item.removeEventListener('click', handleActivityClick);
    // });
}

function handleActivityClick(e) {
    if (!adminMode) return;
    
    const activityId = e.currentTarget.dataset.id;
    const activity = openingHours.find(a => a.id === activityId);
    
    if (activity) {
        openEditModal(activity);
    }
}

function openEditModal(activity) {
    // Open the regular admin modal and switch to add activity panel
    document.getElementById('adminModal').classList.add('active');
    document.getElementById('pinSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    switchAdminPanel('addActivityPanel');
    
    // Pre-fill the form with activity data
    prefillEditForm(activity);
}

function prefillEditForm(activity) {
    // Store the activity being edited for later use
    window.editingActivity = activity;
    
    // Fill form fields with activity data
    document.getElementById('date').value = activity.date;
    
    // Handle new time input format
    if (activity.startTime) {
        const [startHours, startMinutes] = activity.startTime.split(':');
        document.getElementById('startTimeHours').value = startHours;
        document.getElementById('startTimeMinutes').value = startMinutes;
        document.getElementById('startTime').value = activity.startTime;
    }
    
    if (activity.endTime) {
        const [endHours, endMinutes] = activity.endTime.split(':');
        document.getElementById('endTimeHours').value = endHours;
        document.getElementById('endTimeMinutes').value = endMinutes;
        document.getElementById('endTime').value = activity.endTime;
    }
    
    document.getElementById('comment').value = activity.comment || '';
    document.getElementById('rangeOfficer').value = activity.rangeOfficer || '';
    
    // Clear and set activity checkboxes
    const checkboxes = document.querySelectorAll('.activity-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = activity.activities.includes(checkbox.value);
    });
    
    // Change form title and button text
    const formTitle = document.querySelector('#addActivityPanel h4');
    const submitBtn = document.querySelector('#addActivityPanel button[type="submit"]');
    const deleteBtn = document.getElementById('deleteActivityBtn');
    
    if (formTitle) formTitle.textContent = 'Rediger aktivitet';
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Lagre';
    if (deleteBtn) deleteBtn.style.display = 'inline-block';
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
    isAdmin = false;
    
    // Reset edit form if we were editing
    if (window.editingActivity) {
        resetEditForm();
    }
}



async function confirmScrape() {
    console.log('confirmScrape called');
    try {
        // Show loading message
        const loadingMsg = 'Henter data fra Lorenskog Skytterlag kalender...';
        console.log(loadingMsg);
        
        // Calculate dynamic date range: 1 week from today
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        // Format dates for URL (YYYY-MM-DDTHH:MM:SS+02:00 format)
        const timeMin = today.toISOString().replace(/\.\d{3}Z$/, '+02:00');
        const timeMax = nextWeek.toISOString().replace(/\.\d{3}Z$/, '+02:00');
        
        // Google Calendar API URL for Lorenskog Skytterlag with dynamic dates
        const calendarUrl = `https://clients6.google.com/calendar/v3/calendars/2h495fqj8gr9p42361rriptlibc7gf6k%40import.calendar.google.com/events?calendarId=2h495fqj8gr9p42361rriptlibc7gf6k%40import.calendar.google.com&singleEvents=true&eventTypes=default&eventTypes=focusTime&eventTypes=outOfOffice&timeZone=Europe%2FOslo&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&key=AIzaSyDOtGM5jr8bNp1utVpG2_gSRH03RNGBkI8&%24unique=gc237`;
        
        // Fetch calendar data
        console.log('Fetching from URL:', calendarUrl);
        console.log('Date range:', today.toLocaleDateString('no-NO'), 'to', nextWeek.toLocaleDateString('no-NO'));
        const response = await fetch(calendarUrl);
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Calendar data received:', data);
        
        // Parse and convert events
        const newActivities = parseCalendarEvents(data.items);
        
        if (newActivities.length === 0) {
            alert('Ingen nye aktiviteter funnet i kalenderen.');
            return;
        }
        
        // Add new activities to openingHours
        openingHours.push(...newActivities);
        saveData();
        
        // Re-render views
        renderList();
        renderCalendar();
        updateActivityCounter();
        
        alert(`Suksess! ${newActivities.length} nye aktiviteter lagt til fra Lorenskog Skytterlag kalender.\nTidsrom: ${today.toLocaleDateString('no-NO')} - ${nextWeek.toLocaleDateString('no-NO')}`);
        
    } catch (error) {
        console.error('Error scraping calendar:', error);
        alert(`Feil ved henting av kalenderdata: ${error.message}`);
    }
}

function parseCalendarEvents(events) {
    console.log('parseCalendarEvents called with:', events);
    const newActivities = [];
    const processedDates = new Set(); // To avoid duplicates
    
    events.forEach(event => {
        try {
            // Parse event data
            const summary = event.summary || '';
            const startTime = event.start.dateTime;
            const endTime = event.end.dateTime;
            const description = event.description || '';
            
            if (!startTime || !endTime) return;
            
            // Convert to local date
            const startDate = new Date(startTime);
            const dateString = startDate.toISOString().split('T')[0];
            
            // Skip if we already processed this date
            if (processedDates.has(dateString)) return;
            
            // Determine activity type based on summary
            const activityType = determineActivityType(summary);
            if (!activityType) return; // Skip if we can't determine type
            
            // Create new activity
            const newActivity = {
                id: `scraped-${Date.now()}-${Math.random()}`,
                date: dateString,
                dayOfWeek: dayNames[(startDate.getDay() + 6) % 7], // Convert Sunday=0 to Monday=0
                startTime: startDate.toTimeString().slice(0, 5), // HH:MM format
                endTime: new Date(endTime).toTimeString().slice(0, 5),
                activities: [activityType],
                colors: getColorForActivity(activityType),
                comment: `Importert fra Lorenskog Skytterlag: ${summary}`,
                rangeOfficer: extractRangeOfficer(summary)
            };
            
            newActivities.push(newActivity);
            processedDates.add(dateString);
            
        } catch (error) {
            console.error('Error parsing event:', event, error);
        }
    });
    
    return newActivities;
}

function determineActivityType(summary) {
    const summaryLower = summary.toLowerCase();
    
    // First check if this is a "Uavklart" activity (no range officer assigned)
    const rangeOfficer = extractRangeOfficer(summary);
    if (rangeOfficer === 'Ikke satt') {
        return 'Uavklart';
    }
    
    // If we have a range officer assigned, categorize based on the role/activity
    if (summaryLower.includes('standplassleder')) {
        return 'Jeger'; // Standplassleder indicates hunting activity
    }
    if (summaryLower.includes('vakt standplass')) {
        return 'Jeger'; // Range duty indicates hunting activity
    }
    if (summaryLower.includes('klargjøring') || summaryLower.includes('låse opp')) {
        return 'Storviltprøve';
    }
    if (summaryLower.includes('avslutte') || summaryLower.includes('låse')) {
        return 'Jeger';
    }
    if (summaryLower.includes('ledig') || summaryLower.includes('fri')) {
        return 'Uavklart';
    }
    if (summaryLower.includes('åpen') || summaryLower.includes('åpent') || summaryLower.includes('for alle')) {
        return 'Åpen for alle';
    }
    
    // If we have a range officer but can't determine specific activity, default to Jeger
    if (rangeOfficer !== 'Ikke satt') {
        return 'Jeger';
    }
    
    // Default fallback
    return 'Annet';
}

function getColorForActivity(activityType) {
    const colors = {
        'Jeger': '#228B22',
        'DFS': '#FFFFFF',
        'Pistol': '#F59E0B',
        'Storviltprøve': '#3B82F6',
        'Uavklart': '#EF4444',
        'Åpen for alle': '#98FB98',
        'PRS': '#8B5CF6',
        'Leirdue': '#EC4899',
        'Annet': '#6B7280',
        '100m': '#87CEEB',
        '200m': '#4ECDC4'
    };
    return [colors[activityType] || colors['Annet']];
}

function extractRangeOfficer(summary) {
    // Extract person name from summary (e.g., "Thomas Bogdahl - Standplassleder")
    const match = summary.match(/^([^-]+)\s*-\s*/);
    if (!match) {
        return 'Ikke satt';
    }
    
    const personName = match[1].trim();
    const role = summary.substring(match[0].length).trim().toLowerCase();
    
    // Only set range officer if the role is "standplassleder"
    // Don't set for "vakt standplass", "klargjøring", etc.
    if (role === 'standplassleder') {
        return personName;
    }
    
    return 'Ikke satt';
}

// Admin Dashboard Functions
function switchAdminPanel(panelId) {
    console.log('switchAdminPanel called with:', panelId);
    
    // Update menu items
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Update panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Activate selected panel and menu item
    const panel = document.getElementById(panelId);
    console.log('Found panel:', panel);
    if (panel) {
        panel.classList.add('active');
    } else {
        console.error('Panel not found:', panelId);
    }
    
    // Find and activate corresponding menu item
    const menuItemMap = {
        'addActivityPanel': 'addActivityBtn',
        'importCalendarPanel': 'importCalendarBtn',
        'checkDuplicatesPanel': 'checkDuplicatesBtn'
    };
    
    const menuItemId = menuItemMap[panelId];
    if (menuItemId) {
        const menuItem = document.getElementById(menuItemId);
        console.log('Found menu item:', menuItem);
        if (menuItem) {
            menuItem.classList.add('active');
        } else {
            console.error('Menu item not found:', menuItemId);
        }
    }
}

async function startImport() {
    // Define variables at function scope so they're available in catch block
    let importButton = null;
    let originalText = '';
    
    try {
        console.log('startImport called');
        console.log('startImport: About to get form elements...');
        const fromDateElement = document.getElementById('importFromDate');
        const toDateElement = document.getElementById('importToDate');
        const autoCategorizeElement = document.getElementById('autoCategorizeCheckbox');
        
        console.log('Found elements:', { fromDateElement, toDateElement, autoCategorizeElement });
        
        const fromDate = fromDateElement ? fromDateElement.value : '';
        const toDate = toDateElement ? toDateElement.value : '';
        const autoCategorize = autoCategorizeElement ? autoCategorizeElement.checked : false;
        
        console.log('Values:', { fromDate, toDate, autoCategorize });
        
        if (!fromDate || !toDate) {
            alert('Vennligst velg både fra- og til-dato');
            return;
        }
        
        console.log('startImport: About to show loading overlay...');
        
        // Simple loading message
        importButton = document.getElementById('startImportBtn');
        originalText = importButton.textContent;
        importButton.textContent = 'Laster inn...';
        importButton.disabled = true;
        
        closeAdminModal();
        
        const response = await fetch('/api/import/calendar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_date: fromDate,
                to_date: toDate,
                auto_categorize: autoCategorize
            })
        });
        
        // Reset button
        importButton.textContent = originalText;
        importButton.disabled = false;
        
        if (response.ok) {
            const result = await response.json();
            console.log('startImport: Success response:', result);
            
            // Show simple success message
            alert(`Ferdig! ${result.imported_count} aktiviteter importert.`);
            
            // Reload data
            console.log('startImport: Reloading data after import...');
            await loadData();
            console.log('startImport: Data reloaded, rendering views...');
            renderList();
            renderCalendar();
            updateActivityCounter();
            
            // Update empty database message
            const emptyMessage = document.getElementById('emptyDatabaseMessage');
            if (emptyMessage) {
                emptyMessage.style.display = 'none';
            }
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Ukjent feil' }));
            console.error('Import error response:', errorData);
            alert(`Feil ved import av kalender: ${errorData.error || 'Ukjent feil'}`);
        }
    } catch (error) {
        // Reset button on error
        if (importButton) {
            importButton.textContent = originalText;
            importButton.disabled = false;
        }
        
        console.error('Error importing calendar:', error);
        alert(`Feil ved import av kalender: ${error.message}`);
    }
}

async function checkForDuplicates() {
    try {
        const response = await fetch('/api/duplicates');
        if (response.ok) {
            const data = await response.json();
            const duplicates = data.duplicates;
            const resultDiv = document.getElementById('duplicatesResult');
            const removeBtn = document.getElementById('removeDuplicatesBtn');
            
            if (duplicates.length === 0) {
                resultDiv.innerHTML = '<p>✅ Ingen duplikater funnet!</p>';
                removeBtn.classList.add('hidden');
            } else {
                resultDiv.innerHTML = `
                    <p>🔍 Funnet ${duplicates.length} duplikat(er):</p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        ${duplicates.map(dup => `
                            <li>${dup.date} ${dup.startTime}-${dup.endTime}</li>
                        `).join('')}
                    </ul>
                `;
                removeBtn.classList.remove('hidden');
            }
        } else {
            console.error('Error checking duplicates');
        }
    } catch (error) {
        console.error('Error checking duplicates:', error);
    }
}



async function removeDuplicates() {
    try {
        const response = await fetch('/api/duplicates', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Reload data from server
            await loadData();
            renderList();
            renderCalendar();
            updateActivityCounter();
            
            // Update result
            const resultDiv = document.getElementById('duplicatesResult');
            resultDiv.innerHTML = '<p>✅ Duplikater fjernet!</p>';
            
            // Hide remove button
            document.getElementById('removeDuplicatesBtn').classList.add('hidden');
            
            alert('Suksess! Duplikater fjernet.');
        } else {
            alert('Feil ved fjerning av duplikater');
        }
    } catch (error) {
        console.error('Error removing duplicates:', error);
        alert('Feil ved fjerning av duplikater');
    }
}



function updateActivityCounter() {
    const count = openingHours ? openingHours.length : 0;
    
    console.log('Updating activity counter to:', count);
    
    const counter = document.getElementById('activityCount');
    if (counter) {
        counter.textContent = count;
    }
    
    // Also update the main activity counter
    const mainCounter = document.getElementById('activityCountMain');
    if (mainCounter) {
        mainCounter.textContent = count;
    }
    
    // Show/hide empty database message in import panel
    const emptyMessage = document.getElementById('emptyDatabaseMessage');
    if (emptyMessage) {
        if (count === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
    }
}

function updateActivityCount() {
    const count = openingHours ? openingHours.length : 0;
    const counterElements = document.querySelectorAll('#activityCount, #activityCountMain');
    counterElements.forEach(element => {
        element.textContent = count;
    });
}



async function addNewOpening(e) {
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
        'Jeger': '#228B22',
        'DFS': '#FFFFFF',
        'Pistol': '#F59E0B',
        'Storviltprøve': '#3B82F6',
        'Uavklart': '#EF4444',
        'Åpen for alle': '#98FB98',
        'PRS': '#8B5CF6',
        'Leirdue': '#EC4899',
        'Annet': '#6B7280',
        '100m': '#87CEEB',
        '200m': '#4ECDC4'
    };
    
    const selectedColors = selectedActivities.map(activity => colors[activity]);
    
    // Validate date
    const dateObj = new Date(date + 'T00:00:00');
    if (isNaN(dateObj.getTime())) {
        alert('Feil dato! Sjekk at du har valgt gyldig dato.');
        return;
    }
    
    const dayOfWeek = dayNames[(dateObj.getDay() + 6) % 7]; // Convert Sunday=0 to Monday=0
    
    // Check if we're editing an existing activity
    if (window.editingActivity) {
        // Update existing activity
        const updatedActivity = {
            ...window.editingActivity,
            date: date,
            dayOfWeek: dayOfWeek,
            startTime: startTime,
            endTime: endTime,
            activities: selectedActivities,
            colors: selectedColors,
            comment: comment,
            rangeOfficer: rangeOfficer
        };
        
        try {
            const response = await fetch(`/api/activities/${updatedActivity.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedActivity)
            });
            
            if (response.ok) {
                // Update local data
                const activityIndex = openingHours.findIndex(a => a.id === window.editingActivity.id);
                if (activityIndex !== -1) {
                    openingHours[activityIndex] = updatedActivity;
                }
                
                resetEditForm();
                closeAdminModal();
                renderList();
                renderCalendar();
                
                const formattedDate = new Date(date).toLocaleDateString('no-NO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                });
                
                alert(`Aktivitet oppdatert!\n\n${formattedDate}\n${startTime} - ${endTime}\n${selectedActivities.join(' + ')}`);
            } else {
                alert('Feil ved oppdatering av aktivitet');
            }
        } catch (error) {
            console.error('Error updating activity:', error);
            alert('Feil ved oppdatering av aktivitet');
        }
    } else {
        // Create new activity
        const newOpening = {
            id: Date.now().toString(),
            date: date,
            dayOfWeek: dayOfWeek,
            startTime: startTime,
            endTime: endTime,
            activities: selectedActivities,
            colors: selectedColors,
            comment: comment,
            rangeOfficer: rangeOfficer
        };
        
        try {
            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newOpening)
            });
            
                    if (response.ok) {
            // Add to local data
            openingHours.push(newOpening);
            
            // Reset form and close modal
            e.target.reset();
            closeAdminModal();
            
            // Re-render views
            renderList();
            renderCalendar();
            
            // Bedre feedback
            const formattedDate = new Date(date).toLocaleDateString('no-NO', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
            
            alert(`Ny åpningstid lagt til!\n\n${formattedDate}\n${startTime} - ${endTime}\n${selectedActivities.join(' + ')}\n\nAktiviteten vises nå i både liste og kalender.`);
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Ukjent feil' }));
            console.error('Save activity error response:', errorData);
            alert(`Feil ved lagring av aktivitet: ${errorData.error || 'Ukjent feil'}`);
        }
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('Feil ved lagring av aktivitet');
        }
    }
}

function resetEditForm() {
    // Clear editing state
    window.editingActivity = null;
    
    // Reset form title and button text
    const formTitle = document.querySelector('#addActivityPanel h4');
    const submitBtn = document.querySelector('#addActivityPanel button[type="submit"]');
    const deleteBtn = document.getElementById('deleteActivityBtn');
    
    if (formTitle) formTitle.textContent = 'Legg til ny åpningstid';
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Legg til';
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    // Clear all form fields
    const form = document.getElementById('addForm');
    if (form) {
        form.reset(); // Reset all form inputs
        
        // Uncheck all activity checkboxes
        const activityCheckboxes = form.querySelectorAll('input[name="activities"]');
        activityCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

async function deleteActivity() {
    if (!window.editingActivity) return;
    
    if (await showDeleteConfirmation()) {
        try {
            const response = await fetch(`/api/activities/${window.editingActivity.id}`, {
                method: 'DELETE'
            });
            
            console.log('Delete response status:', response.status);
            console.log('Delete response ok:', response.ok);
            
            // Try to parse JSON, but don't fail if it's not JSON
            let data = null;
            try {
                data = await response.json();
                console.log('Delete response data:', data);
            } catch (jsonError) {
                console.log('Response is not JSON, treating as success if status is ok');
            }
            
            if (response.ok) {
                // Remove from local data
                const activityIndex = openingHours.findIndex(a => a.id === window.editingActivity.id);
                if (activityIndex !== -1) {
                    openingHours.splice(activityIndex, 1);
                }
                
                resetEditForm();
                closeAdminModal();
                renderList();
                renderCalendar();
                updateActivityCounter();
                
                alert('Aktivitet slettet!');
            } else {
                alert('Feil ved sletting av aktivitet');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Feil ved sletting av aktivitet');
        }
    }
}

async function deleteActivityById(activityId) {
    if (!await showDeleteConfirmation()) {
        return;
    }
    
    try {
        const response = await fetch(`/api/activities/${activityId}`, {
            method: 'DELETE'
        });
        
        console.log('Delete response status:', response.status);
        console.log('Delete response ok:', response.ok);
        
        // Try to parse JSON, but don't fail if it's not JSON
        let data = null;
        try {
            data = await response.json();
            console.log('Delete response data:', data);
        } catch (jsonError) {
            console.log('Response is not JSON, treating as success if status is ok');
        }
        
        if (response.ok) {
            // Remove from local array
            const index = openingHours.findIndex(item => item.id === activityId);
            if (index > -1) {
                openingHours.splice(index, 1);
            }
            
            // Update UI
            renderList();
            renderCalendar();
            updateActivityCounter();
            
            // Don't show alert for successful deletion
        } else {
            alert('Feil ved sletting av aktivitet');
        }
    } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Feil ved sletting av aktivitet');
    }
}

function showDeleteConfirmation() {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'delete-confirmation-overlay';
        overlay.innerHTML = `
            <div class="delete-confirmation-modal">
                <div class="delete-confirmation-content">
                    <h3>Slett aktivitet</h3>
                    <p>Er du sikker på at du vil slette denne aktiviteten?</p>
                    <div class="delete-confirmation-buttons">
                        <button class="btn btn-secondary" id="cancelDelete">Avbryt</button>
                        <button class="btn btn-danger" id="confirmDelete" autofocus>OK</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Focus on OK button by default
        const okButton = overlay.querySelector('#confirmDelete');
        okButton.focus();
        
        // Handle button clicks
        overlay.querySelector('#confirmDelete').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        overlay.querySelector('#cancelDelete').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        
        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Handle click outside modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        });
    });
}

async function deleteAllActivities() {
    if (!await showDeleteAllConfirmation()) {
        return;
    }
    
    try {
        const response = await fetch('/api/activities/all', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Clear local array
            openingHours.length = 0;
            
            // Update UI
            renderList();
            renderCalendar();
            updateActivityCounter();
            
            alert('Alle aktiviteter er slettet!');
        } else {
            alert('Feil ved sletting av alle aktiviteter');
        }
    } catch (error) {
        console.error('Error deleting all activities:', error);
        alert('Feil ved sletting av alle aktiviteter');
    }
}

function showDeleteAllConfirmation() {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'delete-confirmation-overlay';
        overlay.innerHTML = `
            <div class="delete-confirmation-modal">
                <div class="delete-confirmation-content">
                    <h3>Slett alle aktiviteter</h3>
                    <p>Er du sikker på at du vil slette ALLE aktiviteter? Dette kan ikke angres!</p>
                    <div class="delete-confirmation-buttons">
                        <button class="btn btn-secondary" id="cancelDeleteAll">Avbryt</button>
                        <button class="btn btn-danger" id="confirmDeleteAll" autofocus>Slett alle</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Focus on delete button by default
        const deleteButton = overlay.querySelector('#confirmDeleteAll');
        deleteButton.focus();
        
        // Handle button clicks
        overlay.querySelector('#confirmDeleteAll').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        overlay.querySelector('#cancelDeleteAll').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        
        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Handle click outside modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        });
    });
}

function openEditModalById(activityId) {
    const activity = openingHours.find(a => a.id === activityId);
    if (activity) {
        openEditModal(activity);
    }
}

// Utility functions
function formatDate(date) {
    return date.toLocaleDateString('no-NO', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

function formatTime(time) {
    return time;
}

function setupImportDateDefaults() {
    console.log('setupImportDateDefaults called');
    const today = new Date();
    const fromDate = document.getElementById('importFromDate');
    const toDate = document.getElementById('importToDate');
    
    console.log('Found fromDate element:', fromDate);
    console.log('Found toDate element:', toDate);
    
    if (!fromDate || !toDate) {
        console.error('Date input elements not found!');
        return;
    }
    
    // Set default from date to today
    const todayString = today.toISOString().split('T')[0];
    fromDate.value = todayString;
    console.log('Set fromDate to:', todayString);
    
    // Set default to date to 7 days from today
    const toDateObj = new Date(today);
    toDateObj.setDate(today.getDate() + 7);
    const toDateString = toDateObj.toISOString().split('T')[0];
    toDate.value = toDateString;
    console.log('Set toDate to:', toDateString);
    
    // Update period display
    updateImportPeriodDisplay();
    
    // Add event listeners to update display when dates change
    fromDate.addEventListener('change', updateImportPeriodDisplay);
    toDate.addEventListener('change', updateImportPeriodDisplay);
    console.log('Added event listeners to date inputs');
}

function setupTimeInputs() {
    const startTimeHours = document.getElementById('startTimeHours');
    const startTimeMinutes = document.getElementById('startTimeMinutes');
    const endTimeHours = document.getElementById('endTimeHours');
    const endTimeMinutes = document.getElementById('endTimeMinutes');
    const startTimeHidden = document.getElementById('startTime');
    const endTimeHidden = document.getElementById('endTime');
    
    function updateHiddenTime(hoursInput, minutesInput, hiddenInput) {
        const hours = hoursInput.value.padStart(2, '0');
        const minutes = minutesInput.value.padStart(2, '0');
        hiddenInput.value = `${hours}:${minutes}`;
    }
    
    if (startTimeHours && startTimeMinutes && startTimeHidden) {
        startTimeHours.addEventListener('input', () => updateHiddenTime(startTimeHours, startTimeMinutes, startTimeHidden));
        startTimeMinutes.addEventListener('input', () => updateHiddenTime(startTimeHours, startTimeMinutes, startTimeHidden));
    }
    
    if (endTimeHours && endTimeMinutes && endTimeHidden) {
        endTimeHours.addEventListener('input', () => updateHiddenTime(endTimeHours, endTimeMinutes, endTimeHidden));
        endTimeMinutes.addEventListener('input', () => updateHiddenTime(endTimeHours, endTimeMinutes, endTimeHidden));
    }
}

function updateImportPeriodDisplay() {
    console.log('updateImportPeriodDisplay called');
    const fromDate = document.getElementById('importFromDate');
    const toDate = document.getElementById('importToDate');
    const display = document.getElementById('importPeriodDisplay');
    
    console.log('Found elements:', { fromDate, toDate, display });
    
    if (fromDate && toDate && fromDate.value && toDate.value) {
        const from = new Date(fromDate.value);
        const to = new Date(toDate.value);
        
        const fromFormatted = from.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const toFormatted = to.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        if (display) {
            display.textContent = `${fromFormatted} - ${toFormatted}`;
            console.log('Updated display to:', display.textContent);
        } else {
            console.error('Display element not found');
        }
    } else {
        if (display) {
            display.textContent = 'Velg periode';
            console.log('Set display to default text');
        } else {
            console.error('Display element not found');
        }
    }
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