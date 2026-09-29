# Gym Log

Simple static gym tracker. Log daily set weights, see weight trends per exercise. Data is stored as `data.json` in this same GitHub repo, updated directly from the browser via the GitHub Contents API.

## One-time setup

1. **Create a GitHub repo** (public or private) and push this folder to it.
2. **Create a fine-grained personal access token**: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
   - Repository access: only this repo.
   - Permissions: Contents → Read and write.
3. **Deploy to Vercel**: import the repo at vercel.com, no build settings needed (static site).
4. Open the deployed site, tap the ⚙️ icon, enter:
   - Repo owner (your GitHub username)
   - Repo name
   - Branch (usually `main`)
   - The token from step 2
5. That's it — it's saved in your browser only. Log a set and hit Save; check the repo, `data.json` will update with a new commit.

## Usage

- **Log page**: pick a day (defaults to today), enter the weight for each set, hit Save.
- **Trends page**: pick an exercise from the dropdown to see a line chart of max/avg weight per session over time.

## Notes

- Reps/sets per exercise are fixed in `workouts.js` — edit that file if your program changes.
- The token is stored only in `localStorage` on whatever device/browser you open this on; re-enter it if you clear browser data or use a new device.
