const API_BASE = "";

let reviewFormMode = "create"; 
let editingReviewId = null;

function getSteamIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const steamId = Number(params.get("steamId"));
  return Number.isFinite(steamId) ? steamId : null;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setModalTitle(text) {
  const el = document.getElementById("reviewModalTitle");
  if (el) el.textContent = text;
}

function openCreateReviewModal() {
  reviewFormMode = "create";
  editingReviewId = null;

  setModalTitle("Add a New Review");

  const usernameEl = document.getElementById("reviewUsername");
  const commentEl = document.getElementById("reviewComment");
  const ratingEl = document.getElementById("reviewRating");

  if (usernameEl) {
    usernameEl.disabled = false;
    usernameEl.value = "";
  }
  if (commentEl) commentEl.value = "";
  if (ratingEl) ratingEl.value = "5";

  const modal = document.getElementById("addReviewModal");
  if (modal) modal.classList.add("active");
}

function openEditReviewModal(review) {
  reviewFormMode = "edit";
  editingReviewId = String(review._id || "");

  setModalTitle("Edit Review");

  const usernameEl = document.getElementById("reviewUsername");
  const commentEl = document.getElementById("reviewComment");
  const ratingEl = document.getElementById("reviewRating");

  if (usernameEl) {
    usernameEl.value = review.username || "";
    usernameEl.disabled = true; 
  }
  if (commentEl) commentEl.value = review.comment || "";
  if (ratingEl) ratingEl.value = String(review.rating || "5");

  const modal = document.getElementById("addReviewModal");
  if (modal) modal.classList.add("active");
}

function closeAddReviewModal() {
  const modal = document.getElementById("addReviewModal");
  if (modal) modal.classList.remove("active");

  const form = document.getElementById("addReviewForm");
  if (form) form.reset();

  const usernameEl = document.getElementById("reviewUsername");
  if (usernameEl) usernameEl.disabled = false;

  reviewFormMode = "create";
  editingReviewId = null;

  setModalTitle("Add a New Review");
}

function renderReviewCard(review) {
  const id = String(review._id || "");
  const username = escapeHtml(review.username || "user_name");

  let rating = 0;
  if (Number.isFinite(Number(review.rating))) {
    rating = Number(review.rating);
  }

  const comment = escapeHtml(review.comment || "");

  const card = document.createElement("div");
  card.className = "review-card";
  card.dataset.reviewId = id;

  card.innerHTML = `
    <div class="review-header">
      <div class="review-username">${username}</div>
      <div class="review-rating">${rating} ⭐</div>
    </div>

    <div class="review-body">“${comment}”</div>

    <div class="review-actions">
      <button class="review-btn review-edit" type="button">Edit</button>
      <button class="review-btn review-delete" type="button">Delete</button>
    </div>
  `;

  const editBtn = card.querySelector(".review-edit");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      openEditReviewModal(review);
    });
  }

  const deleteBtn = card.querySelector(".review-delete");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      await handleDeleteReview(review);
    });
  }

  return card;
}

async function loadGameTitle(steamId) {
  const res = await fetch(
    `${API_BASE}/games/${encodeURIComponent(steamId)}/details`,
  );
  if (!res.ok) return;

  const game = await res.json().catch(() => ({}));
  const name = game.name ? game.name : "Game";

  const titleEl = document.getElementById("reviewsTitle");
  if (titleEl) titleEl.textContent = `${name} Reviews`;
}

async function loadReviews(steamId) {
  const listEl = document.getElementById("reviewsList");
  const noMsg = document.getElementById("noReviewsMsg");

  if (listEl) listEl.innerHTML = "";

  const res = await fetch(
    `${API_BASE}/reviews/game/${steamId}?page=1&limit=50`,
  );
  if (!res.ok) {
    if (noMsg) {
      noMsg.classList.remove("d-none");
      noMsg.textContent = "Failed to load reviews.";
    }
    return;
  }

  const data = await res.json().catch(() => ({}));
  const items = data.items || [];

  if (items.length === 0) {
    if (noMsg) noMsg.classList.remove("d-none");
    return;
  }

  if (noMsg) noMsg.classList.add("d-none");

  for (const review of items) {
    if (listEl) listEl.appendChild(renderReviewCard(review));
  }
}

async function handleDeleteReview(review) {
  const steamId = getSteamIdFromUrl();
  if (!steamId) {
    alert("Missing steamId in URL.");
    return;
  }

  const id = String(review._id || "");
  if (id.length === 0) {
    alert("Missing review id.");
    return;
  }

  const ok = window.confirm("Delete this review? This cannot be undone.");
  if (!ok) return;

  try {
    const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || "Failed to delete review.");
      return;
    }

    await loadReviews(steamId);
  } catch (err) {
    console.error(err);
    alert("Network error deleting review.");
  }
}

async function init() {
  const steamId = getSteamIdFromUrl();

  const titleEl = document.getElementById("reviewsTitle");
  const noMsg = document.getElementById("noReviewsMsg");

  if (!steamId) {
    if (titleEl) titleEl.textContent = "Reviews";
    if (noMsg) {
      noMsg.classList.remove("d-none");
      noMsg.textContent = "Missing steamId in URL.";
    }
    return;
  }

  await loadGameTitle(steamId);
  await loadReviews(steamId);
}

const addReviewBtn = document.getElementById("addReviewBtn");
if (addReviewBtn) {
  addReviewBtn.addEventListener("click", openCreateReviewModal);
}

const addReviewForm = document.getElementById("addReviewForm");
if (addReviewForm) {
  addReviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const steamId = getSteamIdFromUrl();
    if (!steamId) {
      alert("Missing steamId in URL.");
      return;
    }

    const usernameEl = document.getElementById("reviewUsername");
    const commentEl = document.getElementById("reviewComment");
    const ratingEl = document.getElementById("reviewRating");

    const username = (usernameEl?.value || "").trim();
    const comment = (commentEl?.value || "").trim();
    const rating = Number(ratingEl?.value);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      alert("Rating must be 1 to 5.");
      return;
    }

    if (comment.length === 0) {
      alert("Please write a review.");
      return;
    }

    try {
      let res;

      if (reviewFormMode === "create") {
        if (username.length === 0) {
          alert("Username is required.");
          return;
        }

        res = await fetch(`${API_BASE}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ steamId, username, rating, comment }),
        });
      } else {
        if (!editingReviewId || editingReviewId.length === 0) {
          alert("Missing review id for edit.");
          return;
        }

        res = await fetch(
          `${API_BASE}/reviews/${encodeURIComponent(editingReviewId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, comment }),
          },
        );
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Request failed.");
        return;
      }

      closeAddReviewModal();
      await loadReviews(steamId);
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  });
}

const addReviewModalEl = document.getElementById("addReviewModal");
if (addReviewModalEl) {
  addReviewModalEl.addEventListener("click", (e) => {
    if (e.target === addReviewModalEl) closeAddReviewModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAddReviewModal();
});

window.closeAddReviewModal = closeAddReviewModal;

init();
