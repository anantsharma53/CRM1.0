import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, Chip, Grid, MenuItem, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SchoolIcon from "@mui/icons-material/School";
import PrintIcon from "@mui/icons-material/Print";
import api, { formatApiError } from "../services/api";
import { STATUS_OPTIONS, COMM_TYPES, statusColor, priorityColor } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

const Kv = ({ k, v }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>{v || "—"}</Typography>
  </Box>
);

export default function EnquiryDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hasRole, user } = useAuth();
  const [e, setE] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [open, setOpen] = useState(false);
  const [admOpen, setAdmOpen] = useState(false);
  const [err, setErr] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [fu, setFu] = useState({ date: today, time: "", remarks: "", next_followup_date: "", communication_type: "Call", status: "" });
  const [adm, setAdm] = useState({ admission_no: "", fee_paid: 0, total_fee: 0, remarks: "" });

  const load = async () => {
    const [er, fr] = await Promise.all([api.get(`/enquiries/${id}`), api.get(`/enquiries/${id}/followups`)]);
    setE(er.data); setFollowups(fr.data);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const addFollowup = async () => {
    setErr("");
    try {
      const payload = { ...fu, enquiry_id: Number(id) };
      Object.keys(payload).forEach((k) => payload[k] === "" && (payload[k] = null));
      await api.post("/followups", payload);
      setOpen(false); setFu({ date: today, time: "", remarks: "", next_followup_date: "", communication_type: "Call", status: "" });
      await load();
    } catch (ex) { setErr(formatApiError(ex.response?.data?.detail)); }
  };

  const convertAdmission = async () => {
    setErr("");
    try {
      await api.post("/admissions", { enquiry_id: Number(id), ...adm });
      setAdmOpen(false); await load();
    } catch (ex) { setErr(formatApiError(ex.response?.data?.detail)); }
  };

  if (!e) return <Typography>Loading...</Typography>;
  const sc = statusColor(e.status); const pc = priorityColor(e.priority);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">Enquiry #{e.id}</Typography>
          <Typography variant="h2">{e.student_name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip size="small" label={e.status} sx={{ bgcolor: sc.bg, color: sc.fg }} />
            <Chip size="small" label={`${e.priority} priority`} sx={{ bgcolor: pc.bg, color: pc.fg }} />
            {e.course_name && <Chip size="small" label={e.course_name} variant="outlined" />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => nav(`/enquiries/${e.id}/receipt`)} data-testid="detail-receipt-btn">Print Receipt</Button>
          {hasRole("reception", "admin", "counsellor") && (
            <Button startIcon={<EditIcon />} variant="outlined" onClick={() => nav(`/enquiries/${e.id}/edit`)} data-testid="detail-edit-btn">Edit</Button>
          )}
          {e.status !== "Admitted" && hasRole("reception", "admin", "counsellor") && (
            <Button startIcon={<SchoolIcon />} variant="contained" color="secondary" onClick={() => setAdmOpen(true)} data-testid="detail-convert-btn">
              Convert to Admission
            </Button>
          )}
        </Stack>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Personal & Contact</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Father" v={e.father_name} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Mother" v={e.mother_name} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Gender" v={e.gender} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="DOB" v={e.dob} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Mobile" v={e.mobile} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="WhatsApp" v={e.whatsapp} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><Kv k="Email" v={e.email} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><Kv k="Address" v={`${e.address || ""} ${e.city || ""} ${e.state || ""} ${e.pincode || ""}`.trim()} /></Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>Academic & Course</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Qualification" v={e.qualification} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="School/College" v={e.school_college} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Board" v={e.board_university} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Passing Year" v={e.passing_year} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Percentage" v={e.percentage} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Course" v={e.course_name} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Batch" v={e.batch_name} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Mode" v={e.mode} /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><Kv k="Preferred Timing" v={e.preferred_timing} /></Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>Remarks</Typography>
            <Typography variant="body2" color="text.secondary">{e.remarks || "No remarks."}</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="overline" color="secondary" fontWeight={700}>Lead & Assignment</Typography>
            <Box sx={{ mt: 2 }}>
              <Kv k="Lead Source" v={e.lead_source_name} />
              <Kv k="Reference" v={e.reference_name} />
              <Kv k="Counsellor" v={e.counsellor_name} />
              <Kv k="Enquiry Date" v={e.enquiry_date} />
              <Kv k="Next Follow-up" v={e.next_followup_date} />
              <Kv k="Total Follow-ups" v={String(e.followup_count)} />
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0" }}>
              <Box>
                <Typography variant="h5">Follow-up History</Typography>
                <Typography variant="body2" color="text.secondary">{followups.length} entries</Typography>
              </Box>
              <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpen(true)} data-testid="detail-add-followup">Add Follow-up</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell><TableCell>Time</TableCell><TableCell>Type</TableCell>
                  <TableCell>Status</TableCell><TableCell>Remarks</TableCell><TableCell>Next</TableCell><TableCell>Counsellor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {followups.length === 0 && (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No follow-ups yet.</TableCell></TableRow>)}
                {followups.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.date}</TableCell>
                    <TableCell>{f.time || "—"}</TableCell>
                    <TableCell>{f.communication_type || "—"}</TableCell>
                    <TableCell>{f.status ? <Chip size="small" label={f.status} sx={{ bgcolor: statusColor(f.status).bg, color: statusColor(f.status).fg }} /> : "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>{f.remarks || "—"}</TableCell>
                    <TableCell>{f.next_followup_date || "—"}</TableCell>
                    <TableCell>{f.counsellor_name || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Follow-up</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="date" label="Date" value={fu.date} onChange={(e) => setFu({ ...fu, date: e.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { "data-testid": "fu-date" } }} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="time" label="Time" slotProps={{ inputLabel: { shrink: true } }} value={fu.time} onChange={(e) => setFu({ ...fu, time: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField select fullWidth label="Type" value={fu.communication_type} onChange={(e) => setFu({ ...fu, communication_type: e.target.value })}>
              {COMM_TYPES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 6 }}><TextField select fullWidth label="Update Status" value={fu.status} onChange={(e) => setFu({ ...fu, status: e.target.value })} slotProps={{ htmlInput: { "data-testid": "fu-status" } }}>
              <MenuItem value="">Keep current</MenuItem>{STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={3} label="Remarks" value={fu.remarks} onChange={(e) => setFu({ ...fu, remarks: e.target.value })} slotProps={{ htmlInput: { "data-testid": "fu-remarks" } }} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth type="date" label="Next Follow-up" slotProps={{ inputLabel: { shrink: true } }} value={fu.next_followup_date} onChange={(e) => setFu({ ...fu, next_followup_date: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addFollowup} data-testid="fu-save">Save Follow-up</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={admOpen} onClose={() => setAdmOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Convert to Admission</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>Student details will be preserved and enquiry marked as Admitted.</Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Admission Number (optional, auto)" value={adm.admission_no} onChange={(e) => setAdm({ ...adm, admission_no: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="number" label="Total Fee" value={adm.total_fee} onChange={(e) => setAdm({ ...adm, total_fee: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="number" label="Fee Paid" value={adm.fee_paid} onChange={(e) => setAdm({ ...adm, fee_paid: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="Remarks" value={adm.remarks} onChange={(e) => setAdm({ ...adm, remarks: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={convertAdmission} data-testid="adm-save">Confirm Admission</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
