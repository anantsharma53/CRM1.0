# GitHub Actions — Microtech Computers CRM

Three files live in `.github/workflows/`:

| Workflow | Runs on | What it does |
|---|---|---|
| **`build-windows-exe.yml`** | `windows-latest`, `ubuntu-latest`, `macos-latest` (matrix) | Builds `MicrotechCRM.exe` **for all 3 OSes** in parallel, smoke-tests each, uploads them as artifacts, and attaches to a GitHub Release on tag pushes. |
| **`ci.yml`** | `ubuntu-latest` | Lint + import-check for Python, ESLint + prod build for React, plus a live API smoke-test (starts uvicorn, curls `/api/health`, logs in, hits `/api/dashboard/stats`). |

---

## 1. Getting your binaries

### On every push (temporary artifacts, 30-day retention)
Repo → **Actions** tab → click the latest `Build MicrotechCRM binaries` run → scroll to **Artifacts**:
- `MicrotechCRM-windows-<sha>.zip` → contains `MicrotechCRM-windows.exe`
- `MicrotechCRM-linux-<sha>.zip`   → contains `MicrotechCRM-linux`  (make it executable with `chmod +x`)
- `MicrotechCRM-macos-<sha>.zip`   → contains `MicrotechCRM-macos`

### Publishing a release (permanent, shareable URLs)
```bash
git tag v1.0.0
git push origin v1.0.0
```
All three binaries are automatically attached to the auto-generated GitHub Release at `github.com/<you>/<repo>/releases`.

### Manual build
Repo → **Actions** → workflow name → **Run workflow** dropdown → pick branch → **Run**.

---

## 2. What the matrix build actually does

For **each** OS in parallel:

```
checkout code
  ↓
setup Python 3.11 + Node 20 (with dep caching)
  ↓
yarn install + yarn build   (REACT_APP_BACKEND_URL="" → uses relative /api)
  ↓
pip install requirements + pyinstaller
  ↓
pyinstaller MicrotechCRM.spec
  ↓
smoke-test the binary  (start → curl /api/health → login → kill)
  ↓
[Windows only, if signing cert present] signtool sign
  ↓
rename artifact → upload → attach to release (on tags)
```

Total time: ~6-10 min per OS, all running in parallel.

---

## 3. Enabling optional Windows code-signing

Windows Defender & SmartScreen love to flag unsigned PyInstaller exes. To sign your builds:

1. **Get a code-signing certificate** (e.g. from Sectigo, DigiCert, SSL.com — around $200-$400/year for OV, more for EV).
2. Export the cert as a `.pfx` file with a password.
3. Convert to base64 and store as GitHub secrets:
   ```bash
   base64 -w 0 mycert.pfx > cert.b64
   ```
4. In your repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - `WINDOWS_CERT_PFX_BASE64` → paste the contents of `cert.b64`
   - `WINDOWS_CERT_PASSWORD` → the cert's password
5. Done. Next Windows build will auto-sign the exe (the signing step in the workflow is conditional — it silently skips if the secrets aren't set).

---

## 4. CI details

The `ci.yml` workflow is your fast feedback loop (~2-3 min):

- **Ruff lint** on `backend/` (non-blocking — reports warnings but doesn't fail the build)
- **`python -c "import server"`** — catches syntax errors, missing imports, `.env` issues
- **Live API smoke test** — spins up uvicorn, seeds DB, curls `/api/health`, logs in as admin, hits a protected endpoint
- **ESLint** on `frontend/src/` (non-blocking initially)
- **`yarn build`** — catches JS syntax errors + broken imports

To make the linters **blocking**, remove the `|| true` at the end of the lint steps.

---

## 5. Enabling the workflows

1. Push to GitHub via the **"Save to Github"** button in the Emergent chat toolbar (bottom-left of the message input). The `.github/` folder is included automatically.
2. First push → GitHub Actions kicks in immediately.
3. Cost: **free for public repos**; private repos get 2,000 free Linux-minutes and 500 Windows-minutes/month.

---

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| Workflow doesn't appear | Ensure `.github/workflows/*.yml` was committed and pushed. |
| Release step returns 403 | Repo → Settings → Actions → General → **Workflow permissions** → *Read and write*. |
| macOS binary won't run: "cannot verify developer" | Right-click → Open → Open (bypass Gatekeeper), or sign with an Apple Developer ID cert. |
| Linux binary "permission denied" | `chmod +x MicrotechCRM-linux` after downloading. |
| Windows Defender flags the exe | Sign it (§3 above), or click "More info → Run anyway". |
| Workflow takes forever | First run is slow (no cache). Subsequent runs cache pip + yarn = much faster. |
