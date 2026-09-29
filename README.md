# Gym Log

Simple static gym tracker. Log daily set weights, see weight trends per exercise. Data is stored as `data.json` in this GitHub repo. A Vercel serverless function (`api/data.js`) reads/writes it using a token kept server-side, so no browser or device ever needs to enter credentials.

## One-time setup

1. **Create a fine-grained personal access token**: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
   - Repository access: only this repo (`gym_tracker`).
   - Permissions: Contents → Read and write.
   - Copy the token — you'll paste it into Vercel, never into the app itself.
2. **Deploy to Vercel**: import this repo at vercel.com. No build settings needed (static site + one serverless function).
3. In the Vercel project → Settings → Environment Variables, add:
   - `GITHUB_TOKEN` = the token from step 1
   - `GITHUB_OWNER` = `contactanandkondur-bit`
   - `GITHUB_REPO` = `gym_tracker`
   - `GITHUB_BRANCH` = `main`
4. Redeploy (Vercel prompts you to after adding env vars). That's it — open the URL on any device (phone, laptop, whatever) and it just works, no login or token entry needed anywhere.

## Usage

- **Log page**: always opens on today's date. Use ◀ / ▶ to step to a past day if you need to log or fix an earlier entry; "Jump to today" snaps back. Enter weight per set, hit Save.
- **Trends page**: pick an exercise from the dropdown to see a line chart of max/avg weight per session over time.

## Notes

- Reps/sets per exercise are fixed in `workouts.js` — edit that file if your program changes.
- The GitHub token lives only in Vercel's environment variables — it's never sent to or stored in any browser.
