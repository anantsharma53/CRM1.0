"""Institute Enquiry CRM - FastAPI backend."""
import os
import logging
from datetime import datetime, timezone, date, timedelta
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query, status
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import func, and_, or_, extract
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User, Course, Batch, LeadSource, Enquiry, FollowUp, Admission
from schemas import (
    LoginRequest, TokenResponse, ChangePasswordRequest, ForgotPasswordRequest,
    UserCreate, UserUpdate, UserOut,
    CourseCreate, CourseOut,
    BatchCreate, BatchOut,
    LeadSourceCreate, LeadSourceOut,
    EnquiryCreate, EnquiryUpdate, EnquiryOut,
    FollowUpCreate, FollowUpOut,
    AdmissionCreate, AdmissionOut,
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_roles,
)


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("crm")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Microtech Computers · Institute Enquiry CRM")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Helpers ----------

def enquiry_to_out(e: Enquiry) -> dict:
    return {
        "id": e.id,
        "student_name": e.student_name,
        "father_name": e.father_name,
        "mother_name": e.mother_name,
        "gender": e.gender,
        "dob": e.dob,
        "mobile": e.mobile,
        "whatsapp": e.whatsapp,
        "email": e.email,
        "address": e.address,
        "city": e.city,
        "state": e.state,
        "pincode": e.pincode,
        "qualification": e.qualification,
        "school_college": e.school_college,
        "board_university": e.board_university,
        "passing_year": e.passing_year,
        "percentage": e.percentage,
        "course_id": e.course_id,
        "batch_id": e.batch_id,
        "preferred_timing": e.preferred_timing,
        "mode": e.mode,
        "lead_source_id": e.lead_source_id,
        "reference_name": e.reference_name,
        "counsellor_id": e.counsellor_id,
        "enquiry_date": e.enquiry_date,
        "next_followup_date": e.next_followup_date,
        "priority": e.priority,
        "remarks": e.remarks,
        "status": e.status,
        "created_at": e.created_at,
        "updated_at": e.updated_at,
        "course_name": e.course.name if e.course else None,
        "batch_name": e.batch.name if e.batch else None,
        "lead_source_name": e.lead_source.name if e.lead_source else None,
        "counsellor_name": e.counsellor.full_name if e.counsellor else None,
        "followup_count": len(e.followups),
    }


# ---------- Auth ----------

@api.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    token = create_access_token(user.id, user.email, user.role)
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}


@api.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@api.post("/auth/change-password")
def change_password(payload: ChangePasswordRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@api.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Simple forgot-password: sets a new password if email exists (no email flow enabled per user choice)."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset. You can now log in."}


# ---------- Users (Admin) ----------

@api.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "super_admin")),
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(User.created_at.desc()).all()


@api.get("/users/counsellors", response_model=List[UserOut])
def list_counsellors(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(User).filter(User.role == "counsellor", User.is_active == True).all()


@api.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    u = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        phone=payload.phone,
        is_active=payload.is_active,
    )
    db.add(u); db.commit(); db.refresh(u)
    return u


@api.put("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    data = payload.model_dump(exclude_unset=True)
    if "password" in data and data["password"]:
        u.password_hash = hash_password(data.pop("password"))
    else:
        data.pop("password", None)
    for k, v in data.items():
        setattr(u, k, v)
    db.commit(); db.refresh(u)
    return u


@api.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("super_admin"))):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(u); db.commit()
    return {"message": "User deleted"}


# ---------- Courses ----------

@api.get("/courses", response_model=List[CourseOut])
def list_courses(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Course).order_by(Course.name).all()


@api.post("/courses", response_model=CourseOut)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    c = Course(**payload.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c


@api.put("/courses/{course_id}", response_model=CourseOut)
def update_course(course_id: int, payload: CourseCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    for k, v in payload.model_dump().items():
        setattr(c, k, v)
    db.commit(); db.refresh(c)
    return c


@api.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(c); db.commit()
    return {"message": "deleted"}


# ---------- Batches ----------

@api.get("/batches", response_model=List[BatchOut])
def list_batches(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(Batch).order_by(Batch.name).all()
    return [
        {**BatchOut.model_validate(b).model_dump(), "course_name": b.course.name if b.course else None}
        for b in rows
    ]


@api.post("/batches", response_model=BatchOut)
def create_batch(payload: BatchCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    b = Batch(**payload.model_dump())
    db.add(b); db.commit(); db.refresh(b)
    return {**BatchOut.model_validate(b).model_dump(), "course_name": b.course.name if b.course else None}


@api.put("/batches/{batch_id}", response_model=BatchOut)
def update_batch(batch_id: int, payload: BatchCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    b = db.query(Batch).filter(Batch.id == batch_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")
    for k, v in payload.model_dump().items():
        setattr(b, k, v)
    db.commit(); db.refresh(b)
    return {**BatchOut.model_validate(b).model_dump(), "course_name": b.course.name if b.course else None}


@api.delete("/batches/{batch_id}")
def delete_batch(batch_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    b = db.query(Batch).filter(Batch.id == batch_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")
    db.delete(b); db.commit()
    return {"message": "deleted"}


# ---------- Lead Sources ----------

@api.get("/lead-sources", response_model=List[LeadSourceOut])
def list_sources(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(LeadSource).order_by(LeadSource.name).all()


@api.post("/lead-sources", response_model=LeadSourceOut)
def create_source(payload: LeadSourceCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    ls = LeadSource(**payload.model_dump())
    db.add(ls); db.commit(); db.refresh(ls)
    return ls


@api.put("/lead-sources/{source_id}", response_model=LeadSourceOut)
def update_source(source_id: int, payload: LeadSourceCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    ls = db.query(LeadSource).filter(LeadSource.id == source_id).first()
    if not ls:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump().items():
        setattr(ls, k, v)
    db.commit(); db.refresh(ls)
    return ls


@api.delete("/lead-sources/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    ls = db.query(LeadSource).filter(LeadSource.id == source_id).first()
    if not ls:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(ls); db.commit()
    return {"message": "deleted"}


# ---------- Enquiries ----------

@api.get("/enquiries/check-mobile")
def check_mobile(mobile: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    exists = db.query(Enquiry).filter(Enquiry.mobile == mobile, Enquiry.is_deleted == False).first()
    return {"duplicate": bool(exists), "enquiry_id": exists.id if exists else None}


@api.get("/enquiries")
def list_enquiries(
    search: Optional[str] = None,
    status_f: Optional[str] = Query(None, alias="status"),
    course_id: Optional[int] = None,
    counsellor_id: Optional[int] = None,
    priority: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Enquiry).filter(Enquiry.is_deleted == False)
    if user.role == "counsellor":
        q = q.filter(Enquiry.counsellor_id == user.id)
    if search:
        s = f"%{search}%"
        q = q.filter(or_(
            Enquiry.student_name.ilike(s),
            Enquiry.mobile.ilike(s),
            Enquiry.email.ilike(s),
        ))
    if status_f:
        q = q.filter(Enquiry.status == status_f)
    if course_id:
        q = q.filter(Enquiry.course_id == course_id)
    if counsellor_id:
        q = q.filter(Enquiry.counsellor_id == counsellor_id)
    if priority:
        q = q.filter(Enquiry.priority == priority)
    total = q.count()
    rows = q.order_by(Enquiry.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [enquiry_to_out(e) for e in rows],
    }


@api.get("/enquiries/{eid}")
def get_enquiry(eid: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    e = db.query(Enquiry).filter(Enquiry.id == eid, Enquiry.is_deleted == False).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return enquiry_to_out(e)


@api.post("/enquiries")
def create_enquiry(payload: EnquiryCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("reception", "admin", "super_admin", "counsellor"))):
    data = payload.model_dump()
    if not data.get("enquiry_date"):
        data["enquiry_date"] = datetime.now(timezone.utc).date()
    e = Enquiry(**data, created_by_id=user.id)
    db.add(e); db.commit(); db.refresh(e)
    return enquiry_to_out(e)


@api.put("/enquiries/{eid}")
def update_enquiry(eid: int, payload: EnquiryUpdate, db: Session = Depends(get_db), _: User = Depends(require_roles("reception", "admin", "super_admin", "counsellor"))):
    e = db.query(Enquiry).filter(Enquiry.id == eid, Enquiry.is_deleted == False).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(e, k, v)
    db.commit(); db.refresh(e)
    return enquiry_to_out(e)


@api.delete("/enquiries/{eid}")
def delete_enquiry(eid: int, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin"))):
    e = db.query(Enquiry).filter(Enquiry.id == eid).first()
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    e.is_deleted = True
    db.commit()
    return {"message": "Enquiry deleted"}


# ---------- Follow-ups ----------

@api.get("/enquiries/{eid}/followups", response_model=List[FollowUpOut])
def list_followups(eid: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(FollowUp).filter(FollowUp.enquiry_id == eid).order_by(FollowUp.date.desc(), FollowUp.id.desc()).all()
    return [
        {**FollowUpOut.model_validate(f).model_dump(), "counsellor_name": f.counsellor.full_name if f.counsellor else None}
        for f in rows
    ]


@api.post("/followups", response_model=FollowUpOut)
def create_followup(payload: FollowUpCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    data = payload.model_dump()
    if not data.get("counsellor_id"):
        data["counsellor_id"] = user.id
    f = FollowUp(**data)
    db.add(f)
    # update enquiry status & next follow-up date if provided
    e = db.query(Enquiry).filter(Enquiry.id == payload.enquiry_id).first()
    if e:
        if payload.status:
            e.status = payload.status
        if payload.next_followup_date:
            e.next_followup_date = payload.next_followup_date
    db.commit(); db.refresh(f)
    return {**FollowUpOut.model_validate(f).model_dump(), "counsellor_name": f.counsellor.full_name if f.counsellor else None}


@api.delete("/followups/{fid}")
def delete_followup(fid: int, db: Session = Depends(get_db), _: User = Depends(require_roles("admin", "super_admin", "counsellor"))):
    f = db.query(FollowUp).filter(FollowUp.id == fid).first()
    if not f:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(f); db.commit()
    return {"message": "deleted"}


# ---------- Admissions ----------

def _generate_admission_no(db: Session) -> str:
    year = datetime.now().year
    count = db.query(Admission).count() + 1
    return f"ADM-{year}-{count:04d}"


@api.get("/admissions", response_model=List[AdmissionOut])
def list_admissions(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(Admission).order_by(Admission.created_at.desc()).all()
    out = []
    for a in rows:
        d = AdmissionOut.model_validate(a).model_dump()
        d["student_name"] = a.enquiry.student_name if a.enquiry else None
        d["course_name"] = a.course.name if a.course else None
        d["batch_name"] = a.batch.name if a.batch else None
        out.append(d)
    return out


@api.post("/admissions", response_model=AdmissionOut)
def create_admission(payload: AdmissionCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("reception", "admin", "super_admin", "counsellor"))):
    e = db.query(Enquiry).filter(Enquiry.id == payload.enquiry_id, Enquiry.is_deleted == False).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    if db.query(Admission).filter(Admission.enquiry_id == e.id).first():
        raise HTTPException(status_code=400, detail="Already admitted")
    data = payload.model_dump()
    data["admission_no"] = data.get("admission_no") or _generate_admission_no(db)
    data["course_id"] = data.get("course_id") or e.course_id
    data["batch_id"] = data.get("batch_id") or e.batch_id
    a = Admission(**data, created_by_id=user.id)
    db.add(a)
    e.status = "Admitted"
    db.commit(); db.refresh(a)
    d = AdmissionOut.model_validate(a).model_dump()
    d["student_name"] = e.student_name
    d["course_name"] = a.course.name if a.course else None
    d["batch_name"] = a.batch.name if a.batch else None
    return d


# ---------- Dashboard ----------

@api.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date()
    first_of_month = today.replace(day=1)
    base = db.query(Enquiry).filter(Enquiry.is_deleted == False)
    if user.role == "counsellor":
        base = base.filter(Enquiry.counsellor_id == user.id)

    total = base.count()
    today_count = base.filter(Enquiry.enquiry_date == today).count()
    admissions_total = db.query(Admission).count()
    monthly_admissions = db.query(Admission).filter(Admission.admission_date >= first_of_month).count()
    pending_followups = base.filter(Enquiry.next_followup_date != None, Enquiry.status.notin_(["Admitted", "Cancelled", "Not Interested"])).count()
    today_followups = base.filter(Enquiry.next_followup_date == today).count()
    cancelled = base.filter(Enquiry.status.in_(["Cancelled", "Not Interested"])).count()
    interested = base.filter(Enquiry.status == "Interested").count()
    missed = base.filter(Enquiry.next_followup_date < today, Enquiry.status.notin_(["Admitted", "Cancelled", "Not Interested"])).count()
    conversion_rate = round((admissions_total / total * 100), 2) if total else 0

    return {
        "total_enquiries": total,
        "today_enquiries": today_count,
        "admissions": admissions_total,
        "monthly_admissions": monthly_admissions,
        "pending_followups": pending_followups,
        "today_followups": today_followups,
        "cancelled_leads": cancelled,
        "interested": interested,
        "missed_followups": missed,
        "conversion_rate": conversion_rate,
    }


@api.get("/dashboard/charts")
def dashboard_charts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    base = db.query(Enquiry).filter(Enquiry.is_deleted == False)
    if user.role == "counsellor":
        base = base.filter(Enquiry.counsellor_id == user.id)

    # Monthly enquiries last 6 months
    today = datetime.now(timezone.utc).date()
    months = []
    for i in range(5, -1, -1):
        y = today.year
        m = today.month - i
        while m <= 0:
            m += 12; y -= 1
        months.append((y, m))
    monthly = []
    for y, m in months:
        c = base.filter(extract("year", Enquiry.enquiry_date) == y, extract("month", Enquiry.enquiry_date) == m).count()
        monthly.append({"label": f"{y}-{m:02d}", "count": c})

    # Course-wise
    course_rows = (
        db.query(Course.name, func.count(Enquiry.id))
        .join(Enquiry, Enquiry.course_id == Course.id)
        .filter(Enquiry.is_deleted == False)
        .group_by(Course.name)
        .all()
    )
    courses = [{"label": n, "count": c} for n, c in course_rows]

    # Lead source
    ls_rows = (
        db.query(LeadSource.name, func.count(Enquiry.id))
        .join(Enquiry, Enquiry.lead_source_id == LeadSource.id)
        .filter(Enquiry.is_deleted == False)
        .group_by(LeadSource.name)
        .all()
    )
    lead_sources = [{"label": n, "count": c} for n, c in ls_rows]

    # Counsellor performance
    cs_rows = (
        db.query(User.full_name, func.count(Enquiry.id))
        .join(Enquiry, Enquiry.counsellor_id == User.id)
        .filter(Enquiry.is_deleted == False)
        .group_by(User.full_name)
        .all()
    )
    counsellors = [{"label": n, "count": c} for n, c in cs_rows]

    # Admission trend last 6 months
    trend = []
    for y, m in months:
        c = db.query(Admission).filter(extract("year", Admission.admission_date) == y, extract("month", Admission.admission_date) == m).count()
        trend.append({"label": f"{y}-{m:02d}", "count": c})

    return {
        "monthly_enquiries": monthly,
        "course_wise": courses,
        "lead_sources": lead_sources,
        "counsellor_performance": counsellors,
        "admission_trend": trend,
    }


@api.get("/dashboard/counsellor")
def counsellor_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Extra metrics for counsellor role."""
    today = datetime.now(timezone.utc).date()
    q = db.query(Enquiry).filter(Enquiry.is_deleted == False)
    if user.role == "counsellor":
        q = q.filter(Enquiry.counsellor_id == user.id)
    return {
        "today_followups": q.filter(Enquiry.next_followup_date == today).count(),
        "pending_followups": q.filter(Enquiry.next_followup_date >= today, Enquiry.status.notin_(["Admitted", "Cancelled", "Not Interested"])).count(),
        "missed_followups": q.filter(Enquiry.next_followup_date < today, Enquiry.status.notin_(["Admitted", "Cancelled", "Not Interested"])).count(),
        "interested": q.filter(Enquiry.status == "Interested").count(),
        "admissions_converted": db.query(Admission).filter(Admission.enquiry_id.in_(q.with_entities(Enquiry.id))).count() if user.role == "counsellor" else db.query(Admission).count(),
    }


# ---------- Reports ----------

@api.get("/reports/summary")
def reports_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Enquiry).filter(Enquiry.is_deleted == False)
    if start_date:
        q = q.filter(Enquiry.enquiry_date >= start_date)
    if end_date:
        q = q.filter(Enquiry.enquiry_date <= end_date)

    by_status = dict(db.query(Enquiry.status, func.count(Enquiry.id)).filter(Enquiry.is_deleted == False).group_by(Enquiry.status).all())
    by_course = [
        {"course": n, "count": c}
        for n, c in db.query(Course.name, func.count(Enquiry.id)).join(Enquiry, Enquiry.course_id == Course.id).filter(Enquiry.is_deleted == False).group_by(Course.name).all()
    ]
    by_source = [
        {"source": n, "count": c}
        for n, c in db.query(LeadSource.name, func.count(Enquiry.id)).join(Enquiry, Enquiry.lead_source_id == LeadSource.id).filter(Enquiry.is_deleted == False).group_by(LeadSource.name).all()
    ]
    by_counsellor = [
        {"counsellor": n, "count": c}
        for n, c in db.query(User.full_name, func.count(Enquiry.id)).join(Enquiry, Enquiry.counsellor_id == User.id).filter(Enquiry.is_deleted == False).group_by(User.full_name).all()
    ]
    return {
        "total": q.count(),
        "by_status": by_status,
        "by_course": by_course,
        "by_source": by_source,
        "by_counsellor": by_counsellor,
    }


@api.get("/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


app.include_router(api)


# ---------- Offline / packaged mode: serve React build ----------
try:
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    # In PyInstaller onefile, files ship under sys._MEIPASS
    import sys as _sys
    _base = Path(getattr(_sys, "_MEIPASS", str(ROOT_DIR)))
    _exec_dir = Path(_sys.executable).parent if getattr(_sys, "frozen", False) else ROOT_DIR.parent
    _static_candidates = [
        _base / "static",
        _exec_dir / "static",
        ROOT_DIR / "static",
        ROOT_DIR.parent / "static",
        ROOT_DIR.parent / "frontend" / "build",
    ]
    STATIC_DIR = next((p for p in _static_candidates if p.exists() and (p / "index.html").exists()), None)
    if STATIC_DIR is not None:
        logger.info(f"Serving frontend build from: {STATIC_DIR}")
        app.mount("/static", StaticFiles(directory=str(STATIC_DIR / "static")), name="static")

        @app.get("/{full_path:path}")
        def spa_fallback(full_path: str):
            # Never intercept API
            if full_path.startswith("api/") or full_path == "api":
                raise HTTPException(status_code=404)
            candidate = STATIC_DIR / full_path
            if full_path and candidate.exists() and candidate.is_file():
                return FileResponse(str(candidate))
            return FileResponse(str(STATIC_DIR / "index.html"))
except Exception as _e:
    logger.info(f"Static serving disabled: {_e}")


# ---------- Seeder ----------

def seed_defaults():
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_users = [
            ("superadmin@mtcedu.co.in", "Super Admin", "super_admin", "Admin@123"),
            ("admin@mtcedu.co.in", "Microtech Admin", "admin", "Admin@123"),
            ("reception@mtcedu.co.in", "Priya Reception", "reception", "Admin@123"),
            ("counsellor@mtcedu.co.in", "Rahul Counsellor", "counsellor", "Admin@123"),
            ("faculty@mtcedu.co.in", "Neha Faculty", "faculty", "Admin@123"),
        ]
        for email, name, role, pw in seed_users:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                db.add(User(email=email, full_name=name, role=role, password_hash=hash_password(pw)))
        db.commit()

        if db.query(Course).count() == 0:
            db.add_all([
                Course(name="Full Stack Web Development", code="FSWD", duration="6 months", fee=45000),
                Course(name="Data Science & AI", code="DSAI", duration="8 months", fee=65000),
                Course(name="Digital Marketing", code="DM", duration="3 months", fee=25000),
                Course(name="UI/UX Design", code="UIUX", duration="4 months", fee=35000),
                Course(name="Cloud & DevOps", code="CDVO", duration="5 months", fee=48000),
            ])
        if db.query(LeadSource).count() == 0:
            db.add_all([
                LeadSource(name="Walk-in"),
                LeadSource(name="Website"),
                LeadSource(name="Instagram"),
                LeadSource(name="Facebook"),
                LeadSource(name="Referral"),
                LeadSource(name="Newspaper"),
                LeadSource(name="Google Ads"),
            ])
        db.commit()

        if db.query(Batch).count() == 0:
            courses = db.query(Course).all()
            if courses:
                db.add_all([
                    Batch(name="Morning A", course_id=courses[0].id, timing="9:00 AM - 12:00 PM"),
                    Batch(name="Evening B", course_id=courses[1].id, timing="6:00 PM - 9:00 PM"),
                    Batch(name="Weekend C", course_id=courses[2].id, timing="Sat/Sun 10-2"),
                ])
                db.commit()

        # Sample enquiries if empty
        if db.query(Enquiry).count() == 0:
            counsellor = db.query(User).filter(User.role == "counsellor").first()
            course = db.query(Course).first()
            source = db.query(LeadSource).first()
            today = datetime.now(timezone.utc).date()
            samples = [
                ("Aarav Sharma", "9876543210", "New", today),
                ("Isha Verma", "9876500011", "Interested", today),
                ("Rohan Gupta", "9876500022", "Follow-up", today - timedelta(days=2)),
                ("Priya Kapoor", "9876500033", "Demo Scheduled", today - timedelta(days=5)),
                ("Kabir Singh", "9876500044", "New", today - timedelta(days=1)),
            ]
            for name, mob, st, ed in samples:
                db.add(Enquiry(
                    student_name=name, mobile=mob, email=f"{name.split()[0].lower()}@example.com",
                    course_id=course.id if course else None,
                    lead_source_id=source.id if source else None,
                    counsellor_id=counsellor.id if counsellor else None,
                    status=st, priority="Medium",
                    enquiry_date=ed,
                    next_followup_date=today + timedelta(days=1),
                    city="Mumbai", state="Maharashtra",
                ))
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_defaults()
    logger.info("Startup complete. Seed applied.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)