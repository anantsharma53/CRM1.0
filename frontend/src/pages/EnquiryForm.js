import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, Grid, MenuItem, TextField, Typography, Stack, Alert, Divider, Chip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api, { formatApiError } from "../services/api";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, MODE_OPTIONS, GENDER_OPTIONS } from "../utils/constants";

const empty = {
  student_name: "", father_name: "", mother_name: "", gender: "", dob: "",
  mobile: "", whatsapp: "", email: "", address: "", city: "", state: "", pincode: "",
  qualification: "", school_college: "", board_university: "", passing_year: "", percentage: "",
  course_id: "", batch_id: "", preferred_timing: "", mode: "",
  lead_source_id: "", reference_name: "",
  counsellor_id: "", enquiry_date: "", next_followup_date: "", priority: "Medium",
  remarks: "", status: "New",
};

const SectionTitle = ({ children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="overline" color="secondary" sx={{ fontWeight: 700 }}>{children}</Typography>
    <Divider sx={{ mt: 0.5 }} />
  </Box>
);

export default function EnquiryForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [dupWarn, setDupWarn] = useState("");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sources, setSources] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/courses"), api.get("/batches"), api.get("/lead-sources"), api.get("/users/counsellors"),
    ]).then(([c, b, s, u]) => {
      setCourses(c.data); setBatches(b.data); setSources(s.data); setCounsellors(u.data);
    });
    if (editing) {
      api.get(`/enquiries/${id}`).then((r) => {
        const d = r.data;
        setForm({ ...empty, ...Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v ?? ""])) });
      });
    }
  }, [id, editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const checkMobile = async () => {
    if (!form.mobile || editing) return;
    try {
      const r = await api.get("/enquiries/check-mobile", { params: { mobile: form.mobile } });
      if (r.data.duplicate) setDupWarn(`A previous enquiry exists with this mobile (ID #${r.data.enquiry_id}).`);
      else setDupWarn("");
    } catch { /* ignore */ }
  };

  const submit = async (e) => {
    e.preventDefault(); setError(""); setSaving(true);
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])
    );
    try {
      if (editing) {
        await api.put(`/enquiries/${id}`, payload);
        nav("/enquiries");
      } else {
        const r = await api.post("/enquiries", payload);
        // Take receptionist straight to the printable receipt
        nav(`/enquiries/${r.data.id}/receipt`);
      }
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally { setSaving(false); }
  };

  const filteredBatches = form.course_id ? batches.filter((b) => b.course_id === Number(form.course_id)) : batches;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary">Reception</Typography>
        <Typography variant="h2">{editing ? "Edit Enquiry" : "Register New Enquiry"}</Typography>
        <Typography variant="body2" color="text.secondary">Capture student details for counselling & admissions</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} data-testid="enq-form-error">{error}</Alert>}
      {dupWarn && <Alert severity="warning" sx={{ mb: 2 }} data-testid="enq-form-dup-warn">{dupWarn}</Alert>}

      <form onSubmit={submit}>
        <Card sx={{ p: 3, mb: 3 }}>
          <SectionTitle>Personal Details</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth required label="Student Name" value={form.student_name} onChange={set("student_name")} slotProps={{ htmlInput: { "data-testid": "enq-form-student-name" } }} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Father's Name" value={form.father_name} onChange={set("father_name")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Mother's Name" value={form.mother_name} onChange={set("mother_name")} /></Grid>
            <Grid size={{ xs: 12, md: 3 }}><TextField select fullWidth label="Gender" value={form.gender} onChange={set("gender")}>
              <MenuItem value="">-</MenuItem>{GENDER_OPTIONS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth type="date" label="Date of Birth" slotProps={{ inputLabel: { shrink: true }, htmlInput: { "data-testid": "enq-form-dob" } }} value={form.dob || ""} onChange={set("dob")} /></Grid>
            <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth label="Mobile" value={form.mobile} onChange={set("mobile")} onBlur={checkMobile} slotProps={{ htmlInput: { "data-testid": "enq-form-mobile" } }} /></Grid>
            <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" type="email" value={form.email} onChange={set("email")} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Address" value={form.address} onChange={set("address")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="City" value={form.city} onChange={set("city")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="State" value={form.state} onChange={set("state")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="PIN Code" value={form.pincode} onChange={set("pincode")} /></Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <SectionTitle>Academic Details</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Qualification" value={form.qualification} onChange={set("qualification")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="School / College" value={form.school_college} onChange={set("school_college")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Board / University" value={form.board_university} onChange={set("board_university")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Passing Year" value={form.passing_year} onChange={set("passing_year")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Percentage / CGPA" value={form.percentage} onChange={set("percentage")} /></Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <SectionTitle>Course Interest</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Interested Course" value={form.course_id || ""} onChange={set("course_id")} slotProps={{ htmlInput: { "data-testid": "enq-form-course" } }}>
              <MenuItem value="">-</MenuItem>{courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Batch" value={form.batch_id || ""} onChange={set("batch_id")}>
              <MenuItem value="">-</MenuItem>{filteredBatches.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Preferred Timing" value={form.preferred_timing} onChange={set("preferred_timing")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Mode" value={form.mode} onChange={set("mode")}>
              <MenuItem value="">-</MenuItem>{MODE_OPTIONS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField></Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <SectionTitle>Lead & Counselling</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Lead Source" value={form.lead_source_id || ""} onChange={set("lead_source_id")}>
              <MenuItem value="">-</MenuItem>{sources.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Reference Name" value={form.reference_name} onChange={set("reference_name")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Assigned Counsellor" value={form.counsellor_id || ""} onChange={set("counsellor_id")}>
              <MenuItem value="">-</MenuItem>{counsellors.map((c) => <MenuItem key={c.id} value={c.id}>{c.full_name}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="date" label="Enquiry Date" slotProps={{ inputLabel: { shrink: true } }} value={form.enquiry_date || ""} onChange={set("enquiry_date")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="date" label="Next Follow-up" slotProps={{ inputLabel: { shrink: true } }} value={form.next_followup_date || ""} onChange={set("next_followup_date")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Priority" value={form.priority || "Medium"} onChange={set("priority")}>
              {PRIORITY_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Status" value={form.status || "New"} onChange={set("status")} slotProps={{ htmlInput: { "data-testid": "enq-form-status" } }}>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={3} label="Remarks" value={form.remarks} onChange={set("remarks")} /></Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => nav("/enquiries")} data-testid="enq-form-cancel">Cancel</Button>
          <Button variant="contained" type="submit" disabled={saving} data-testid="enq-form-submit">
            {saving ? "Saving..." : (editing ? "Update Enquiry" : "Save Enquiry")}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
