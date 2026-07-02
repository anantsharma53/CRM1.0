# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for MicrotechCRM.exe (Windows onefile build).

Bundles:
  - the FastAPI backend (backend/)
  - the built React frontend (frontend/build/) as `static/`
  - all runtime deps

Run from the /app root on Windows:
    pyinstaller --clean MicrotechCRM.spec
Output: dist/MicrotechCRM.exe
"""
from PyInstaller.utils.hooks import collect_submodules
from pathlib import Path

ROOT = Path(SPECPATH).resolve() if "SPECPATH" in globals() else Path.cwd()

hiddenimports = []
hiddenimports += collect_submodules("uvicorn")
hiddenimports += collect_submodules("sqlalchemy.dialects.sqlite")
hiddenimports += ["email_validator", "bcrypt", "jose", "jose.backends", "jose.backends.cryptography_backend",
                  "passlib", "passlib.handlers", "passlib.handlers.bcrypt"]

datas = [
    (str(ROOT / "backend"), "backend"),
    (str(ROOT / "frontend" / "build"), "static"),
]

block_cipher = None

a = Analysis(
    [str(ROOT / "offline" / "run_offline.py")],
    pathex=[str(ROOT), str(ROOT / "backend")],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="MicrotechCRM",
    icon='resources/icon.ico',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,           # keep console so users can see server logs
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    
)
