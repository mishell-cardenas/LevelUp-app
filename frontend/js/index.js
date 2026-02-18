const API_BASE = "http://localhost:3000";

const grid = document.getElementById("gamesGrid");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageLabel = document.getElementById("pageLabel");
const searchInput = document.getElementById("searchInput");

let page = 1;
const limit = 20;
let totalPages = 1;
let currentGame = null;
const gameModalEl = document.getElementById("gameModal");

async function openGameModal(game) {
  const appId = game.steamId; 
  if (!appId) return;

  document.getElementById("modalTitle").textContent = "Loading...";
  document.getElementById("modalCover").src = game.headerImage || "";

  try {
    const res = await fetch(
      `${API_BASE}/games/${encodeURIComponent(appId)}/details`,
    );
    if (!res.ok) throw new Error("Failed to load game details");

    const details = await res.json();
    currentGame = details;

    document.getElementById("modalCover").src = details.headerImage || "";
    document.getElementById("modalTitle").textContent =
      details.name || "Untitled";

    const genresText =
      Array.isArray(details.genres) && details.genres.length > 0
        ? details.genres.join(", ")
        : "—";
    document.getElementById("modalGenre").textContent = genresText;

    document.getElementById("modalRating").textContent = "—";
    document.getElementById("modalQuote").textContent = "“No reviews yet.”";

    document.getElementById("modalDescription").textContent =
      details.description || "No description available.";

    gameModalEl.classList.add("active");
    document.body.classList.add("modal-open");
  } catch (err) {
    console.error(err);

    document.getElementById("modalTitle").textContent = game.name || "Untitled";
    gameModalEl.classList.add("active");
    document.body.classList.add("modal-open");
  }
}

window.openJournal = function openJournal() {
  if (!currentGame) return;
  const appId = currentGame.steamId;
  window.location.href = `/html/journal.html?steamId=${encodeURIComponent(appId)}`;
};

function closeGameModal() {
  gameModalEl.classList.remove("active");
  document.body.classList.remove("modal-open");
  currentGame = null;
}

window.closeGameModal = closeGameModal;

gameModalEl.addEventListener("click", (e) => {
  if (e.target === gameModalEl) closeGameModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeGameModal();
});

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderGames(games) {
  grid.innerHTML = "";

  for (const game of games) {
    const title = escapeHtml(game.name || "Untitled");
    const img = game.headerImage || "";

    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
      <button class="game-click game-image-btn" type="button" aria-label="Open ${title}">
        <img src="${img}" alt="${title}" loading="lazy" />
      </button>

      <button class="game-click game-title-btn" type="button">
        ${title}
      </button>

      <div class="game-rating">4.5⭐</div>
    `;

    const open = () => openGameModal(game);
    card.querySelector(".game-image-btn").addEventListener("click", open);
    card.querySelector(".game-title-btn").addEventListener("click", open);

    grid.appendChild(card);
  }
}

async function loadGames() {
  try {
    const search = searchInput.value.trim();

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search.length > 0) {
      params.set("search", search);
    }

    const res = await fetch(`${API_BASE}/games?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Failed to load games");
    }

    const data = await res.json();

    totalPages = data.totalPages || 1;
    pageLabel.textContent = `Page ${data.page} of ${totalPages}`;

    prevButton.disabled = page <= 1;
    nextButton.disabled = page >= totalPages;

    renderGames(data.games || []);
  } catch (err) {
    console.error(err);
  }
}

prevButton.addEventListener("click", () => {
  if (page > 1) {
    page -= 1;
    loadGames();
  }
});

nextButton.addEventListener("click", () => {
  if (page < totalPages) {
    page += 1;
    loadGames();
  }
});

searchInput.addEventListener("input", () => {
  page = 1;
  loadGames();
});

loadGames();
