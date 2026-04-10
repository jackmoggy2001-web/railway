// JSONBin config
const JSONBIN_ID = '69d91b68856a6821891cd402';
const JSONBIN_KEY = '$2a$10$CM479TANRw1x9/3CM3yf9uPeKeI0XJG0a3owqmRqa6IxXP4RQK5si';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`;

document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initEvents();
  initReservationForm();
});

// Scroll Animations using Intersection Observer
function initAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

function initEvents() {
  const container = document.getElementById('eventsContainer');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center; color:var(--steam-grey); font-family:var(--font-body);">Loading timetable...</p>';

  const cacheBuster = `?t=${Date.now()}`;
  fetch(JSONBIN_URL + cacheBuster, {
    headers: { 'X-Master-Key': JSONBIN_KEY }
  })
  .then(res => res.json())
  .then(data => {
    const events = data.record.events || [];
    container.innerHTML = '';

    if (events.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; color:var(--steam-grey); font-family:var(--font-body); font-size:1.1rem; padding:2rem; width:100%;">
          <p style="font-size:2rem; margin-bottom:1rem;">🚂</p>
          <p>No events on the timetable yet.</p>
          <p style="font-size:0.9rem; margin-top:0.5rem;">Check back soon for upcoming departures!</p>
        </div>`;
      return;
    }

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        ${event.image ? `<img src="${event.image}" alt="${event.title}" class="event-image">` : ''}
        <div class="event-card-content">
          <div class="event-date">${event.date}</div>
          <div class="event-title">${event.title}</div>
          <div class="event-desc">${event.description}</div>
        </div>
      `;
      container.appendChild(card);
    });
  })
  .catch(() => {
    container.innerHTML = '<p style="text-align:center; color:var(--steam-grey); font-family:var(--font-body);">Could not load events. Please check back later.</p>';
  });
}

// Handle Reservation Form Submit
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop the browser from navigating to a generic Netlify success page
    
    const btn = form.querySelector('.btn');
    const originalText = btn.innerText;
    btn.innerText = 'Telegraphing via Station Master...';
    btn.disabled = true;

    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData);
    const jsonPayload = JSON.stringify(formObject);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: jsonPayload
    })
    .then(async (response) => {
      let jsonResponse = await response.json();
      if (response.status == 200) {
        showToast('Reservation confirmed! Ticket punched.');
        form.reset();
      } else {
        showToast('Error: ' + jsonResponse.message);
      }
      btn.innerText = originalText;
      btn.disabled = false;
    })
    .catch((error) => {
      showToast('The telegraph wires are tangled. Please call us directly!');
      btn.innerText = originalText;
      btn.disabled = false;
    });
  });
}

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.className = 'show';
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}
