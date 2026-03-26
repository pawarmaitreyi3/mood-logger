// Mood Logger App - JavaScript

// Google Sheets Web App URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbznZx6TOK1WTLkvk2IuP3oFZTEgErcN9S8ya_5fZdtPN6wNZvm7Ty24wmtCM39PPdGy/exec';

// State to track current selections
let selectedMood = null;
let selectedTriggers = [];
let intensity = 5;
let selectedDate = new Date();
let currentMonth = new Date();
let isDesktopView = false;

// DOM Elements
const moodCards = document.querySelectorAll('.mood-card');
const triggerTags = document.querySelectorAll('.trigger-tag');
const intensitySlider = document.getElementById('intensitySlider');
const sliderValue = document.getElementById('sliderValue');
const sliderEmoji = document.getElementById('sliderEmoji');
const moodNote = document.getElementById('moodNote');
const logButton = document.getElementById('logButton');
const successMessage = document.getElementById('successMessage');

// Calendar Elements
const datePickerDisplay = document.getElementById('datePickerDisplay');
const selectedDateText = document.getElementById('selectedDateText');
const calendarDropdown = document.getElementById('calendarDropdown');
const calendarDays = document.getElementById('calendarDays');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');

// View Toggle Elements
const viewToggle = document.getElementById('viewToggle');
const viewLabels = document.querySelectorAll('.view-label');

// Initialize the app
function init() {
    setupViewToggle();
    setupCalendar();
    setupMoodCards();
    setupTriggerTags();
    setupIntensitySlider();
    setupLogButton();
}

// Setup calendar
function setupCalendar() {
    // Set initial date display
    updateSelectedDateDisplay();
    renderCalendar();

    // Toggle calendar dropdown
    datePickerDisplay.addEventListener('click', () => {
        datePickerDisplay.classList.toggle('open');
        calendarDropdown.classList.toggle('open');
    });

    // Close calendar when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.date-picker-container')) {
            datePickerDisplay.classList.remove('open');
            calendarDropdown.classList.remove('open');
        }
    });

    // Navigation buttons
    prevMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });

    // Today button
    todayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDate = new Date();
        currentMonth = new Date();
        updateSelectedDateDisplay();
        renderCalendar();
        closeCalendar();
    });
}

// Render calendar days
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Clear previous days
    calendarDays.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const btn = createDayButton(day, 'other-month');
        btn.disabled = true;
        calendarDays.appendChild(btn);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const btn = createDayButton(day);

        // Check if it's today
        if (date.getTime() === today.getTime()) {
            btn.classList.add('today');
        }

        // Check if it's selected
        const selectedDateCopy = new Date(selectedDate);
        selectedDateCopy.setHours(0, 0, 0, 0);
        if (date.getTime() === selectedDateCopy.getTime()) {
            btn.classList.add('selected');
        }

        // Check if it's in the future
        if (date > today) {
            btn.classList.add('future');
            btn.disabled = true;
        } else {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedDate = date;
                updateSelectedDateDisplay();
                renderCalendar();
                closeCalendar();
            });
        }

        calendarDays.appendChild(btn);
    }

    // Next month days (fill remaining slots)
    const totalCells = 42; // 6 rows x 7 days
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const btn = createDayButton(day, 'other-month');
        btn.disabled = true;
        calendarDays.appendChild(btn);
    }
}

// Create a day button
function createDayButton(day, extraClass = '') {
    const btn = document.createElement('button');
    btn.className = `calendar-day ${extraClass}`;
    btn.textContent = day;
    return btn;
}

// Update the selected date display
function updateSelectedDateDisplay() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDateCopy = new Date(selectedDate);
    selectedDateCopy.setHours(0, 0, 0, 0);

    if (selectedDateCopy.getTime() === today.getTime()) {
        selectedDateText.textContent = 'Today';
    } else {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        selectedDateText.textContent = selectedDate.toLocaleDateString('en-US', options);
    }
}

// Close calendar dropdown
function closeCalendar() {
    datePickerDisplay.classList.remove('open');
    calendarDropdown.classList.remove('open');
}

// Setup mood card click handlers
function setupMoodCards() {
    moodCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from all cards
            moodCards.forEach(c => c.classList.remove('selected'));

            // Select clicked card
            card.classList.add('selected');
            selectedMood = card.dataset.mood;
        });
    });
}

// Setup trigger tag click handlers (multiple selection allowed)
function setupTriggerTags() {
    triggerTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const trigger = tag.dataset.trigger;

            if (tag.classList.contains('selected')) {
                // Deselect
                tag.classList.remove('selected');
                selectedTriggers = selectedTriggers.filter(t => t !== trigger);
            } else {
                // Select
                tag.classList.add('selected');
                selectedTriggers.push(trigger);
            }
        });
    });
}

// Setup intensity slider
function setupIntensitySlider() {
    // Position emoji on initial load
    updateSliderEmoji();

    intensitySlider.addEventListener('input', (e) => {
        intensity = e.target.value;
        sliderValue.textContent = intensity;
        updateSliderEmoji();
    });
}

// Update emoji position based on slider value
function updateSliderEmoji() {
    const min = intensitySlider.min;
    const max = intensitySlider.max;
    const value = intensitySlider.value;
    const percentage = ((value - min) / (max - min)) * 100;

    // Account for thumb width offset
    const thumbOffset = 18; // half of thumb width
    const sliderWidth = intensitySlider.offsetWidth;
    const position = (percentage / 100) * (sliderWidth - thumbOffset * 2) + thumbOffset;

    sliderEmoji.style.left = position + 'px';
}

// Setup log button
function setupLogButton() {
    logButton.addEventListener('click', () => {
        // Validate that a mood is selected
        if (!selectedMood) {
            alert('Please select a mood before logging.');
            return;
        }

        // Create mood entry with selected date
        const moodEntry = {
            id: Date.now(),
            date: selectedDate.toISOString(),
            mood: selectedMood,
            intensity: parseInt(intensity),
            triggers: selectedTriggers,
            note: moodNote.value.trim()
        };

        // Save to local storage
        saveMoodEntry(moodEntry);

        // Send to Google Sheets
        sendToGoogleSheets(moodEntry);

        // Show success message
        showSuccessMessage();

        // Reset form after a delay
        setTimeout(() => {
            resetForm();
        }, 2000);
    });
}

// Save mood entry to local storage
function saveMoodEntry(entry) {
    let moodHistory = getMoodHistory();
    moodHistory.push(entry);
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    console.log('Mood logged:', entry);
}

// Send mood entry to Google Sheets
function sendToGoogleSheets(entry) {
    const data = {
        date: new Date(entry.date).toLocaleDateString(),
        time: new Date(entry.date).toLocaleTimeString(),
        mood: entry.mood,
        intensity: entry.intensity,
        triggers: entry.triggers.join(', '),
        note: entry.note
    };

    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        console.log('Data sent to Google Sheets');
    })
    .catch(error => {
        console.error('Error sending to Google Sheets:', error);
    });
}

// Get mood history from local storage
function getMoodHistory() {
    const history = localStorage.getItem('moodHistory');
    return history ? JSON.parse(history) : [];
}

// Show success message
function showSuccessMessage() {
    successMessage.classList.add('show');
    logButton.disabled = true;
    logButton.textContent = 'Logged!';
}

// Reset the form
function resetForm() {
    // Reset state
    selectedMood = null;
    selectedTriggers = [];
    intensity = 5;
    selectedDate = new Date();
    currentMonth = new Date();

    // Reset UI
    moodCards.forEach(card => card.classList.remove('selected'));
    triggerTags.forEach(tag => tag.classList.remove('selected'));
    intensitySlider.value = 5;
    sliderValue.textContent = '5';
    updateSliderEmoji();
    moodNote.value = '';
    updateSelectedDateDisplay();
    renderCalendar();

    // Hide success message
    successMessage.classList.remove('show');

    // Re-enable button
    logButton.disabled = false;
    logButton.textContent = 'Log My Mood';
}

// View mood history (utility function for console)
function viewMoodHistory() {
    const history = getMoodHistory();
    console.table(history);
    return history;
}

// Clear mood history (utility function for console)
function clearMoodHistory() {
    localStorage.removeItem('moodHistory');
    console.log('Mood history cleared.');
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Setup view toggle
function setupViewToggle() {
    // Load saved preference
    const savedView = localStorage.getItem('viewPreference');
    if (savedView === 'desktop') {
        isDesktopView = true;
        applyDesktopView();
    } else {
        updateViewLabels();
    }

    // Toggle click handler
    viewToggle.addEventListener('click', () => {
        isDesktopView = !isDesktopView;

        if (isDesktopView) {
            applyDesktopView();
            localStorage.setItem('viewPreference', 'desktop');
        } else {
            applyPhoneView();
            localStorage.setItem('viewPreference', 'phone');
        }

        // Update slider emoji position after view change
        setTimeout(updateSliderEmoji, 100);
    });
}

// Apply desktop view
function applyDesktopView() {
    document.body.classList.add('desktop-view');
    viewToggle.classList.add('desktop');
    updateViewLabels();
}

// Apply phone view
function applyPhoneView() {
    document.body.classList.remove('desktop-view');
    viewToggle.classList.remove('desktop');
    updateViewLabels();
}

// Update view labels (highlight active)
function updateViewLabels() {
    if (viewLabels.length >= 2) {
        if (isDesktopView) {
            viewLabels[0].classList.remove('active');
            viewLabels[1].classList.add('active');
        } else {
            viewLabels[0].classList.add('active');
            viewLabels[1].classList.remove('active');
        }
    }
}
