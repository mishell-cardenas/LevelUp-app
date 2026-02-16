// Sample game data
const sampleGames = [
  {
    id: '1',
    title: 'Ori and the Blind Forest',
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/261570/library_600x900.jpg',
    rating: 4.5,
    status: 'Completed',
    completion: 95,
    priority: 'Low',
    platform: 'Steam'
  },
  {
    id: '2',
    title: 'Elden Ring',
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg',
    rating: 5.0,
    status: 'Playing',
    completion: 45,
    priority: 'High',
    platform: 'Steam'
  },
  {
    id: '3',
    title: "Baldur's Gate 3",
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg',
    rating: 4.8,
    status: 'On Hold',
    completion: 30,
    priority: 'Medium',
    platform: 'Steam'
  },
  {
    id: '4',
    title: 'Hollow Knight',
    cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg',
    rating: 4.9,
    status: 'Wishlist',
    completion: 0,
    priority: 'Low',
    platform: 'Steam'
  }
];

// Current selected game for modal
let currentGame = null;

// Open game detail modal
function openGameModal(cardElement) {
  const gameId = cardElement.dataset.id;
  currentGame = sampleGames.find(g => g.id === gameId);
  
  if (!currentGame) return;

  // Populate modal
  document.getElementById('modalCover').src = currentGame.cover;
  document.getElementById('modalTitle').textContent = currentGame.title;
  document.getElementById('modalStatus').textContent = currentGame.status;
  document.getElementById('modalStatus').className = 'detail-value status-badge ' + currentGame.status.toLowerCase().replace(' ', '-');
  document.getElementById('modalCompletion').textContent = currentGame.completion + '%';
  document.getElementById('modalPriority').textContent = currentGame.priority;
  document.getElementById('modalPlatform').textContent = currentGame.platform;

  // Show modal
  document.getElementById('gameModal').classList.add('active');
}

// Close game detail modal
function closeGameModal() {
  document.getElementById('gameModal').classList.remove('active');
  currentGame = null;
}

// Open journal for current game
function openJournal() {
  if (currentGame) {
    window.location.href = `journal.html?id=${currentGame.id}`;
  }
}

// Open add game modal
const addGameBtn = document.getElementById('addGameBtn');
if (addGameBtn) {
  addGameBtn.addEventListener('click', () => {
    const addGameModalEl = document.getElementById('addGameModal');
    if (addGameModalEl) addGameModalEl.classList.add('active');
  });
}

// Close add game modal
function closeAddGameModal() {
  document.getElementById('addGameModal').classList.remove('active');
  document.getElementById('addGameForm').reset();
}

// Handle add game form submission
const addGameForm = document.getElementById('addGameForm');
if (addGameForm) {
  addGameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Game added! (Not connected to backend yet)');
    closeAddGameModal();
  });
}

// Close modals when clicking overlay
const gameModalEl = document.getElementById('gameModal');
if (gameModalEl) {
  gameModalEl.addEventListener('click', (e) => {
    if (e.target === gameModalEl) {
      closeGameModal();
    }
  });
}

const addGameModalEl = document.getElementById('addGameModal');
if (addGameModalEl) {
  addGameModalEl.addEventListener('click', (e) => {
    if (e.target === addGameModalEl) {
      closeAddGameModal();
    }
  });
}

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeGameModal();
    closeAddGameModal();
  }
});