# Microtech Computers CRM — Offline Windows Build Guide

This bundles the FastAPI backend, the React frontend (as a static build), and Python itself into **one single `MicrotechCRM.exe`** that anyone can double-click to launch the whole system offline. The data lives in a `institute.db` SQLite file created **next to the exe** — so it is portable and survives across upgrades.

---

## What you get

- **`dist/MicrotechCRM.exe`** — one file. Double-click → browser opens to `http://127.0.0.1:8765`.
- **`institute.db`** — created next to the .exe on first run. Contains all users/enquiries/follow-ups.
- Works fully offline. No internet or Node.js required to *run* the .exe — only to build it.

---

## One-time build (on Windows only)

Cross-compiling a Windows `.exe` from Linux is not possible, so the .exe must be built on a Windows machine (or a Windows VM). You do this **once**; then you can copy the produced `.exe` to any Windows PC.

### Prerequisites

Install these on the Windows build machine:

1. **Python 3.11+** — https://www.python.org/downloads/ (tick *"Add Python to PATH"* during install).
2. **Node.js LTS 18/20** — https://nodejs.org/ (this also installs `npm`; `yarn` is optional).
3. **Git** — https://git-scm.com/downloads (only needed if you clone from GitHub).

### Build steps

```powershell
# 1. Copy this whole /app folder to your Windows machine (e.g. C:\microtech-crm)
# 2. Open Command Prompt in that folder
cd C:\microtech-crm

# 3. Run the one-click build
build_exe.bat
```

That's it. The script will:

1. `yarn install && yarn build` → produces `frontend/build/` static bundle
2. Create a Python venv, install `backend/requirements.txt` + `pyinstaller` + `uvicorn`
3. Run `pyinstaller MicrotechCRM.spec` → produces `dist\MicrotechCRM.exe`

Total build time: ~3-6 minutes on a modern PC.

### Manual build (if you don't want to use the .bat)

```powershell
cd frontend
yarn install
yarn build
cd ..

python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
pip install pyinstaller uvicorn

pyinstaller --clean MicrotechCRM.spec
```

---

## Running the .exe

1. Double-click `MicrotechCRM.exe`.
2. A console window opens showing the server URL. Your browser auto-launches to `http://127.0.0.1:8765`.
3. Log in with the seeded account:

| Email                        | Role         | Password  |
|------------------------------|--------------|-----------|
| `superadmin@mtcedu.co.in`    | Super Admin  | `Admin@123` |
| `admin@mtcedu.co.in`         | Admin        | `Admin@123` |
| `reception@mtcedu.co.in`     | Reception    | `Admin@123` |
| `counsellor@mtcedu.co.in`    | Counsellor   | `Admin@123` |
| `faculty@mtcedu.co.in`       | Faculty      | `Admin@123` |

4. Close the console window (or press Ctrl+C) to stop the server.

### Where is my data stored?

- SQLite file: **`institute.db`** in the same folder as `MicrotechCRM.exe`.
- **Backup** = copy that file. **Restore** = paste it back.
- To reset: delete `institute.db` and re-launch (it will re-seed defaults).

### Changing the port

By default the app listens on port `8765`. To change it, set an env var before launching:

```cmd
set MTC_PORT=9000
MicrotechCRM.exe
```

---

## Testing the offline build without PyInstaller (dev quick-run)

You can also run the offline server as a plain Python script (no .exe) on any OS:

```bash
cd /app
pip install -r backend/requirements.txt
cd frontend && yarn install && yarn build && cd ..
python offline/run_offline.py
```

Then open `http://127.0.0.1:8765`.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `python not found` | Reinstall Python with "Add to PATH" checked. |
| `yarn not found` | Run `npm install -g yarn` or edit build_exe.bat to use `npm run build`. |
| Windows Defender flags the .exe | This is common with PyInstaller onefile builds. Add an exclusion, or sign the exe with a code-signing certificate. |
| Browser doesn't auto-open | Manually visit `http://127.0.0.1:8765/`. |
| Port already in use | Set `MTC_PORT=9000` before launching. |
| Old @institute.com users still visible | They co-exist with the new mtcedu.co.in ones. Delete `institute.db` for a fresh seed. |

---

## Distribution to other Windows PCs

Just copy `dist\MicrotechCRM.exe` to a USB / shared drive / email. The receiving PC needs **nothing** installed — no Python, no Node.
