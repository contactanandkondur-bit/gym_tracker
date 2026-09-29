// Shared settings modal for GitHub owner/repo/branch/token.
function openSettingsModal(onSaved) {
  const s = getSettings();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h2>Connect GitHub</h2>
      <p>Your data is stored as data.json in a GitHub repo. Create a fine-grained personal access token with read/write access to that repo's contents, and paste it below. The token is saved only in this browser.</p>
      <label>Repo owner (username)</label>
      <input id="s-owner" value="${s.owner}" placeholder="e.g. koanand" />
      <label>Repo name</label>
      <input id="s-repo" value="${s.repo}" placeholder="e.g. gym-tracker" />
      <label>Branch</label>
      <input id="s-branch" value="${s.branch || "main"}" placeholder="main" />
      <label>Personal access token</label>
      <input id="s-token" type="password" value="${s.token}" placeholder="github_pat_..." />
      <div class="modal-actions">
        <button class="btn-secondary" id="s-cancel">Cancel</button>
        <button class="btn-primary" id="s-save">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector("#s-cancel").onclick = () => overlay.remove();
  overlay.querySelector("#s-save").onclick = () => {
    saveSettings({
      owner: overlay.querySelector("#s-owner").value,
      repo: overlay.querySelector("#s-repo").value,
      branch: overlay.querySelector("#s-branch").value,
      token: overlay.querySelector("#s-token").value,
    });
    overlay.remove();
    if (onSaved) onSaved();
  };
}
