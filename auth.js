// Client-side PIN gate. Not real server auth — just stops casual access on
// a shared/unlocked device. Nothing on the page fetches data until unlocked;
// each page script registers its data-loading entry point as window.onUnlock.
(function () {
  const PIN_KEY = "gym_pin_hash";

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function buildOverlay() {
    const div = document.createElement("div");
    div.id = "lock-screen";
    div.className = "modal-overlay";
    div.innerHTML = `
      <div class="modal">
        <h2 id="lock-title">Enter PIN</h2>
        <p id="lock-sub"></p>
        <input id="lock-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" placeholder="••••" />
        <div id="lock-error" class="status err"></div>
        <div class="modal-actions">
          <button class="btn-primary" id="lock-submit">Unlock</button>
        </div>
        <p class="lock-forgot"><a href="#" id="lock-forgot">Forgot PIN? Reset</a></p>
      </div>
    `;
    document.body.appendChild(div);
    return div;
  }

  function unlock(overlay) {
    overlay.remove();
    if (typeof window.onUnlock === "function") window.onUnlock();
  }

  function setupFlow(overlay) {
    const subEl = overlay.querySelector("#lock-sub");
    const input = overlay.querySelector("#lock-input");
    const errEl = overlay.querySelector("#lock-error");
    const submitBtn = overlay.querySelector("#lock-submit");
    overlay.querySelector("#lock-forgot").style.display = "none";

    overlay.querySelector("#lock-title").textContent = "Set a PIN";
    subEl.textContent = "Choose a 4+ digit PIN to lock this app on this device.";
    let firstPin = null;

    async function submit() {
      const val = input.value.trim();
      if (val.length < 4) {
        errEl.textContent = "PIN must be at least 4 digits.";
        return;
      }
      if (firstPin === null) {
        firstPin = val;
        input.value = "";
        subEl.textContent = "Confirm your PIN.";
        errEl.textContent = "";
        return;
      }
      if (val !== firstPin) {
        errEl.textContent = "PINs didn't match. Try again.";
        firstPin = null;
        input.value = "";
        subEl.textContent = "Choose a 4+ digit PIN to lock this app on this device.";
        return;
      }
      localStorage.setItem(PIN_KEY, await sha256(val));
      unlock(overlay);
    }

    submitBtn.onclick = submit;
    input.onkeydown = (e) => { if (e.key === "Enter") submit(); };
    input.focus();
  }

  function unlockFlow(overlay, storedHash) {
    const input = overlay.querySelector("#lock-input");
    const errEl = overlay.querySelector("#lock-error");
    const submitBtn = overlay.querySelector("#lock-submit");

    async function submit() {
      const val = input.value.trim();
      const hash = await sha256(val);
      if (hash === storedHash) {
        unlock(overlay);
      } else {
        errEl.textContent = "Wrong PIN.";
        input.value = "";
      }
    }

    submitBtn.onclick = submit;
    input.onkeydown = (e) => { if (e.key === "Enter") submit(); };
    input.focus();

    overlay.querySelector("#lock-forgot").onclick = (e) => {
      e.preventDefault();
      if (confirm("Reset PIN on this device? You'll set a new one. Your workout/health data is unaffected.")) {
        localStorage.removeItem(PIN_KEY);
        overlay.remove();
        init();
      }
    };
  }

  function init() {
    const overlay = buildOverlay();
    const storedHash = localStorage.getItem(PIN_KEY);
    if (!storedHash) {
      setupFlow(overlay);
    } else {
      unlockFlow(overlay, storedHash);
    }
  }

  init();
})();
