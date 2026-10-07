// Shared "download a backup" button wired on every page.
async function downloadBackup() {
  const btn = document.getElementById("backup-btn");
  if (btn) btn.disabled = true;
  try {
    const [dataRes, healthRes] = await Promise.all([fetch("/api/data"), fetch("/api/health")]);
    const data = await dataRes.json();
    const health = await healthRes.json();
    const blob = new Blob([JSON.stringify({ data, health }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    a.href = url;
    a.download = `gym-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Backup failed: " + e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

document.getElementById("backup-btn").onclick = downloadBackup;
