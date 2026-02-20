// Library state
let libraryGames = [];
let currentGame = null;

// ============================================
// AUTH & INIT
// ============================================

async function init() {
  const user = await checkAuth();
  if (!user) return;

  document.getElementById("userGreeting").textContent =
    `Welcome, ${user.username}`;
  await loadLibrary();
  setupEventListeners();
}

async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      window.location.href = "/html/login.html";
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    window.location.href = "/html/login.html";
    return null;
  }
}

// ============================================
// LOAD LIBRARY
// ============================================

async function loadLibrary() {
  const status = document.getElementById("statusFilter").value;
  const sort = document.getElementById("sortBy").value;

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (sort) params.set("sort", sort);

  try {
    const res = await fetch(`/api/library?${params}`);
    if (!res.ok) throw new Error("Failed to fetch library");

    libraryGames = await res.json();
    renderLibrary();
  } catch (error) {
    console.error("Load library error:", error);
  }
}

function renderLibrary() {
  const grid = document.getElementById("libraryGrid");

  if (libraryGames.length === 0) {
    grid.innerHTML =
      '<p style="color: rgba(255,255,255,0.5); text-align:center; grid-column:1/-1;">Your library is empty. Click + to add a game!</p>';
    return;
  }

  grid.innerHTML = libraryGames
    .map(
      (game) => `
    <div class="game-card" data-id="${game._id}" onclick="openGameModal(this)">
      <div class="game-cover">
        <img src="${game.headerImage || ""}" alt="${game.gameName}">
      </div>
      <div class="game-info">
        <h3 class="game-title">${game.gameName}</h3>
        <div class="game-rating">
          <span class="rating-value">${game.progressPercent || 0}%</span>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

// ============================================
// GAME DETAIL MODAL
// ============================================

function openGameModal(cardElement) {
  const gameId = cardElement.dataset.id;
  currentGame = libraryGames.find((g) => g._id === gameId);

  if (!currentGame) return;

  document.getElementById("modalCover").src = currentGame.headerImage || "";
  document.getElementById("modalTitle").textContent = currentGame.gameName;
  document.getElementById("modalStatus").value =
    currentGame.status || "Wishlist";
  document.getElementById("modalCompletion").value =
    currentGame.progressPercent || 0;
  document.getElementById("modalPriority").value = currentGame.priority || "";
  document.getElementById("modalPlatform").value =
    currentGame.platform || "Steam";

  document.getElementById("gameModal").classList.add("active");
}
window.openGameModal = openGameModal;

function closeGameModal() {
  document.getElementById("gameModal").classList.remove("active");
  currentGame = null;
}

function openJournal() {
  if (currentGame) {
    window.location.href = `/html/journal.html?id=${currentGame._id}`;
  }
}
window.openJournal = openJournal;

async function saveGame() {
  if (!currentGame) return;

  const body = {
    status: document.getElementById("modalStatus").value,
    progressPercent: document.getElementById("modalCompletion").value,
    priority: document.getElementById("modalPriority").value,
    platform: document.getElementById("modalPlatform").value,
  };

  try {
    const res = await fetch(`/api/library/${currentGame._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to update game");
      return;
    }

    closeGameModal();
    await loadLibrary();
  } catch (error) {
    console.error("Update game error:", error);
    alert("Could not update game");
  }
}
window.saveGame = saveGame;

async function deleteGame() {
  if (!currentGame) return;
  if (!confirm(`Delete "${currentGame.gameName}" from your library?`)) return;

  try {
    const res = await fetch(`/api/library/${currentGame._id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete game");
      return;
    }

    closeGameModal();
    await loadLibrary();
  } catch (error) {
    console.error("Delete game error:", error);
    alert("Could not delete game");
  }
}
window.deleteGame = deleteGame;

// ============================================
// ADD GAME MODAL
// ============================================

function openAddGameModal() {
  document.getElementById("addGameModal").classList.add("active");
}

function closeAddGameModal() {
  document.getElementById("addGameModal").classList.remove("active");
  document.getElementById("addGameForm").reset();
  document.getElementById("gameSteamId").value = "";
  document.getElementById("gameHeaderImage").value = "";
  document.getElementById("gameSearchResults").style.display = "none";
}

// Game search autocomplete
let searchTimeout = null;

function setupGameSearch() {
  const input = document.getElementById("gameName");
  const resultsDiv = document.getElementById("gameSearchResults");

  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();

    if (q.length < 2) {
      resultsDiv.style.display = "none";
      return;
    }

    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`);
        const games = await res.json();

        if (games.length === 0) {
          resultsDiv.innerHTML =
            '<div style="padding:8px 12px; color:rgba(255,255,255,0.5);">No games found</div>';
          resultsDiv.style.display = "block";
          return;
        }

        resultsDiv.innerHTML = games
          .map(
            (g) => `
          <div class="search-result-item" style="padding:8px 12px; cursor:pointer; display:flex; align-items:center; gap:8px; border-bottom:1px solid rgba(255,255,255,0.05);"
               onmouseover="this.style.background='rgba(255,255,255,0.1)'"
               onmouseout="this.style.background='transparent'"
               data-steamid="${g.steamId}" data-name="${g.name}" data-image="${g.headerImage || ""}">
            ${g.headerImage ? `<img src="${g.headerImage}" style="width:40px; height:20px; object-fit:cover; border-radius:3px;">` : ""}
            <span style="color:#fff; font-size:0.9rem;">${g.name}</span>
          </div>
        `,
          )
          .join("");

        resultsDiv.querySelectorAll(".search-result-item").forEach((item) => {
          item.addEventListener("click", () => {
            input.value = item.dataset.name;
            document.getElementById("gameSteamId").value = item.dataset.steamid;
            document.getElementById("gameHeaderImage").value =
              item.dataset.image;
            resultsDiv.style.display = "none";
          });
        });

        resultsDiv.style.display = "block";
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 300);
  });

  // Hide results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#gameSearchResults") && e.target !== input) {
      resultsDiv.style.display = "none";
    }
  });
}

// Handle add game form submission
async function handleAddGame(e) {
  e.preventDefault();

  const gameName = document.getElementById("gameName").value.trim();
  const steamId = document.getElementById("gameSteamId").value;
  const headerImage = document.getElementById("gameHeaderImage").value;
  const status = document.getElementById("gameStatus").value;
  const platform = document.getElementById("gamePlatform").value;
  const priority = document.getElementById("gamePriority").value;
  const progressPercent = document.getElementById("gameProgress").value;

  if (!gameName) return;

  try {
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steamId,
        gameName,
        headerImage,
        status,
        platform,
        priority,
        progressPercent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add game");
      return;
    }

    closeAddGameModal();
    await loadLibrary();
  } catch (error) {
    console.error("Add game error:", error);
    alert("Could not add game");
  }
}

// ============================================
// LOGOUT
// ============================================

async function handleLogout(e) {
  e.preventDefault();
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // proceed to redirect even if logout request fails
  }
  window.location.href = "/html/login.html";
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Filters
  document
    .getElementById("statusFilter")
    .addEventListener("change", loadLibrary);
  document.getElementById("sortBy").addEventListener("change", loadLibrary);

  // Add game
  const addGameBtn = document.getElementById("addGameBtn");
  if (addGameBtn) addGameBtn.addEventListener("click", openAddGameModal);

  const addGameForm = document.getElementById("addGameForm");
  if (addGameForm) addGameForm.addEventListener("submit", handleAddGame);

  // Game search autocomplete
  setupGameSearch();

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // Close modals
  const gameModalEl = document.getElementById("gameModal");
  if (gameModalEl) {
    gameModalEl.addEventListener("click", (e) => {
      if (e.target === gameModalEl) closeGameModal();
    });
  }

  const addGameModalEl = document.getElementById("addGameModal");
  if (addGameModalEl) {
    addGameModalEl.addEventListener("click", (e) => {
      if (e.target === addGameModalEl) closeAddGameModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeGameModal();
      closeAddGameModal();
    }
  });
}

// Start
init();
