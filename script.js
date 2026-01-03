const YEAR = 2026;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

const TOTAL_DAYS = isLeapYear(YEAR) ? 366 : 365;

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function formatDateForTooltip(dayNum) {
  const date = new Date(YEAR, 0, dayNum);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
}

function formatDateTime(date) {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return { month, day, year, hours, minutes, seconds };
}

let previousValues = {};

function createFlipCard(char, type, id) {
  const card = document.createElement('div');
  card.className = 'flip-card' + (type === 'letter' ? ' letter' : '');
  card.dataset.id = id;
  card.dataset.value = char;
  
  card.innerHTML = 
    '<div class="flip-card-inner">' +
      '<div class="flip-card-front">' +
        '<div class="flip-top"><span>' + char + '</span></div>' +
        '<div class="flip-bottom"><span>' + char + '</span></div>' +
      '</div>' +
      '<div class="flip-card-top-flip">' +
        '<div class="flip-top"><span>' + char + '</span></div>' +
      '</div>' +
      '<div class="flip-card-bottom-flip">' +
        '<div class="flip-bottom"><span>' + char + '</span></div>' +
      '</div>' +
    '</div>';
  
  return card;
}

function createSeparator(char) {
  const sep = document.createElement('div');
  sep.className = 'flip-card separator';
  sep.innerHTML = '<span>' + char + '</span>';
  return sep;
}

function createSpace() {
  const space = document.createElement('div');
  space.className = 'flip-card space';
  return space;
}

function updateFlipCard(card, newValue) {
  const oldValue = card.dataset.value;
  if (oldValue === newValue) return;
  
  card.dataset.value = newValue;
  
  const topFlip = card.querySelector('.flip-card-top-flip .flip-top span');
  const bottomFlip = card.querySelector('.flip-card-bottom-flip .flip-bottom span');
  const frontTop = card.querySelector('.flip-card-front .flip-top span');
  const frontBottom = card.querySelector('.flip-card-front .flip-bottom span');
  
  // Setup: front shows old value, top flip shows old (will flip down)
  // Behind top flip, we need new value visible
  topFlip.textContent = oldValue;
  bottomFlip.textContent = newValue;
  
  // Immediately set front top to new value (hidden behind flipping top)
  frontTop.textContent = newValue;
  
  // Trigger animation
  card.classList.add('flipping');
  
  // After top flips down (halfway), update bottom
  setTimeout(function() {
    frontBottom.textContent = newValue;
  }, 300);
  
  // After full animation, clean up
  setTimeout(function() {
    card.classList.remove('flipping');
    topFlip.textContent = newValue;
  }, 600);
}

function initFlipClock() {
  const container = document.getElementById('datetime');
  container.innerHTML = '';
  
  const now = new Date();
  const data = formatDateTime(now);
  
  // Month
  for (let i = 0; i < data.month.length; i++) {
    container.appendChild(createFlipCard(data.month[i], 'letter', 'month-' + i));
  }
  
  container.appendChild(createSpace());
  
  // Day
  for (let i = 0; i < data.day.length; i++) {
    container.appendChild(createFlipCard(data.day[i], 'number', 'day-' + i));
  }
  
  container.appendChild(createSeparator(','));
  container.appendChild(createSpace());
  
  // Year
  for (let i = 0; i < data.year.length; i++) {
    container.appendChild(createFlipCard(data.year[i], 'number', 'year-' + i));
  }
  
  container.appendChild(createSpace());
  container.appendChild(createSpace());
  
  // Hours
  for (let i = 0; i < data.hours.length; i++) {
    container.appendChild(createFlipCard(data.hours[i], 'number', 'hours-' + i));
  }
  
  container.appendChild(createSeparator(':'));
  
  // Minutes
  for (let i = 0; i < data.minutes.length; i++) {
    container.appendChild(createFlipCard(data.minutes[i], 'number', 'minutes-' + i));
  }
  
  container.appendChild(createSeparator(':'));
  
  // Seconds
  for (let i = 0; i < data.seconds.length; i++) {
    container.appendChild(createFlipCard(data.seconds[i], 'number', 'seconds-' + i));
  }
  
  previousValues = data;
}

function updateFlipClock() {
  const data = formatDateTime(new Date());
  const container = document.getElementById('datetime');
  
  // Update each card if value changed
  const updates = [
    { prefix: 'month-', value: data.month, prev: previousValues.month },
    { prefix: 'day-', value: data.day, prev: previousValues.day },
    { prefix: 'year-', value: data.year, prev: previousValues.year },
    { prefix: 'hours-', value: data.hours, prev: previousValues.hours },
    { prefix: 'minutes-', value: data.minutes, prev: previousValues.minutes },
    { prefix: 'seconds-', value: data.seconds, prev: previousValues.seconds }
  ];
  
  updates.forEach(function(item) {
    for (let i = 0; i < item.value.length; i++) {
      if (item.prev && item.prev[i] !== item.value[i]) {
        const card = container.querySelector('[data-id="' + item.prefix + i + '"]');
        if (card) {
          updateFlipCard(card, item.value[i]);
        }
      }
    }
  });
  
  previousValues = data;
}

function getYearProgress(date) {
  const startOfYear = new Date(YEAR, 0, 1);
  const endOfYear = new Date(YEAR + 1, 0, 1);
  const now = date.getTime();
  const start = startOfYear.getTime();
  const end = endOfYear.getTime();
  
  if (now < start) return 0;
  if (now >= end) return 100;
  
  return ((now - start) / (end - start)) * 100;
}

function createGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    dayElement.dataset.day = day;
    dayElement.dataset.date = formatDateForTooltip(day);
    grid.appendChild(dayElement);
  }
}

function update() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  let currentDayOfYear;
  if (currentYear < YEAR) {
    currentDayOfYear = 0;
  } else if (currentYear > YEAR) {
    currentDayOfYear = TOTAL_DAYS + 1;
  } else {
    currentDayOfYear = getDayOfYear(now);
  }
  
  const progress = getYearProgress(now);
  
  document.getElementById('percentage').textContent = progress.toFixed(1) + '%';
  updateFlipClock();
  
  const days = document.querySelectorAll('.day');
  days.forEach(function(dayElement, index) {
    const dayNum = index + 1;
    dayElement.classList.remove('past', 'current');
    
    if (dayNum < currentDayOfYear) {
      dayElement.classList.add('past');
    } else if (dayNum === currentDayOfYear) {
      dayElement.classList.add('current');
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  createGrid();
  initFlipClock();
  
  // Initial update
  const now = new Date();
  const currentYear = now.getFullYear();
  let currentDayOfYear;
  if (currentYear < YEAR) {
    currentDayOfYear = 0;
  } else if (currentYear > YEAR) {
    currentDayOfYear = TOTAL_DAYS + 1;
  } else {
    currentDayOfYear = getDayOfYear(now);
  }
  const progress = getYearProgress(now);
  document.getElementById('percentage').textContent = progress.toFixed(1) + '%';
  
  const days = document.querySelectorAll('.day');
  days.forEach(function(dayElement, index) {
    const dayNum = index + 1;
    if (dayNum < currentDayOfYear) {
      dayElement.classList.add('past');
    } else if (dayNum === currentDayOfYear) {
      dayElement.classList.add('current');
    }
  });
  
  // Start interval
  setInterval(update, 1000);
});
