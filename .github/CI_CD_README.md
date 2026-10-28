# CI/CD Setup

## Pipeline (fully automated once remote is linked)
1. `Website/` deploys to **GitHub Pages** on every push to main (also has manual `workflow_dispatch`)
2. No build step needed — pure static + PWA
3. Zero cost

## One-time link (do on the GitHub Android app, then finish here)
1. In the GitHub app: create new repo `gabochie/yeshurun` (public, no README init)
2. On GitHub (browser): Settings → Developer settings → Personal access tokens → Generate (scope: `repo` + classic is fine)
3. Come back here and run:
   ```bash
   git remote add origin https://gabochie:<TOKEN>@github.com/gabochie/yeshurun.git
   git push -u origin main
   ```
4. Enable GitHub Pages from Actions: Settings → Pages → Source: GitHub Actions
5. Site is live at: `https://gabochie.github.io/yeshurun/` (auto-updates on every push)

## Optional extras (later)
- Custom domain `studio.gabochie.com/books/yeshurun` via CNAME file + DNS
- `grunt `... no, keep zero-build
- Add endpoint: on feature branch push, still deploy main only

## Notes
- Do NOT commit PAT into history of this file (keep token out of repo)
- If pushing over HTTPS PAT: use `git credential-store` instead of embedding the token (`git config credential.helper store`, then it'll save once at first push)
- Manifold check: Actions won't run until at least one push exists
