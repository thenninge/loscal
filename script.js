// App state
let currentView = 'list';
let currentMonth = new Date();
let isAdmin = false;
let adminPin = '1234'; // Default PIN - should be configurable
let adminMode = false;

// Initialize openingHours as empty array
let openingHours = [];

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
function loadData() {
    const saved = localStorage.getItem('skytebaneData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Check if saved data has the new structure
            if (parsed.length > 0 && parsed[0].activities) {
                openingHours = parsed;
                // Migrate "Ledig" to "Uavklart" in existing data
                migrateLedigToUavklart();
            } else {
                // Old data structure, clear it and use default
                localStorage.removeItem('skytebaneData');
                console.log('Cleared old data structure, using defaults');
                // Ensure openingHours is initialized with default data
                if (!openingHours || openingHours.length === 0) {
                    openingHours = getDefaultData();
                }
            }
        } catch (e) {
            console.log('Error parsing saved data, using defaults');
            localStorage.removeItem('skytebaneData');
            // Ensure openingHours is initialized with default data
            if (!openingHours || openingHours.length === 0) {
                openingHours = getDefaultData();
            }
        }
    } else {
        // No saved data, use defaults
        if (!openingHours || openingHours.length === 0) {
            openingHours = getDefaultData();
        }
    }
    
    const savedPin = localStorage.getItem('adminPin');
    if (savedPin) {
        adminPin = savedPin;
    }
    
    console.log('Loaded data:', openingHours);
    console.log('openingHours length:', openingHours ? openingHours.length : 'undefined');
    
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
        saveData(); // Save the migrated data
    }
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
    
    // Admin mode controls on main page
    document.getElementById('addActivityBtnMain').addEventListener('click', () => {
        document.getElementById('adminModal').classList.add('active');
        document.getElementById('pinSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        switchAdminPanel('addActivityPanel');
        resetEditForm(); // Clear form for new activity
        updateActivityCounter();
    });
    
    document.getElementById('importCalendarBtnMain').addEventListener('click', () => {
        document.getElementById('adminModal').classList.add('active');
        document.getElementById('pinSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        switchAdminPanel('importCalendarPanel');
    });
    
    document.getElementById('checkDuplicatesBtnMain').addEventListener('click', () => {
        document.getElementById('adminModal').classList.add('active');
        document.getElementById('pinSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        switchAdminPanel('checkDuplicatesPanel');
        checkForDuplicates();
    });
    
    // Admin dashboard menu
    document.getElementById('addActivityBtn').addEventListener('click', () => {
        switchAdminPanel('addActivityPanel');
        resetEditForm(); // Clear form for new activity
    });
    document.getElementById('importCalendarBtn').addEventListener('click', () => switchAdminPanel('importCalendarPanel'));
    document.getElementById('checkDuplicatesBtn').addEventListener('click', () => switchAdminPanel('checkDuplicatesPanel'));
    
    // Import calendar button
    document.getElementById('startImportBtn').addEventListener('click', startImport);
    
    // Check duplicates button (in panel)
    document.getElementById('checkDuplicatesBtn').addEventListener('click', checkForDuplicates);
    document.getElementById('removeDuplicatesBtn').addEventListener('click', removeDuplicates);
    
    // Modal events
    document.getElementById('closeModal').addEventListener('click', closeAdminModal);
    
    // Form submission
    const addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.addEventListener('submit', addNewOpening);
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
    document.getElementById('deleteActivityBtn').addEventListener('click', deleteActivity);
    
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
    
    const activityBadges = item.activities.map((activity, index) => 
        `<span class="activity-badge ${activity}" style="background-color: ${item.colors[index]}">${activity}</span>`
    ).join('');
    
    return `
        <div class="list-item ${item.activities[0]}" data-id="${item.id}">
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
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
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
    console.log('Creating PIN dialog...');
    
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
                    <input type="password" id="pinInput" placeholder="PIN-kode" maxlength="4" autocomplete="off">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closePinDialog()">Avbryt</button>
                    <button type="button" class="btn btn-primary" onclick="verifyPin()">OK</button>
                    <button type="button" class="btn btn-warning" onclick="testPinInput()">Test Input</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(pinDialog);
    
    // Wait a bit for DOM to be ready, then add event listeners
    setTimeout(() => {
        const pinInput = document.getElementById('pinInput');
        console.log('PIN Input element after creation:', pinInput);
        
        if (pinInput) {
            pinInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    verifyPin();
                }
            });
            
            // Test input functionality
            pinInput.addEventListener('input', function(e) {
                console.log('PIN Input changed:', e.target.value);
            });
            
            console.log('Event listener added to PIN input');
        } else {
            console.error('PIN input element not found after creation!');
        }
    }, 100);
}

function verifyPin() {
    const pinInput = document.getElementById('pinInput');
    
    console.log('PIN Input element:', pinInput);
    console.log('PIN Input value:', pinInput ? pinInput.value : 'Element not found');
    console.log('PIN Input focused:', pinInput ? pinInput === document.activeElement : 'Element not found');
    
    if (!pinInput) {
        console.error('PIN input element not found!');
        return;
    }
    
    // Try to focus the input first
    pinInput.focus();
    
    // Wait a moment and then read the value
    setTimeout(() => {
        console.log('About to read PIN value...');
        console.log('PIN Input value before reading:', pinInput.value);
        
        const enteredPin = pinInput.value;
        const correctPin = '0406';
        
        console.log('PIN Debug after focus:', {
            enteredPin: enteredPin,
            correctPin: correctPin,
            enteredPinType: typeof enteredPin,
            correctPinType: typeof correctPin,
            enteredPinLength: enteredPin.length,
            correctPinLength: correctPin.length,
            isEqual: enteredPin === correctPin
        });
        
        if (enteredPin === correctPin) {
            console.log('PIN riktig! Åpner admin-panel...');
            closePinDialog();
            toggleAdminMode();
            console.log('Clearing PIN input after success');
            pinInput.value = ''; // Clear input
        } else {
            console.log('PIN feil! Viser feilmelding...');
            console.log('Clearing PIN input after failure');
            pinInput.value = ''; // Clear input
            pinInput.placeholder = 'Feil PIN-kode!';
            pinInput.style.borderColor = '#dc2626';
            setTimeout(() => {
                pinInput.placeholder = 'PIN-kode';
                pinInput.style.borderColor = '';
            }, 2000);
        }
    }, 100);
}

function testPinInput() {
    const pinInput = document.getElementById('pinInput');
    console.log('=== TESTING PIN INPUT ===');
    console.log('Input element:', pinInput);
    console.log('Input value:', pinInput ? pinInput.value : 'Element not found');
    console.log('Input focused:', pinInput ? pinInput === document.activeElement : 'Element not found');
    console.log('Input disabled:', pinInput ? pinInput.disabled : 'Element not found');
    console.log('Input readonly:', pinInput ? pinInput.readOnly : 'Element not found');
    console.log('Input type:', pinInput ? pinInput.type : 'Element not found');
    console.log('Input maxlength:', pinInput ? pinInput.maxLength : 'Element not found');
    console.log('=======================');
    
    // Try to set a test value
    if (pinInput) {
        pinInput.value = '0406';
        console.log('Set correct PIN "0406"');
        console.log('New input value:', pinInput.value);
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
    
    if (adminMode) {
        adminControls.classList.remove('hidden');
        adminBtn.style.background = '#b91c1c';
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i>';
        makeActivitiesEditable();
    } else {
        adminControls.classList.add('hidden');
        adminBtn.style.background = '#e74c3c';
        adminBtn.innerHTML = '<i class="fas fa-cog"></i>';
        removeEditableActivities();
    }
}

function makeActivitiesEditable() {
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
        item.classList.add('admin-clickable');
        item.addEventListener('click', handleActivityClick);
    });
}

function removeEditableActivities() {
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
        item.classList.remove('admin-clickable');
        item.removeEventListener('click', handleActivityClick);
    });
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
    document.getElementById('startTime').value = activity.startTime;
    document.getElementById('endTime').value = activity.endTime;
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
    if (submitBtn) submitBtn.textContent = 'Oppdater aktivitet';
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
    
    // Map vaktplan terms to our activity types
    if (summaryLower.includes('klargjøring') || summaryLower.includes('låse opp')) {
        return 'Storviltprøve';
    }
    if (summaryLower.includes('standplassleder')) {
        return 'Jaktskyting';
    }
    if (summaryLower.includes('vakt standplass')) {
        return 'Jaktskyting';
    }
    if (summaryLower.includes('avslutte') || summaryLower.includes('låse')) {
        return 'Jaktskyting';
    }
    if (summaryLower.includes('ledig') || summaryLower.includes('fri')) {
        return 'Uavklart';
    }
    if (summaryLower.includes('åpen') || summaryLower.includes('åpent') || summaryLower.includes('for alle')) {
        return 'Åpen for alle';
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
    return match ? match[1].trim() : 'Ikke satt';
}

// Admin Dashboard Functions
function switchAdminPanel(panelId) {
    // Update menu items
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Update panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Activate selected panel and menu item
    document.getElementById(panelId).classList.add('active');
    
    // Find and activate corresponding menu item
    const menuItemMap = {
        'addActivityPanel': 'addActivityBtn',
        'importCalendarPanel': 'importCalendarBtn',
        'checkDuplicatesPanel': 'checkDuplicatesBtn'
    };
    
    const menuItemId = menuItemMap[panelId];
    if (menuItemId) {
        document.getElementById(menuItemId).classList.add('active');
    }
}

function startImport() {
    // This is the same as confirmScrape but with better naming
    console.log('startImport called');
    confirmScrape();
}

function checkForDuplicates() {
    const duplicates = findDuplicates();
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
                    <li>${dup.date} ${dup.startTime}-${dup.endTime}: ${dup.activities.join(' + ')}</li>
                `).join('')}
            </ul>
        `;
        removeBtn.classList.remove('hidden');
    }
}

function findDuplicates() {
    const duplicates = [];
    const seen = new Map(); // date + time as key
    
    openingHours.forEach(activity => {
        const key = `${activity.date}-${activity.startTime}-${activity.endTime}`;
        
        if (seen.has(key)) {
            duplicates.push(activity);
        } else {
            seen.set(key, true);
        }
    });
    
    return duplicates;
}

function removeDuplicates() {
    const duplicates = findDuplicates();
    const duplicateIds = new Set(duplicates.map(d => d.id));
    
    // Remove duplicates from openingHours
    openingHours = openingHours.filter(activity => !duplicateIds.has(activity.id));
    
    // Save and refresh
    saveData();
    renderList();
    renderCalendar();
    updateActivityCounter();
    
    // Update result
    const resultDiv = document.getElementById('duplicatesResult');
    resultDiv.innerHTML = `<p>✅ ${duplicates.length} duplikat(er) fjernet!</p>`;
    
    // Hide remove button
    document.getElementById('removeDuplicatesBtn').classList.add('hidden');
    
    alert(`Suksess! ${duplicates.length} duplikat(er) fjernet.`);
}



function updateActivityCounter() {
    const counter = document.getElementById('activityCount');
    if (counter) {
        counter.textContent = openingHours ? openingHours.length : 0;
    }
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
        const activityIndex = openingHours.findIndex(a => a.id === window.editingActivity.id);
        if (activityIndex !== -1) {
            openingHours[activityIndex] = {
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
            
            saveData();
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
        
        openingHours.push(newOpening);
        saveData();
        
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
    if (submitBtn) submitBtn.textContent = 'Legg til';
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

function deleteActivity() {
    if (!window.editingActivity) return;
    
    if (confirm('Er du sikker på at du vil slette denne aktiviteten?')) {
        const activityIndex = openingHours.findIndex(a => a.id === window.editingActivity.id);
        if (activityIndex !== -1) {
            openingHours.splice(activityIndex, 1);
            saveData();
            resetEditForm();
            closeAdminModal();
            renderList();
            renderCalendar();
            updateActivityCounter();
            
            alert('Aktivitet slettet!');
        }
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