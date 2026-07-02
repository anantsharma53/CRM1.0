"""Pydantic schemas for request/response models."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=6)


# ---------- User ----------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    phone: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Course ----------
class CourseBase(BaseModel):
    name: str
    code: Optional[str] = None
    duration: Optional[str] = None
    fee: float = 0
    description: Optional[str] = None
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Batch ----------
class BatchBase(BaseModel):
    name: str
    course_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    timing: Optional[str] = None
    capacity: int = 30
    is_active: bool = True


class BatchCreate(BatchBase):
    pass


class BatchOut(BatchBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_name: Optional[str] = None


# ---------- LeadSource ----------
class LeadSourceBase(BaseModel):
    name: str
    is_active: bool = True


class LeadSourceCreate(LeadSourceBase):
    pass


class LeadSourceOut(LeadSourceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Enquiry ----------
class EnquiryBase(BaseModel):
    student_name: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    mobile: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    qualification: Optional[str] = None
    school_college: Optional[str] = None
    board_university: Optional[str] = None
    passing_year: Optional[str] = None
    percentage: Optional[str] = None
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    preferred_timing: Optional[str] = None
    mode: Optional[str] = None
    lead_source_id: Optional[int] = None
    reference_name: Optional[str] = None
    counsellor_id: Optional[int] = None
    enquiry_date: Optional[date] = None
    next_followup_date: Optional[date] = None
    priority: Optional[str] = "Medium"
    remarks: Optional[str] = None
    status: Optional[str] = "New"


class EnquiryCreate(EnquiryBase):
    pass


class EnquiryUpdate(EnquiryBase):
    student_name: Optional[str] = None


class EnquiryOut(EnquiryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
    course_name: Optional[str] = None
    batch_name: Optional[str] = None
    lead_source_name: Optional[str] = None
    counsellor_name: Optional[str] = None
    followup_count: int = 0


# ---------- FollowUp ----------
class FollowUpBase(BaseModel):
    date: date
    time: Optional[str] = None
    remarks: Optional[str] = None
    next_followup_date: Optional[date] = None
    communication_type: Optional[str] = None
    status: Optional[str] = None
    counsellor_id: Optional[int] = None


class FollowUpCreate(FollowUpBase):
    enquiry_id: int


class FollowUpOut(FollowUpBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    enquiry_id: int
    counsellor_name: Optional[str] = None
    created_at: datetime


# ---------- Admission ----------
class AdmissionCreate(BaseModel):
    enquiry_id: int
    admission_no: Optional[str] = None
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    fee_paid: float = 0
    total_fee: float = 0
    remarks: Optional[str] = None


class AdmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    enquiry_id: int
    admission_no: str
    admission_date: date
    course_id: Optional[int]
    batch_id: Optional[int]
    fee_paid: float
    total_fee: float
    remarks: Optional[str]
    student_name: Optional[str] = None
    course_name: Optional[str] = None
    batch_name: Optional[str] = None
    created_at: datetime


TokenResponse.model_rebuild()
