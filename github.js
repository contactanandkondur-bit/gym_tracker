// Minimal GitHub Contents API wrapper. Token/owner/repo stored in localStorage only.
const GH_KEYS = { owner: "gh_owner", repo: "gh_repo", branch: "gh_branch", token: "gh_token" };
const DATA_PATH = "data.json";

function getSettings() {
  return {
    owner: localStorage.getItem(GH_KEYS.owner) || "",
    repo: localStorage.getItem(GH_KEYS.repo) || "",
    branch: localStorage.getItem(GH_KEYS.branch) || "main",
    token: localStorage.getItem(GH_KEYS.token) || "",
  };
}

function saveSettings({ owner, repo, branch, token }) {
  localStorage.setItem(GH_KEYS.owner, owner.trim());
  localStorage.setItem(GH_KEYS.repo, repo.trim());
  localStorage.setItem(GH_KEYS.branch, (branch || "main").trim());
  localStorage.setItem(GH_KEYS.token, token.trim());
}

function hasSettings() {
  const s = getSettings();
  return !!(s.owner && s.repo && s.token);
}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode("0x" + p1)));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

async function ghApiUrl(path) {
  const { owner, repo } = getSettings();
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
}

async function fetchDataFile() {
  const { branch, token } = getSettings();
  const url = (await ghApiUrl(DATA_PATH)) + `?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (res.status === 404) {
    return { data: {}, sha: null };
  }
  if (!res.ok) {
    throw new Error(`GitHub read failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  const content = b64DecodeUnicode(json.content.replace(/\n/g, ""));
  return { data: JSON.parse(content || "{}"), sha: json.sha };
}

async function saveDataFile(data, sha, message) {
  const { branch, token } = getSettings();
  const url = await ghApiUrl(DATA_PATH);
  const body = {
    message: message || "Update workout data",
    content: b64EncodeUnicode(JSON.stringify(data, null, 2)),
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub save failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.content.sha;
}
