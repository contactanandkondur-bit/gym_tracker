// Multi-profile client-side gate. Email identifies a profile (its own
// data.json/health.json namespace); a hashed PIN locks it on this device.
// Not real server auth, just a casual-access deterrent on a shared device.
(function () {
  const PROFILES_KEY = "gym_profiles"; // [{emailDisplay, emailKey, pinHash}]

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  function getProfiles() {
    try {
      return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveProfiles(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  function findProfile(emailKey) {
    return getProfiles().find((p) => p.emailKey === emailKey) || null;
  }

  function buildOverlay() {
    const div = document.createElement("div");
    div.id = "lock-screen";
    div.className = "modal-overlay";
    div.innerHTML = `
      <div class="modal">
        <h2 id="lock-title">Sign in</h2>
        <p id="lock-sub">Enter your email and PIN.</p>
        <label for="lock-email">Email</label>
        <input id="lock-email" type="email" placeholder="you@example.com" autocomplete="username" />
        <label for="lock-input">PIN</label>
        <input id="lock-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" placeholder="••••" autocomplete="current-password" />
        <div id="lock-error" class="status err"></div>
        <div class="modal-actions">
          <button class="btn-primary" id="lock-submit">Continue</button>
        </div>
        <p class="lock-forgot"><a href="#" id="lock-forgot">Forgot PIN for this email? Reset</a></p>
      </div>
    `;
    document.body.appendChild(div);
    return div;
  }

  function unlock(overlay, profile) {
    window.currentProfile = { emailKey: profile.emailKey, emailDisplay: profile.emailDisplay };
    overlay.remove();
    if (typeof window.onUnlock === "function") window.onUnlock();
  }

  function init() {
    const overlay = buildOverlay();
    const emailEl = overlay.querySelector("#lock-email");
    const pinEl = overlay.querySelector("#lock-input");
    const errEl = overlay.querySelector("#lock-error");
    const submitBtn = overlay.querySelector("#lock-submit");
    const subEl = overlay.querySelector("#lock-sub");
    const forgotLink = overlay.querySelector("#lock-forgot");

    let mode = "login"; // "login" | "confirmpin"
    let pendingEmailKey = null;
    let pendingEmailDisplay = null;
    let pendingPin = null;

    function resetToLogin(message) {
      mode = "login";
      pendingEmailKey = null;
      pendingEmailDisplay = null;
      pendingPin = null;
      subEl.textContent = message || "Enter your email and PIN.";
      emailEl.style.display = "block";
      pinEl.value = "";
      errEl.textContent = "";
    }

    async function submit() {
      errEl.textContent = "";

      if (mode === "login") {
        const emailDisplay = emailEl.value.trim();
        const emailKey = normalizeEmail(emailDisplay);
        const pin = pinEl.value.trim();
        if (!emailKey || !emailKey.includes("@")) {
          errEl.textContent = "Enter a valid email.";
          return;
        }
        if (pin.length < 4) {
          errEl.textContent = "PIN must be at least 4 digits.";
          return;
        }
        const existing = findProfile(emailKey);
        if (existing) {
          const hash = await sha256(pin);
          if (hash === existing.pinHash) {
            unlock(overlay, existing);
          } else {
            errEl.textContent = "Wrong PIN for this email.";
            pinEl.value = "";
          }
        } else {
          pendingEmailKey = emailKey;
          pendingEmailDisplay = emailDisplay;
          pendingPin = pin;
          mode = "confirmpin";
          subEl.textContent = `New here. Confirm your PIN to create a profile for ${emailDisplay}.`;
          emailEl.style.display = "none";
          pinEl.value = "";
          pinEl.focus();
        }
        return;
      }

      if (mode === "confirmpin") {
        const confirmPin = pinEl.value.trim();
        if (confirmPin !== pendingPin) {
          resetToLogin("PINs didn't match. Enter your email and PIN again.");
          return;
        }
        const pinHash = await sha256(confirmPin);
        const profiles = getProfiles();
        profiles.push({ emailDisplay: pendingEmailDisplay, emailKey: pendingEmailKey, pinHash });
        saveProfiles(profiles);
        unlock(overlay, { emailKey: pendingEmailKey, emailDisplay: pendingEmailDisplay });
      }
    }

    submitBtn.onclick = submit;
    pinEl.onkeydown = (e) => { if (e.key === "Enter") submit(); };
    emailEl.onkeydown = (e) => { if (e.key === "Enter") pinEl.focus(); };
    emailEl.focus();

    forgotLink.onclick = (e) => {
      e.preventDefault();
      const emailKey = normalizeEmail(emailEl.value || "");
      if (!emailKey) {
        errEl.textContent = "Type the email first, then tap reset.";
        return;
      }
      const profiles = getProfiles();
      const idx = profiles.findIndex((p) => p.emailKey === emailKey);
      if (idx === -1) {
        errEl.textContent = "No profile found for that email.";
        return;
      }
      if (confirm(`Reset PIN for ${profiles[idx].emailDisplay}? You'll set a new one. Your workout/health data is unaffected.`)) {
        profiles.splice(idx, 1);
        saveProfiles(profiles);
        resetToLogin("PIN reset. Enter your email again to set a new one.");
      }
    };
  }

  init();
})();
