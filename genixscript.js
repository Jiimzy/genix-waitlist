
const SUPABASE_URL = 'https://wwmsomtbujsvodblgqfc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bXNvbXRidWpzdm9kYmxncWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzODc0NTIsImV4cCI6MjEwMTk2MzQ1Mn0.R7Tb3CN_S5sg-Hler-hudOIWlly43TgOxghxMHWlTxA';
const WAITLIST_TABLE = 'waitlist';

const supabaseClient =
  SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;



const header = document.getElementById('siteHeader');
const revealAfter = 220;

function onScroll() {
  header.classList.toggle('is-visible', window.scrollY > revealAfter);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200);
}

const form = document.getElementById('waitlistForm');
const input = document.getElementById('email');
const btn = document.getElementById('waitlistBtn');
const hint = document.getElementById('formHint');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setHint(text, state) {
  hint.textContent = text;
  hint.classList.remove('is-error', 'is-success');
  if (state) hint.classList.add(state);
}

function setLoading(isLoading) {
  btn.classList.toggle('is-loading', isLoading);
  btn.disabled = isLoading;
  input.disabled = isLoading;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = input.value.trim();

  if (!EMAIL_RE.test(email)) {
    setHint("That email doesn't look right — mind double-checking it?", 'is-error');
    input.focus();
    return;
  }

  if (!supabaseClient) {
  // page responsiveness while we wait for mr ceo to configure supabase
    console.warn(
      'Supabase is not configured yet. Set SUPABASE_URL and SUPABASE_ANON_KEY in genixscript.js.'
    );
    setHint('Waitlist isn\u2019t connected yet — check back soon.', 'is-error');
    return;
  }

  setLoading(true);
  setHint("No spam. We'll only reach out when it's time.");

  const { error } = await supabaseClient
    .from(WAITLIST_TABLE)
    .insert({ email });

  setLoading(false);

  if (error) {
    // Postgres unique-violation code
    if (error.code === '23505') {
      setHint("You're already on the list \u2014 we've got you.", 'is-success');
    } else {
      console.error('Supabase insert error:', error);
      setHint('Something went wrong. Please try again in a moment.', 'is-error');
    }
    return;
  }

  form.reset();
  input.placeholder = "You're on the list!";
  setHint("You're in \u2014 we'll be in touch when it's time.", 'is-success');
  showToast('Added to the waitlist \uD83C\uDF89');
});
