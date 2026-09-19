# Deploying to Vercel

Nothing to configure — no environment variables, no database.

## Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
cd practice-studio-demo
vercel            # first run: link/create a project
vercel --prod     # gives the public URL to send
```

## Option B — GitHub

```bash
cd practice-studio-demo
git init
git add -A
git commit -m "Practice Studio MVP demo"
git branch -M main
git remote add origin git@github.com:<you>/practice-studio-demo.git
git push -u origin main
```

Then import the repo at vercel.com/new. Framework detection picks up Next.js on its own.

## Notes

- Build command `next build`, output handled by Vercel's Next.js preset. Defaults are fine.
- Microphone access needs HTTPS. Vercel serves HTTPS, so recording works on the deployed
  URL; on a local machine use `localhost`, which browsers also treat as secure.
- If you want the link private while it is being reviewed, turn on Vercel's Password
  Protection or Vercel Authentication under Project → Settings → Deployment Protection.
