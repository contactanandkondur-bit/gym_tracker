// Talks to our own /api/data serverless function, which holds the
// GitHub token server-side. No per-device setup, no token in the browser.

async function fetchDataFile() {
  const res = await fetch("/api/data");
  if (!res.ok) {
    throw new Error(`Load failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return { data };
}

async function saveDataFile(data) {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Save failed: ${res.status} ${await res.text()}`);
  }
}
