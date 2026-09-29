// Vercel serverless function: proxies GitHub Contents API for data.json.
// The GitHub token lives only here, as a Vercel environment variable —
// it never reaches the browser, so no device needs to enter it.
module.exports = async function handler(req, res) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  const branch = GITHUB_BRANCH || "main";

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    res.status(500).json({ error: "Server missing GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO env vars" });
    return;
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  try {
    if (req.method === "GET") {
      const r = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
      if (r.status === 404) {
        res.status(200).json({});
        return;
      }
      if (!r.ok) throw new Error(`GitHub read failed: ${r.status} ${await r.text()}`);
      const json = await r.json();
      const content = Buffer.from(json.content, "base64").toString("utf-8");
      res.status(200).json(JSON.parse(content || "{}"));
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      let sha = null;
      const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
      if (getRes.ok) {
        sha = (await getRes.json()).sha;
      }

      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Update workout data ${new Date().toISOString()}`,
          content: Buffer.from(JSON.stringify(body, null, 2), "utf-8").toString("base64"),
          branch,
          ...(sha ? { sha } : {}),
        }),
      });
      if (!putRes.ok) throw new Error(`GitHub write failed: ${putRes.status} ${await putRes.text()}`);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
