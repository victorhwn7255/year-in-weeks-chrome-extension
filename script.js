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

  // Update compound screen
  updateCompoundScreen(currentDayOfYear);
}

// ========== COMPOUND SCREEN FUNCTIONS ==========
function generateCurvePoints() {
  const points = [];
  const startX = 20;
  const endX = 355;
  const startY = 175;
  const endY = 20;
  const graphWidth = endX - startX;
  const graphHeight = startY - endY;
  
  for (let d = 0; d <= 365; d += 3) {
    const x = startX + (d / 365) * graphWidth;
    const y = startY - ((Math.pow(1.01, d) - 1) / 36.78) * graphHeight;
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

function updateCompoundScreen(dayOfYear) {
  const multiplier = Math.pow(1.01, dayOfYear).toFixed(2);
  
  // Update multiplier display with formula format
  document.querySelector('#multiplier .exponent').textContent = dayOfYear;
  document.querySelector('#multiplier .result').textContent = multiplier;
  
  document.getElementById('day-counter').textContent = `Day ${dayOfYear} of 365`;
  
  // Update dot position
  const startX = 20;
  const endX = 355;
  const startY = 175;
  const endY = 20;
  const graphWidth = endX - startX;
  const graphHeight = startY - endY;
  
  const dotX = startX + (dayOfYear / 365) * graphWidth;
  const dotY = startY - ((Math.pow(1.01, dayOfYear) - 1) / 36.78) * graphHeight;
  
  const dot = document.getElementById('current-dot');
  dot.setAttribute('cx', dotX);
  dot.setAttribute('cy', dotY);
}

function initCompoundScreen() {
  // Generate and set the curve points
  const curve = document.getElementById('exp-curve');
  curve.setAttribute('points', generateCurvePoints());
}

// ========== SCREEN NAVIGATION ==========
var screens = ['kanban', 'year', 'compound'];
var currentScreen = 1;

function showScreen(index) {
  if (index < 0 || index >= screens.length) return;

  var yearScreen = document.getElementById('year-progress-screen');
  var compoundScreen = document.getElementById('compound-screen');
  var kanbanScreen = document.getElementById('kanban-screen');
  var footer = document.getElementById('footer');
  var navLeft = document.getElementById('nav-left');
  var navRight = document.getElementById('nav-right');

  // Hide all screens
  yearScreen.classList.add('hidden');
  compoundScreen.classList.remove('active');
  kanbanScreen.classList.remove('active');

  // Show target screen
  currentScreen = index;
  if (screens[index] === 'year') {
    yearScreen.classList.remove('hidden');
    footer.style.display = '';
  } else if (screens[index] === 'compound') {
    compoundScreen.classList.add('active');
    footer.style.display = '';
  } else if (screens[index] === 'kanban') {
    kanbanScreen.classList.add('active');
    footer.style.display = '';
    // Re-measure textarea heights now that the screen is visible
    // (scrollHeight returns 0 when display:none)
    kanbanScreen.querySelectorAll('.kanban-card-text').forEach(function(ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  }

  // Update arrow states
  navLeft.classList.toggle('disabled', currentScreen === 0);
  navRight.classList.toggle('disabled', currentScreen === screens.length - 1);
}

function navigateLeft() {
  if (currentScreen > 0) showScreen(currentScreen - 1);
}

function navigateRight() {
  if (currentScreen < screens.length - 1) showScreen(currentScreen + 1);
}

// ========== KANBAN BOARD ==========
const CARD_COLORS = [
  { name: 'Terracotta', hex: '#D08B6A' },
  { name: 'Lavender', hex: '#9B9FD7' },
  { name: 'Sage', hex: '#7D8C6E' },
  { name: 'Golden', hex: '#C49A5A' },
  { name: 'Rose', hex: '#C45A5A' },
  { name: 'Sky', hex: '#5A9EC4' }
];

let kanbanData = {
  columns: [
    { id: 'col-1', title: 'Backlog', cards: [] },
    { id: 'col-2', title: 'To Do', cards: [] },
    { id: 'col-3', title: 'In Progress', cards: [] },
    { id: 'col-4', title: 'Done', cards: [] }
  ]
};
let draggedCard = null;
let draggedFromColumn = null;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function stripEmptyCards() {
  kanbanData.columns.forEach(function(col) {
    col.cards = col.cards.filter(function(c) { return c.text && c.text.trim(); });
  });
}

function loadKanbanData() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get('kanbanData', function(result) {
      if (result.kanbanData) {
        kanbanData = result.kanbanData;
      } else {
        var saved = localStorage.getItem('kanbanData');
        if (saved) {
          try { kanbanData = JSON.parse(saved); } catch (e) {}
        }
      }
      stripEmptyCards();
      saveKanbanData();
      renderKanbanBoard();
    });
  } else {
    var saved = localStorage.getItem('kanbanData');
    if (saved) {
      try { kanbanData = JSON.parse(saved); } catch (e) {}
    }
    stripEmptyCards();
    saveKanbanData();
    renderKanbanBoard();
  }
}

function saveKanbanData() {
  // Always save to localStorage as reliable backup
  try {
    localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
  } catch (e) {}
  // Also save to chrome.storage if available
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ kanbanData: kanbanData });
  }
}

function renderKanbanBoard() {
  var board = document.getElementById('kanban-board');
  board.innerHTML = '';

  kanbanData.columns.forEach(function(column) {
    var colEl = document.createElement('div');
    colEl.className = 'kanban-column';
    colEl.dataset.columnId = column.id;

    // Header
    var header = document.createElement('div');
    header.className = 'kanban-column-header';

    var titleInput = document.createElement('input');
    titleInput.className = 'kanban-column-title';
    titleInput.type = 'text';
    titleInput.value = column.title;
    titleInput.spellcheck = false;
    titleInput.addEventListener('change', function() {
      column.title = titleInput.value;
      saveKanbanData();
    });
    titleInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') titleInput.blur();
    });

    var count = document.createElement('span');
    count.className = 'kanban-column-count';
    count.textContent = column.cards.length;

    var actions = document.createElement('div');
    actions.className = 'kanban-column-actions';

    var deleteColBtn = document.createElement('button');
    deleteColBtn.className = 'kanban-col-delete-btn';
    deleteColBtn.textContent = '\u00d7';
    deleteColBtn.title = 'Delete column';
    deleteColBtn.addEventListener('click', function() {
      if (column.cards.length > 0) {
        if (!confirm('Delete "' + column.title + '" and its ' + column.cards.length + ' card(s)?')) return;
      }
      kanbanData.columns = kanbanData.columns.filter(function(c) { return c.id !== column.id; });
      saveKanbanData();
      renderKanbanBoard();
    });

    actions.appendChild(deleteColBtn);
    header.appendChild(titleInput);
    header.appendChild(count);
    header.appendChild(actions);

    // Cards container
    var cardsContainer = document.createElement('div');
    cardsContainer.className = 'kanban-cards';
    cardsContainer.dataset.columnId = column.id;

    // Drag and drop on cards container
    cardsContainer.addEventListener('dragover', function(e) {
      e.preventDefault();
      colEl.classList.add('drag-over');

      // Find insertion point
      var afterCard = getDragAfterCard(cardsContainer, e.clientY);
      var draggingEl = document.querySelector('.kanban-card.dragging');
      if (draggingEl) {
        if (afterCard) {
          cardsContainer.insertBefore(draggingEl, afterCard);
        } else {
          cardsContainer.appendChild(draggingEl);
        }
      }
    });

    cardsContainer.addEventListener('dragleave', function(e) {
      if (!colEl.contains(e.relatedTarget)) {
        colEl.classList.remove('drag-over');
      }
    });

    cardsContainer.addEventListener('drop', function(e) {
      e.preventDefault();
      colEl.classList.remove('drag-over');

      if (!draggedCard || !draggedFromColumn) return;

      // Find insertion index based on DOM position before modifying data
      var draggingEl = cardsContainer.querySelector('.kanban-card.dragging');
      var allCards = Array.from(cardsContainer.querySelectorAll('.kanban-card'));
      var insertIndex = allCards.indexOf(draggingEl);
      if (insertIndex === -1) insertIndex = allCards.length;

      // Remove card from source column
      var sourceCol = kanbanData.columns.find(function(c) { return c.id === draggedFromColumn; });
      var sourceIndex = -1;
      if (sourceCol) {
        sourceIndex = sourceCol.cards.findIndex(function(c) { return c.id === draggedCard.id; });
        sourceCol.cards = sourceCol.cards.filter(function(c) { return c.id !== draggedCard.id; });
      }

      // Adjust index for same-column moves
      var targetCol = kanbanData.columns.find(function(c) { return c.id === column.id; });
      if (targetCol) {
        if (sourceCol === targetCol && sourceIndex < insertIndex) {
          insertIndex--;
        }
        targetCol.cards.splice(insertIndex, 0, draggedCard);
      }

      saveKanbanData();
      renderKanbanBoard();
    });

    column.cards.forEach(function(card) {
      var cardEl = createCardElement(card, column.id);
      cardsContainer.appendChild(cardEl);
    });

    // Add card button
    var addCardBtn = document.createElement('button');
    addCardBtn.className = 'kanban-add-card-btn';
    addCardBtn.textContent = '+ Add card';
    addCardBtn.addEventListener('click', function() {
      var newCard = { id: generateId(), text: '' };
      column.cards.push(newCard);
      saveKanbanData();
      renderKanbanBoard();
      // Focus the new card's textarea
      var newCardEl = board.querySelector('[data-card-id="' + newCard.id + '"] .kanban-card-text');
      if (newCardEl) newCardEl.focus();
    });

    colEl.appendChild(header);
    colEl.appendChild(cardsContainer);
    colEl.appendChild(addCardBtn);
    board.appendChild(colEl);
  });
}

function createCardElement(card, columnId) {
  var cardEl = document.createElement('div');
  cardEl.className = 'kanban-card';
  cardEl.draggable = true;
  cardEl.dataset.cardId = card.id;

  // Apply saved color bar
  if (card.color) {
    cardEl.style.borderLeftColor = card.color;
  }

  var textarea = document.createElement('textarea');
  textarea.className = 'kanban-card-text';
  textarea.value = card.text;
  textarea.placeholder = 'Type something...';
  textarea.rows = 1;
  textarea.spellcheck = false;

  // Auto-resize textarea
  function autoResize() {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  textarea.addEventListener('input', function() {
    autoResize();
    card.text = textarea.value;
    saveKanbanData();
  });

  // Resize on render
  setTimeout(autoResize, 0);

  textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textarea.blur();
    }
  });

  // Prevent drag when editing text
  textarea.addEventListener('mousedown', function() {
    cardEl.draggable = false;
  });
  textarea.addEventListener('blur', function() {
    cardEl.draggable = true;
    // Auto-delete empty cards
    if (!card.text.trim()) {
      var col = kanbanData.columns.find(function(c) { return c.id === columnId; });
      if (col) {
        col.cards = col.cards.filter(function(c) { return c.id !== card.id; });
        saveKanbanData();
        renderKanbanBoard();
      }
    }
  });

  var deleteBtn = document.createElement('button');
  deleteBtn.className = 'kanban-card-delete';
  deleteBtn.textContent = '\u00d7';
  deleteBtn.addEventListener('click', function() {
    var col = kanbanData.columns.find(function(c) { return c.id === columnId; });
    if (col) {
      col.cards = col.cards.filter(function(c) { return c.id !== card.id; });
      saveKanbanData();
      renderKanbanBoard();
    }
  });

  // Drag events
  cardEl.addEventListener('dragstart', function(e) {
    draggedCard = card;
    draggedFromColumn = columnId;
    cardEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  cardEl.addEventListener('dragend', function() {
    cardEl.classList.remove('dragging');
    draggedCard = null;
    draggedFromColumn = null;
    document.querySelectorAll('.kanban-column.drag-over').forEach(function(el) {
      el.classList.remove('drag-over');
    });
  });

  // Color picker dots
  var colorsDiv = document.createElement('div');
  colorsDiv.className = 'kanban-card-colors';

  CARD_COLORS.forEach(function(c) {
    var dot = document.createElement('button');
    dot.className = 'kanban-color-dot';
    if (card.color === c.hex) dot.classList.add('active');
    dot.style.background = c.hex;
    dot.title = c.name;
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      card.color = c.hex;
      cardEl.style.borderLeftColor = c.hex;
      // Update active states
      colorsDiv.querySelectorAll('.kanban-color-dot').forEach(function(d) { d.classList.remove('active'); });
      colorsDiv.querySelector('.kanban-color-clear').classList.remove('active');
      dot.classList.add('active');
      saveKanbanData();
    });
    colorsDiv.appendChild(dot);
  });

  var clearBtn = document.createElement('button');
  clearBtn.className = 'kanban-color-clear';
  if (!card.color) clearBtn.classList.add('active');
  clearBtn.title = 'Clear color';
  clearBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    card.color = null;
    cardEl.style.borderLeftColor = 'transparent';
    colorsDiv.querySelectorAll('.kanban-color-dot').forEach(function(d) { d.classList.remove('active'); });
    clearBtn.classList.add('active');
    saveKanbanData();
  });
  colorsDiv.appendChild(clearBtn);

  cardEl.appendChild(textarea);
  cardEl.appendChild(deleteBtn);
  cardEl.appendChild(colorsDiv);
  return cardEl;
}

function getDragAfterCard(container, y) {
  var cards = Array.from(container.querySelectorAll('.kanban-card:not(.dragging)'));
  var closest = null;
  var closestOffset = Number.NEGATIVE_INFINITY;

  cards.forEach(function(card) {
    var box = card.getBoundingClientRect();
    var offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = card;
    }
  });

  return closest;
}

function addColumn() {
  var newCol = {
    id: 'col-' + generateId(),
    title: 'New Column',
    cards: []
  };
  kanbanData.columns.push(newCol);
  saveKanbanData();
  renderKanbanBoard();

  // Focus the new column's title input
  var board = document.getElementById('kanban-board');
  var colEl = board.querySelector('[data-column-id="' + newCol.id + '"] .kanban-column-title');
  if (colEl) {
    colEl.focus();
    colEl.select();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  createGrid();
  initFlipClock();
  initCompoundScreen();

  // Clean up stale drag state on tab blur
  window.addEventListener('blur', function() {
    if (draggedCard) {
      draggedCard = null;
      draggedFromColumn = null;
      document.querySelectorAll('.kanban-card.dragging').forEach(function(el) {
        el.classList.remove('dragging');
      });
      document.querySelectorAll('.kanban-column.drag-over').forEach(function(el) {
        el.classList.remove('drag-over');
      });
    }
  });
  
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

  // Initial compound screen update
  updateCompoundScreen(currentDayOfYear);
  
  // Navigation events
  document.getElementById('nav-left').addEventListener('click', navigateLeft);
  document.getElementById('nav-right').addEventListener('click', navigateRight);
  document.getElementById('add-column-btn').addEventListener('click', addColumn);
  loadKanbanData();

  // Start interval
  setInterval(update, 1000);
});
