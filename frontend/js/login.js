const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  if (!username) return;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Login failed');
      return;
    }

    window.location.href = '../index.html';
  } catch (error) {
    console.error('Login error:', error);
    alert('Could not connect to server');
  }
});
