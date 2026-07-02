"""Microtech Computers CRM - offline launcher.

Starts the FastAPI server on 127.0.0.1:8765 and opens the default browser.
Used both as the entry point for the PyInstaller-built .exe and for direct
`python run_offline.py` runs.
"""
import os
import sys
import time
import socket
import threading
import webbrowser
from pathlib import Path

# --- Resolve paths (works both as script and as PyInstaller onefile) ---
if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys._MEIPASS)  # bundled resources
    EXTERNAL_DIR = Path(sys.executable).parent  # sits next to the exe
else:
    BASE_DIR = Path(__file__).resolve().parent
    EXTERNAL_DIR = BASE_DIR

# Persistent DB lives next to the exe (or the script) so users keep their data
DB_PATH = EXTERNAL_DIR / "institute.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{DB_PATH.as_posix()}")
os.environ.setdefault("JWT_SECRET", "microtech-mtcedu-offline-secret-change-me")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("JWT_EXPIRES_MINUTES", "1440")
os.environ.setdefault("CORS_ORIGINS", "*")

# Make `backend/` importable
sys.path.insert(0, str(BASE_DIR / "backend"))

HOST = "127.0.0.1"
PORT = int(os.environ.get("MTC_PORT", "8765"))


def _wait_ready(host: str, port: int, timeout: float = 15.0) -> bool:
    end = time.time() + timeout
    while time.time() < end:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.3)
    return False


def _open_browser():
    if _wait_ready(HOST, PORT):
        webbrowser.open(f"http://{HOST}:{PORT}/")


def main():
    import uvicorn
    from server import app  # noqa: F401  (loads routes + seeder)

    print("=" * 60)
    print(" Microtech Computers · Institute Enquiry CRM (Offline)")
    print(f"   URL      : http://{HOST}:{PORT}")
    print(f"   Database : {DB_PATH}")
    print("   Press Ctrl+C to stop.")
    print("=" * 60)

    threading.Thread(target=_open_browser, daemon=True).start()
    uvicorn.run(app, host=HOST, port=PORT, log_level="warning")


if __name__ == "__main__":
    main()
