# Institute Enquiry CRM — Microtech Computers · mtcedu.co.in

## Institute
- Name: **Microtech Computers**
- Address: Badhi Para, Hill Road, Mihijam, Dist. Jamtara, Jharkhand, India
- Email: mtcmihijam@gmail.com
- Contact: 9113788397 · 9308616839
- Website: mtcedu.co.in
- Logo bundled at /app/frontend/public/brand/microtech-logo.png

## Tech
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React 19 + MUI v9 + Chart.js
- Auth: JWT (bearer localStorage)
- Offline: PyInstaller onefile + CI matrix build (Win/Linux/Mac)

## Features implemented (rolling)
- 2026-01-01: MVP — auth, roles, enquiries, follow-ups, admissions, dashboards, reports, settings CRUD
- 2026-01-01: Rebrand + offline .exe builder (WINDOWS_BUILD.md, MicrotechCRM.spec)
- 2026-01-01: GitHub Actions — matrix build (Win/Linux/Mac) + CI (lint + smoke tests) + release-on-tag
- 2026-01-01: **Beautiful printable receipt** at /enquiries/:id/receipt with letterhead, logo, address, contacts, sections, signature blocks. Auto-redirect after new enquiry save. Print CSS optimized for A4.
- 2026-01-01: Logo integrated in sidebar, login, favicon, receipt. Institute footer strip on every page.

## Users
Password `Admin@123` for all seeded:
- superadmin@mtcedu.co.in (super_admin)
- admin@mtcedu.co.in (admin)
- reception@mtcedu.co.in (reception)
- counsellor@mtcedu.co.in (counsellor)
- faculty@mtcedu.co.in (faculty)

## Next / Backlog
- P1: File uploads (photo/Aadhaar/marksheet)
- P1: PDF export of the receipt (server-side rendering) + Excel export
- P2: Dark-mode toggle, browser notifications, global search
- P2: Institute Profile editable via Settings (currently hardcoded in utils/institute.js)
- P3: WhatsApp click-to-share receipt link
