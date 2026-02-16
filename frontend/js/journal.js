// Toggle accordion entry
function toggleEntry(button) {
  const accordion = button.parentElement;
  accordion.classList.toggle('open');
}

// Handle form submission
document.getElementById('sessionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Entry added! (Not connected to backend yet)');
  e.target.reset();
});

// Open first entry by default
document.addEventListener('DOMContentLoaded', () => {
  const firstEntry = document.querySelector('.entry-accordion');
  if (firstEntry) {
    firstEntry.classList.add('open');
  }
});