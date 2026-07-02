"""SQLAlchemy ORM models for the Institute Enquiry CRM."""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime, ForeignKey,
    Boolean, Float, Index
)
from sqlalchemy.orm import relationship

from database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(30), nullable=False)  # super_admin, admin, reception, counsellor, faculty
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False)
    code = Column(String(30))
    duration = Column(String(50))
    fee = Column(Float, default=0)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    timing = Column(String(80))
    capacity = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    course = relationship("Course")


class LeadSource(Base):
    __tablename__ = "lead_sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class Enquiry(Base):
    __tablename__ = "enquiries"
    id = Column(Integer, primary_key=True, index=True)
    # Personal
    student_name = Column(String(120), nullable=False, index=True)
    father_name = Column(String(120))
    mother_name = Column(String(120))
    gender = Column(String(10))
    dob = Column(Date)
    mobile = Column(String(20), index=True)
    whatsapp = Column(String(20))
    email = Column(String(120), index=True)
    address = Column(Text)
    city = Column(String(60))
    state = Column(String(60))
    pincode = Column(String(15))
    # Academic
    qualification = Column(String(60))
    school_college = Column(String(120))
    board_university = Column(String(120))
    passing_year = Column(String(10))
    percentage = Column(String(20))
    # Course
    course_id = Column(Integer, ForeignKey("courses.id"))
    batch_id = Column(Integer, ForeignKey("batches.id"))
    preferred_timing = Column(String(60))
    mode = Column(String(20))  # Offline/Online/Hybrid
    # Lead
    lead_source_id = Column(Integer, ForeignKey("lead_sources.id"))
    reference_name = Column(String(120))
    # Counselling
    counsellor_id = Column(Integer, ForeignKey("users.id"))
    enquiry_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    next_followup_date = Column(Date)
    priority = Column(String(10), default="Medium")  # High/Medium/Low
    remarks = Column(Text)
    # Uploads (filenames)
    photo = Column(String(255))
    aadhaar = Column(String(255))
    marksheet = Column(String(255))
    # Status
    status = Column(String(30), default="New", index=True)
    # Meta
    created_by_id = Column(Integer, ForeignKey("users.id"))
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    course = relationship("Course", foreign_keys=[course_id])
    batch = relationship("Batch", foreign_keys=[batch_id])
    lead_source = relationship("LeadSource", foreign_keys=[lead_source_id])
    counsellor = relationship("User", foreign_keys=[counsellor_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    followups = relationship("FollowUp", back_populates="enquiry", cascade="all, delete-orphan")


class FollowUp(Base):
    __tablename__ = "followups"
    id = Column(Integer, primary_key=True, index=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    time = Column(String(10))
    remarks = Column(Text)
    next_followup_date = Column(Date)
    communication_type = Column(String(30))  # Call, WhatsApp, Email, Visit, SMS
    status = Column(String(30))
    counsellor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utc_now)

    enquiry = relationship("Enquiry", back_populates="followups")
    counsellor = relationship("User")


class Admission(Base):
    __tablename__ = "admissions"
    id = Column(Integer, primary_key=True, index=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id"), unique=True, nullable=False)
    admission_no = Column(String(30), unique=True, nullable=False)
    admission_date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    course_id = Column(Integer, ForeignKey("courses.id"))
    batch_id = Column(Integer, ForeignKey("batches.id"))
    fee_paid = Column(Float, default=0)
    total_fee = Column(Float, default=0)
    remarks = Column(Text)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utc_now)

    enquiry = relationship("Enquiry")
    course = relationship("Course")
    batch = relationship("Batch")
    created_by = relationship("User")


Index("ix_enquiries_status_deleted", Enquiry.status, Enquiry.is_deleted)
