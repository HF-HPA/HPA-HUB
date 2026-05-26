// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);

const splash = $("splash");
const login  = $("login");
const dash   = $("dash");

const logoContainer = $("logoContainer");
const logo = $("logo");

const ambience = $("ambience");
const muteBtn = $("muteBtn");
const statusChip = $("statusChip");

const loginBtn = $("loginBtn");
const logoutBtn = $("logoutBtn");
const loginError = $("loginError");

const mistWrap = $("mistWrap");
const leafWrap = $("leafWrap");

const toast = $("toast");

// ---------- Screen switching ----------
function showScreen(screen){
  [splash, login, dash].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function fadeLogoAndGoLogin(){
  // Start audio on first real interaction (browser requirement)
  startAudioSafe();

  logo.classList.add("fade-out");
  statusChip.textContent = "Entering…";

  setTimeout(() => {
    showScreen(login);
    statusChip.textContent = "Login";
  }, 850);
}

// ---------- Audio ----------
let audioReady = false;
let muted = false;

function startAudioSafe(){
  if (audioReady || !ambience) return;

  // If no file provided, this will just fail silently (that's okay)
  ambience.volume = 0.55;
  ambience.play()
    .then(() => {
      audioReady = true;
      statusChip.textContent = "Sound On";
      muteBtn.textContent = "🔊 Sound";
      muteBtn.setAttribute("aria-pressed", "false");
    })
    .catch(() => {
      // Most common if no file exists or user hasn't interacted (but we call from interaction)
      statusChip.textContent = "Sound File Missing (add assets/jungle-ambience.mp3)";
      muteBtn.textContent = "🔈 Sound";
    });
}

muteBtn.addEventListener("click", () => {
  if (!ambience) return;
  startAudioSafe();

  muted = !muted;
  ambience.muted = muted;
  muteBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
  muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
  statusChip.textContent = muted ? "Muted" : "Sound On";
});

// ---------- Enter interactions (click + keyboard) ----------
logoContainer.addEventListener("click", fadeLogoAndGoLogin);
logoContainer.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fadeLogoAndGoLogin();
  }
});

// ---------- Fake auth: Login -> Dashboard ----------
loginBtn.addEventListener("click", () => {
  const u = $("user").value.trim();
  const p = $("pass").value.trim();

  if (!u || !p) {
    loginError.textContent = "Please enter a username and password (demo accepts anything).";
    return;
  }
  loginError.textContent = "";
  statusChip.textContent = "Authenticating…";

  // Small transition delay for effect
  setTimeout(() => {
    showScreen(dash);
    statusChip.textContent = `Welcome, ${u}`;
    toastMsg("Logged in ✔");
  }, 450);
});

logoutBtn.addEventListener("click", () => {
  statusChip.textContent = "Logged out";
  $("user").value = "";
  $("pass").value = "";
  showScreen(login);
  toastMsg("Logged out");
});

// Dashboard tile toasts (demo)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-toast]");
  if (!btn) return;
  toastMsg(btn.getAttribute("data-toast"));
});

function toastMsg(msg){
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 1400);
}

// ---------- Effects: Leaves + Mist ----------
function makeMist(){
  // 4 drifting mist bands
  const tops = [18, 34, 56, 72];
  tops.forEach((t, i) => {
    const m = document.createElement("div");
    m.className = "mist";
    m.style.setProperty("--top", `${t}%`);
    m.style.setProperty("--mdur", `${14 + i*4}s`);
    m.style.animationDelay = `${i * -3}s`;
    mistWrap.appendChild(m);
  });
}

function makeLeaves(count = 14){
  for (let i = 0; i < count; i++){
    const leaf = document.createElement("div");
    leaf.className = "leaf";

    // Randomize size, position, speed, drift
    const x = Math.random() * 100;
    const s = 0.75 + Math.random() * 1.15;
    const dur = 8 + Math.random() * 8;
    const drift = (Math.random() * 180 - 90).toFixed(0);
    const delay = (Math.random() * -dur).toFixed(2);

    leaf.style.left = `${x}vw`;
    leaf.style.transform = `scale(${s}) rotate(${Math.random()*40-20}deg)`;
    leaf.style.setProperty("--dur", `${dur}s`);
    leaf.style.setProperty("--drift", `${drift}px`);
    leaf.style.animationDelay = `${delay}s`;

    leafWrap.appendChild(leaf);
  }
}

makeMist();
makeLeaves();

// ---------- Parallax (mouse + touch) ----------
const layers = Array.from(document.querySelectorAll(".layer"));

function applyParallax(nx, ny){
  // nx, ny are -1..1
  layers.forEach(layer => {
    const depth = parseFloat(layer.dataset.depth || "0.1");
    const tx = nx * 30 * depth;  // subtle shift
    const ty = ny * 20 * depth;
    layer.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.06)`;
  });
}

window.addEventListener("mousemove", (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  applyParallax(nx, ny);
}, { passive: true });

// Touch parallax: follow finger
window.addEventListener("touchmove", (e) => {
  if (!e.touches || !e.touches[0]) return;
  const t = e.touches[0];
  const nx = (t.clientX / window.innerWidth) * 2 - 1;
  const ny = (t.clientY / window.innerHeight) * 2 - 1;
  applyParallax(nx, ny);
}, { passive: true });

// Optional: device tilt parallax (only works on supported devices + permissions)
window.addEventListener("deviceorientation", (e) => {
  // gamma: left-right (-90..90), beta: front-back (-180..180)
  if (typeof e.gamma !== "number" || typeof e.beta !== "number") return;
  const nx = Math.max(-1, Math.min(1, e.gamma / 35));
  const ny = Math.max(-1, Math.min(1, e.beta / 55));
  applyParallax(nx, ny);
}, { passive: true });

// ---------- Swipe navigation ----------
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

function onTouchStart(e){
  if (!e.touches || !e.touches[0]) return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchStartTime = Date.now();
}

function onTouchEnd(e){
  const dx = (e.changedTouches?.[0]?.clientX ?? touchStartX) - touchStartX;
  const dy = (e.changedTouches?.[0]?.clientY ?? touchStartY) - touchStartY;
  const dt = Date.now() - touchStartTime;

  // Quick-ish swipe
  if (dt > 900) return;

  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  // Swipe Up on Splash -> Login
  if (splash.classList.contains("active") && ay > 55 && dy < -35 && ay > ax){
    fadeLogoAndGoLogin();
    return;
  }

  // Swipe Right on Login -> Splash (back)
  if (login.classList.contains("active") && ax > 70 && dx > 40 && ax > ay){
    statusChip.textContent = "Back";
    showScreen(splash);
    logo.classList.remove("fade-out");
    return;
  }
}

window.addEventListener("touchstart", onTouchStart, { passive: true });
window.addEventListener("touchend", onTouchEnd, { passive: true });

// ---------- First interaction: try starting audio (for users who don't click logo) ----------
["click", "keydown", "touchstart"].forEach(evt => {
  window.addEventListener(evt, () => startAudioSafe(), { once:true, passive:true });
});
``
