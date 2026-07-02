"""Backend API integration tests for Institute Enquiry CRM."""
import os
import time
import pytest
import requests

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://lead-master-22.preview.emergentagent.com"
API = f"{BASE}/api"

USERS = {
    "super_admin": "superadmin@institute.com",
    "admin": "admin@institute.com",
    "reception": "reception@institute.com",
    "counsellor": "counsellor@institute.com",
    "faculty": "faculty@institute.com",
}
PWD = "Admin@123"


def login(email, password=PWD):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    return r


def hdr(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def tokens():
    out = {}
    for role, email in USERS.items():
        r = login(email)
        assert r.status_code == 200, f"Login failed for {role}: {r.status_code} {r.text}"
        out[role] = r.json()["access_token"]
    return out


# ---------- Auth ----------

class TestAuth:
    def test_login_all_roles(self, tokens):
        assert set(tokens.keys()) == set(USERS.keys())

    def test_login_invalid(self):
        r = login("admin@institute.com", "wrong")
        assert r.status_code == 401

    def test_me_with_token(self, tokens):
        r = requests.get(f"{API}/auth/me", headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        assert r.json()["email"] == "admin@institute.com"

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_change_password_wrong_old(self, tokens):
        r = requests.post(f"{API}/auth/change-password",
                          json={"old_password": "WRONG", "new_password": "New@1234"},
                          headers=hdr(tokens["faculty"]))
        assert r.status_code == 400

    def test_change_password_success_and_restore(self):
        # Login as faculty
        t = login(USERS["faculty"]).json()["access_token"]
        r = requests.post(f"{API}/auth/change-password",
                          json={"old_password": PWD, "new_password": "Temp@1234"},
                          headers=hdr(t))
        assert r.status_code == 200
        # Login with new
        assert login(USERS["faculty"], "Temp@1234").status_code == 200
        # Restore
        t2 = login(USERS["faculty"], "Temp@1234").json()["access_token"]
        rr = requests.post(f"{API}/auth/change-password",
                           json={"old_password": "Temp@1234", "new_password": PWD},
                           headers=hdr(t2))
        assert rr.status_code == 200
        assert login(USERS["faculty"]).status_code == 200

    def test_forgot_password_and_restore(self):
        # Reset counsellor password then restore
        r = requests.post(f"{API}/auth/forgot-password",
                          json={"email": USERS["counsellor"], "new_password": "Reset@1234"})
        assert r.status_code == 200
        assert login(USERS["counsellor"], "Reset@1234").status_code == 200
        # Restore
        rr = requests.post(f"{API}/auth/forgot-password",
                           json={"email": USERS["counsellor"], "new_password": PWD})
        assert rr.status_code == 200
        assert login(USERS["counsellor"]).status_code == 200


# ---------- Master data ----------

class TestCourses:
    def test_list(self, tokens):
        r = requests.get(f"{API}/courses", headers=hdr(tokens["admin"]))
        assert r.status_code == 200 and len(r.json()) >= 5

    def test_create_update_delete(self, tokens):
        payload = {"name": "TEST_Course_X", "code": "TCX", "duration": "1 month", "fee": 100}
        c = requests.post(f"{API}/courses", json=payload, headers=hdr(tokens["admin"]))
        assert c.status_code == 200
        cid = c.json()["id"]
        u = requests.put(f"{API}/courses/{cid}", json={**payload, "fee": 200}, headers=hdr(tokens["admin"]))
        assert u.status_code == 200 and u.json()["fee"] == 200
        d = requests.delete(f"{API}/courses/{cid}", headers=hdr(tokens["admin"]))
        assert d.status_code == 200

    def test_non_admin_cannot_create(self, tokens):
        r = requests.post(f"{API}/courses", json={"name": "TEST_x"}, headers=hdr(tokens["faculty"]))
        assert r.status_code == 403


class TestBatches:
    def test_crud(self, tokens):
        courses = requests.get(f"{API}/courses", headers=hdr(tokens["admin"])).json()
        cid = courses[0]["id"]
        r = requests.post(f"{API}/batches", json={"name": "TEST_Batch", "course_id": cid, "timing": "9-12", "capacity": 20},
                          headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        bid = r.json()["id"]
        u = requests.put(f"{API}/batches/{bid}", json={"name": "TEST_Batch2", "course_id": cid, "timing": "10-1", "capacity": 25},
                         headers=hdr(tokens["admin"]))
        assert u.status_code == 200 and u.json()["name"] == "TEST_Batch2"
        assert requests.delete(f"{API}/batches/{bid}", headers=hdr(tokens["admin"])).status_code == 200


class TestLeadSources:
    def test_crud(self, tokens):
        r = requests.post(f"{API}/lead-sources", json={"name": "TEST_Source"}, headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        sid = r.json()["id"]
        u = requests.put(f"{API}/lead-sources/{sid}", json={"name": "TEST_Source2"}, headers=hdr(tokens["admin"]))
        assert u.status_code == 200 and u.json()["name"] == "TEST_Source2"
        assert requests.delete(f"{API}/lead-sources/{sid}", headers=hdr(tokens["admin"])).status_code == 200


class TestUsers:
    def test_list_admin(self, tokens):
        r = requests.get(f"{API}/users", headers=hdr(tokens["admin"]))
        assert r.status_code == 200 and len(r.json()) >= 5

    def test_reception_forbidden(self, tokens):
        r = requests.get(f"{API}/users", headers=hdr(tokens["reception"]))
        assert r.status_code == 403

    def test_create_counsellor_and_delete_restricted(self, tokens):
        payload = {"email": "TEST_c1@institute.com", "password": "Pass@123", "full_name": "T C1", "role": "counsellor"}
        # cleanup if any
        c = requests.post(f"{API}/users", json=payload, headers=hdr(tokens["admin"]))
        if c.status_code == 400:
            pytest.skip("Pre-existing test user; cleanup needed")
        assert c.status_code == 200
        uid = c.json()["id"]
        # admin cannot delete
        d1 = requests.delete(f"{API}/users/{uid}", headers=hdr(tokens["admin"]))
        assert d1.status_code == 403
        # super_admin can delete
        d2 = requests.delete(f"{API}/users/{uid}", headers=hdr(tokens["super_admin"]))
        assert d2.status_code == 200


# ---------- Enquiries ----------

@pytest.fixture(scope="session")
def created_enquiry_id(tokens):
    payload = {
        "student_name": "TEST_Rahul",
        "mobile": "9998887771",
        "email": "test_rahul@example.com",
        "priority": "High",
        "status": "New",
    }
    r = requests.post(f"{API}/enquiries", json=payload, headers=hdr(tokens["reception"]))
    assert r.status_code == 200, r.text
    return r.json()["id"]


class TestEnquiries:
    def test_create_reception(self, created_enquiry_id):
        assert isinstance(created_enquiry_id, int)

    def test_faculty_cannot_create(self, tokens):
        r = requests.post(f"{API}/enquiries", json={"student_name": "X", "mobile": "1"}, headers=hdr(tokens["faculty"]))
        assert r.status_code == 403

    def test_list_and_filters(self, tokens):
        r = requests.get(f"{API}/enquiries?page=1&page_size=10", headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        d = r.json()
        assert "items" in d and "total" in d
        r2 = requests.get(f"{API}/enquiries?search=TEST_Rahul", headers=hdr(tokens["admin"]))
        assert r2.status_code == 200 and r2.json()["total"] >= 1
        r3 = requests.get(f"{API}/enquiries?status=New", headers=hdr(tokens["admin"]))
        assert r3.status_code == 200

    def test_get_and_update(self, tokens, created_enquiry_id):
        r = requests.get(f"{API}/enquiries/{created_enquiry_id}", headers=hdr(tokens["admin"]))
        assert r.status_code == 200 and r.json()["student_name"] == "TEST_Rahul"
        u = requests.put(f"{API}/enquiries/{created_enquiry_id}", json={"priority": "Medium"}, headers=hdr(tokens["admin"]))
        assert u.status_code == 200 and u.json()["priority"] == "Medium"

    def test_check_mobile_duplicate(self, tokens):
        r = requests.get(f"{API}/enquiries/check-mobile?mobile=9998887771", headers=hdr(tokens["admin"]))
        assert r.status_code == 200 and r.json()["duplicate"] is True


class TestFollowups:
    def test_create_and_list(self, tokens, created_enquiry_id):
        payload = {
            "enquiry_id": created_enquiry_id,
            "date": "2026-07-01",
            "remarks": "Called",
            "communication_type": "Call",
            "status": "Interested",
            "next_followup_date": "2026-07-05",
        }
        r = requests.post(f"{API}/followups", json=payload, headers=hdr(tokens["counsellor"]))
        assert r.status_code == 200, r.text
        # Verify enquiry status/next_followup_date updated
        e = requests.get(f"{API}/enquiries/{created_enquiry_id}", headers=hdr(tokens["admin"])).json()
        assert e["status"] == "Interested"
        assert str(e["next_followup_date"]).startswith("2026-07-05")
        lst = requests.get(f"{API}/enquiries/{created_enquiry_id}/followups", headers=hdr(tokens["admin"]))
        assert lst.status_code == 200 and len(lst.json()) >= 1


class TestAdmissions:
    def test_convert_and_no_double(self, tokens, created_enquiry_id):
        payload = {"enquiry_id": created_enquiry_id, "fee_paid": 1000, "total_fee": 5000}
        r = requests.post(f"{API}/admissions", json=payload, headers=hdr(tokens["admin"]))
        assert r.status_code == 200, r.text
        assert r.json()["admission_no"].startswith("ADM-")
        # Double convert
        r2 = requests.post(f"{API}/admissions", json=payload, headers=hdr(tokens["admin"]))
        assert r2.status_code == 400
        # Enquiry status is now Admitted
        e = requests.get(f"{API}/enquiries/{created_enquiry_id}", headers=hdr(tokens["admin"])).json()
        assert e["status"] == "Admitted"
        # List admissions
        lst = requests.get(f"{API}/admissions", headers=hdr(tokens["admin"]))
        assert lst.status_code == 200 and len(lst.json()) >= 1


class TestDashboard:
    def test_stats(self, tokens):
        r = requests.get(f"{API}/dashboard/stats", headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        d = r.json()
        for k in ["total_enquiries", "admissions", "pending_followups", "conversion_rate"]:
            assert k in d
        assert isinstance(d["total_enquiries"], int)

    def test_charts(self, tokens):
        r = requests.get(f"{API}/dashboard/charts", headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        d = r.json()
        for k in ["monthly_enquiries", "course_wise", "lead_sources", "counsellor_performance", "admission_trend"]:
            assert isinstance(d[k], list)

    def test_counsellor_scoped_stats(self, tokens):
        r = requests.get(f"{API}/dashboard/stats", headers=hdr(tokens["counsellor"]))
        assert r.status_code == 200


class TestReports:
    def test_summary(self, tokens):
        r = requests.get(f"{API}/reports/summary", headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        d = r.json()
        for k in ["total", "by_status", "by_course", "by_source", "by_counsellor"]:
            assert k in d


# ---------- Cleanup (soft delete created enquiry) ----------
class TestZCleanup:
    def test_delete_enquiry(self, tokens, created_enquiry_id):
        r = requests.delete(f"{API}/enquiries/{created_enquiry_id}", headers=hdr(tokens["admin"]))
        assert r.status_code == 200
