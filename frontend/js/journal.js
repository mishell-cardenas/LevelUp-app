// Journal state
let libraryId = null;
let journalEntries = [];
let editingEntryId = null;

// ============================================
// AUTH & INIT
// ============================================

async function init() {
  libraryId = new URLSearchParams(window.location.search).get("id");
  if (!libraryId) {
    window.location.href = "/html/library.html";
    return;
  }

  const user = await checkAuth();
  if (!user) return;

  document.getElementById("userGreeting").textContent =
    `Welcome, ${user.username}`;
  await loadJournal();
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
// LOAD JOURNAL
// ============================================

async function loadJournal() {
  try {
    const res = await fetch(`/api/journal/game/${libraryId}`);
    if (!res.ok) throw new Error("Failed to fetch journal");

    const data = await res.json();
    journalEntries = data.entries;

    // Set game name in title
    if (data.game) {
      document.getElementById("journalGameName").textContent =
        `${data.game.gameName} - Journal`;
    }

    // Set total hours
    document.getElementById("totalHours").textContent = data.totalHours || 0;

    renderEntries();
  } catch (error) {
    console.error("Load journal error:", error);
  }
}

function renderEntries() {
  const list = document.getElementById("entriesList");

  if (journalEntries.length === 0) {
    list.innerHTML =
      '<p style="color: rgba(255,255,255,0.5); text-align:center;">No entries yet. Add your first session!</p>';
    return;
  }

  list.innerHTML = journalEntries
    .map((entry, index) => {
      const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const ratingStars = entry.sessionRating
        ? Array(entry.sessionRating).fill("&#11088;").join("")
        : "No rating";

      return `
      <div class="entry-accordion${index === 0 ? " open" : ""}">
        <button class="entry-header" onclick="toggleEntry(this)">
          <span class="entry-date">${date}</span>
          <span class="entry-toggle">&#9660;</span>
        </button>
        <div class="entry-content">
          ${entry.whereILeftOff ? `<div class="entry-field"><span class="field-label">Where I left off:</span><p>${escapeHtml(entry.whereILeftOff)}</p></div>` : ""}
          ${entry.currentObjectives ? `<div class="entry-field"><span class="field-label">Objectives:</span><p>${escapeHtml(entry.currentObjectives)}</p></div>` : ""}
          ${entry.importantDetails ? `<div class="entry-field"><span class="field-label">Important details:</span><p>${escapeHtml(entry.importantDetails)}</p></div>` : ""}
          ${entry.decisionsMade ? `<div class="entry-field"><span class="field-label">Decisions:</span><p>${escapeHtml(entry.decisionsMade)}</p></div>` : ""}
          <div class="entry-meta">
            <span class="entry-rating">${ratingStars}</span>
            <span class="entry-hours">${entry.hoursPlayed || 0} hours</span>
          </div>
          <div class="entry-actions">
            <button class="btn-small btn-secondary" onclick="startEdit('${entry._id}')">Edit</button>
            <button class="btn-small btn-danger" onclick="deleteEntry('${entry._id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Toggle accordion entry
function toggleEntry(button) {
  const accordion = button.parentElement;
  accordion.classList.toggle("open");
}
window.toggleEntry = toggleEntry;

// ============================================
// ADD / EDIT ENTRY
// ============================================

async function handleSubmit(e) {
  e.preventDefault();

  const body = {
    libraryId,
    whereILeftOff: document.getElementById("whereLeftOff").value,
    currentObjectives: document.getElementById("currentObjectives").value,
    importantDetails: document.getElementById("importantDetails").value,
    decisionsMade: document.getElementById("decisionsMade").value,
    sessionRating: document.getElementById("sessionRating").value,
    hoursPlayed: document.getElementById("hoursPlayed").value,
  };

  try {
    let res;
    if (editingEntryId) {
      res = await fetch(`/api/journal/${editingEntryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to save entry");
      return;
    }

    // Reset form and editing state
    editingEntryId = null;
    document.getElementById("sessionForm").reset();
    document.getElementById("hoursPlayed").value = "1";

    // Reset submit button text
    const submitBtn = document.querySelector(
      '#sessionForm button[type="submit"]',
    );
    submitBtn.textContent = "Add entry";

    await loadJournal();
  } catch (error) {
    console.error("Submit entry error:", error);
    alert("Could not save entry");
  }
}

function startEdit(entryId) {
  const entry = journalEntries.find((e) => e._id === entryId);
  if (!entry) return;

  editingEntryId = entryId;

  document.getElementById("whereLeftOff").value = entry.whereILeftOff || "";
  document.getElementById("currentObjectives").value =
    entry.currentObjectives || "";
  document.getElementById("importantDetails").value =
    entry.importantDetails || "";
  document.getElementById("decisionsMade").value = entry.decisionsMade || "";
  document.getElementById("sessionRating").value = entry.sessionRating || "";
  document.getElementById("hoursPlayed").value = entry.hoursPlayed || 1;

  // Change submit button text
  const submitBtn = document.querySelector(
    '#sessionForm button[type="submit"]',
  );
  submitBtn.textContent = "Update entry";

  // Scroll to form
  document.getElementById("sessionForm").scrollIntoView({ behavior: "smooth" });
}
window.startEdit = startEdit;

// ============================================
// DELETE ENTRY
// ============================================

async function deleteEntry(entryId) {
  if (!confirm("Delete this journal entry?")) return;

  try {
    const res = await fetch(`/api/journal/${entryId}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete entry");
      return;
    }

    await loadJournal();
  } catch (error) {
    console.error("Delete entry error:", error);
    alert("Could not delete entry");
  }
}
window.deleteEntry = deleteEntry;

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
  document
    .getElementById("sessionForm")
    .addEventListener("submit", handleSubmit);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
}

// Start
init();
