# Run and deploy Pitch Royale

Use Node.js 22.12 or newer in the Node 22 line (or a newer version supported by
the installed Vite release). The local build needs Vite; the server only needs
production dependencies. Run deployment commands in Git Bash on Windows.

## Local development

Copy `service/dbConfig.example.json` to `service/dbConfig.json` and enter your
Atlas database username, password, and cluster hostname. Pitch Royale uses the
`pitch_royale` database in that cluster. Allow your local IP in Atlas, and keep
the private configuration file out of Git.

From the project root:

```bash
npm ci
npm start
```

In another terminal run `npm run dev` and open the Vite address. Vite forwards
`/api` requests to Express on port 4000. For the production layout locally, run
`npm run build`, then `npm start` and open `http://localhost:4000`.

Run backend integration checks with `node --test service/game.test.cjs`.

## Verify a deployment package without contacting the server

```bash
bash scripts/deployService.sh -n
```

This checks the existing installed dependencies, tests the service, builds React, and lists a
temporary deployment archive. It rebuilds the local `dist` directory and
removes the temporary archive after checking it. No key is needed in this mode.
Run `npm ci` first if dependencies are not installed. Actual deployment uses
`npm ci` before building and installs locked production dependencies remotely.

## Server requirements

The course Ubuntu server needs Node.js, npm, PM2, and tar. If Node is installed
through nvm, the script loads `$HOME/.nvm/nvm.sh`. Confirm the active Node version
on the server before deploying. The public HTTPS reverse proxy must route
`startup.curtislingwall.click` to port 4000, including `/api` and page requests.
This script does not edit the reverse proxy, install PM2, or configure PM2's
machine startup service.

The app runs as one PM2 process named `startup`, with `NODE_ENV=production`.
Production cookies require HTTPS. Use the public HTTPS address for account
checks; plain HTTP access to port 4000 is only suitable for the health check.

## Deploy when ready

Before deploying, create `~/services/startup/service` on the course server and
put the private `dbConfig.json` there. Keep the file readable only by the service
account. The Atlas database user needs read and write access to `pitch_royale`,
including permission to create the session expiration index. The server's
outbound IP must be allowed in Atlas. The deployment archive excludes credentials.

From the project root, replace the example key path with your real key path:

```bash
bash scripts/deployService.sh -k "../your-key.pem" -h curtislingwall.click -s startup
```

`-h` is the SSH hostname, without a URL scheme or path. `-s startup` is optional;
the script intentionally targets only startup, which uses port 4000. It will
not deploy over the course Simon service. The old `deployReact.sh` forwards
these same options to the service script for compatibility.

The deployed structure is:

```text
~/services/startup/
  package.json
  package-lock.json
  ecosystem.config.js
  service/
    index.js
    database.js
    dbConfig.json  (provided separately)
    telemetry.js
  dist/
    index.html
    assets/...
```

The script installs production dependencies on the server, replaces the PM2
`startup` process so its entry point is correct, checks `/api/health` on port
4000, and saves the PM2 process list. Deployment briefly interrupts startup.
If deployment fails, inspect the PM2 logs and redeploy a corrected version.

Accounts, sessions, and signed-in game attempts live in MongoDB. Accounts and
attempts survive restarts. Sessions continue until logout or expiration.

## Check the public site after deployment

1. Open `https://startup.curtislingwall.click/api/health` and confirm `status: ok`.
2. Open `/play` directly and refresh; React should load.
3. Create an account, log in, refresh, and confirm your session remains active.
4. Submit a game guess and confirm it appears on Scores.
5. Verify trivia loading and click-to-reveal answers.
6. Log out and confirm `/api/stats` returns 401.

For troubleshooting, connect to the server and run `pm2 status` and
`pm2 logs startup --lines 30 --nostream`. A 502 generally means the reverse
proxy could not reach the backend; check the startup process and port 4000.

The Startup DB update was verified locally against Atlas. Repeat the checks
above on the public HTTPS site after deploying this version.
