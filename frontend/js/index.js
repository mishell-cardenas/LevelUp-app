const API_BASE = "";

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
const reviewsPill = document.getElementById("reviewsPill");

if (reviewsPill) {
  reviewsPill.addEventListener("click", () => {
    const id = currentGame ? currentGame.steamId : null;
    if (!id) return;
    window.location.href = `/html/reviews.html?steamId=${encodeURIComponent(id)}`;
  });
}

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
    await loadModalRating(appId);
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

function formatRatingsAvg(avg) {
  if (avg === null || avg === undefined) return "—";
  return (Math.round(avg * 10) / 10).toFixed(1);
}

async function loadRatingsForGames(games) {
  try {
    const steamIds = [];
    for (const game of games) {
      if (game.steamId) {
        steamIds.push(game.steamId);
      }
    }

    if (steamIds.length === 0) return;

    const res = await fetch(
      `${API_BASE}/reviews/summaries?steamIds=${steamIds.join(",")}`,
    );
    if (!res.ok) {
      throw new Error("Failed to load review summaries");
    }

    const summaries = await res.json();

    for (const id of steamIds) {
      const elements = document.getElementById(`rating-${id}`);
      if (!elements) continue;

      const summary = summaries[String(id)];
      const avg = summary ? summary.averageRating : null;
      elements.textContent = `${formatRatingsAvg(avg)} ⭐`;
    }
  } catch (err) {
    console.error(err);
  }
}

async function getOneReviewForModal(steamId) {
  try {
    const res = await fetch(
      `${API_BASE}/reviews/game/${steamId}?limit=1&page=1`,
    );
    if (!res.ok) return false;

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) return false;

    const r = items[0];
    const text = String(r.comment || "").trim();
    if (text.length === 0) return false;

    const short = text.length > 140 ? `${text.slice(0, 140)}…` : text;
    document.getElementById("modalQuote").textContent = `“${short}”`;
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function loadModalRating(steamId) {
  try {
    const res = await fetch(`${API_BASE}/reviews/game/${steamId}/summary`);
    if (!res.ok) return;

    const data = await res.json();

    document.getElementById("modalRating").textContent = formatRatingsAvg(
      data.averageRating,
    );

    document.getElementById("modalQuote").textContent = "“No reviews yet.”";

    if (data.reviewCount === 0) {
      document.getElementById("modalQuote").textContent = "“No reviews yet.”";
    } else {
      await getOneReviewForModal(steamId);
    }
  } catch (err) {
    console.error(err);
  }
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

      <div class="game-rating" id="rating-${game.steamId}">- ⭐</div>
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

    const games = data.games || [];
    renderGames(games);
    loadRatingsForGames(games);
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
