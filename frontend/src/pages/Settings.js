import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton,
  MenuItem, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import api, { formatApiError } from "../services/api";

const ROLES = ["super_admin", "admin", "reception", "counsellor", "faculty"];

export default function Settings() {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary">Configure</Typography>
        <Typography variant="h2">Settings</Typography>
      </Box>
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #E2E8F0", px: 2 }} data-testid="settings-tabs">
          <Tab label="Courses" />
          <Tab label="Batches" />
          <Tab label="Lead Sources" />
          <Tab label="Users" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tab === 0 && <CoursesTab />}
          {tab === 1 && <BatchesTab />}
          {tab === 2 && <SourcesTab />}
          {tab === 3 && <UsersTab />}
        </Box>
      </Card>
    </Box>
  );
}

function CrudTable({ title, testidPrefix, columns, rows, onNew, onEdit, onDelete }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNew} data-testid={`${testidPrefix}-add`}>New</Button>
      </Stack>
      <Table>
        <TableHead><TableRow>{columns.map((c) => <TableCell key={c.k}>{c.label}</TableCell>)}<TableCell align="right">Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {rows.length === 0 && (<TableRow><TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4, color: "text.secondary" }}>No entries</TableCell></TableRow>)}
          {rows.map((r) => (
            <TableRow key={r.id} hover data-testid={`${testidPrefix}-row-${r.id}`}>
              {columns.map((c) => <TableCell key={c.k}>{c.render ? c.render(r) : (r[c.k] ?? "—")}</TableCell>)}
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEdit(r)} data-testid={`${testidPrefix}-edit-${r.id}`}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => onDelete(r)} data-testid={`${testidPrefix}-del-${r.id}`}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function CoursesTab() {
  const [rows, setRows] = useState([]); const [open, setOpen] = useState(false); const [editing, setEditing] = useState(null);
  const empty = { name: "", code: "", duration: "", fee: 0, description: "", is_active: true };
  const [form, setForm] = useState(empty);
  const load = () => api.get("/courses").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) await api.put(`/courses/${editing.id}`, form);
    else await api.post("/courses", form);
    setOpen(false); setEditing(null); setForm(empty); load();
  };
  const del = async (r) => { if (window.confirm(`Delete ${r.name}?`)) { await api.delete(`/courses/${r.id}`); load(); } };

  return (
    <>
      <CrudTable title="Courses" testidPrefix="course" rows={rows}
        columns={[{ k: "name", label: "Name" }, { k: "code", label: "Code" }, { k: "duration", label: "Duration" }, { k: "fee", label: "Fee", render: (r) => `₹${Number(r.fee || 0).toLocaleString()}` }]}
        onNew={() => { setEditing(null); setForm(empty); setOpen(true); }}
        onEdit={(r) => { setEditing(r); setForm({ ...empty, ...r }); setOpen(true); }}
        onDelete={del}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Course" : "New Course"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} slotProps={{ htmlInput: { "data-testid": "course-name" } }} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth label="Code" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth label="Duration" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth type="number" label="Fee" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save} data-testid="course-save">Save</Button></DialogActions>
      </Dialog>
    </>
  );
}

function BatchesTab() {
  const [rows, setRows] = useState([]); const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState(null);
  const empty = { name: "", course_id: "", start_date: "", end_date: "", timing: "", capacity: 30, is_active: true };
  const [form, setForm] = useState(empty);
  const load = () => Promise.all([api.get("/batches"), api.get("/courses")]).then(([b, c]) => { setRows(b.data); setCourses(c.data); });
  useEffect(() => { load(); }, []);
  const save = async () => {
    const payload = { ...form, course_id: form.course_id ? Number(form.course_id) : null, start_date: form.start_date || null, end_date: form.end_date || null };
    if (editing) await api.put(`/batches/${editing.id}`, payload); else await api.post("/batches", payload);
    setOpen(false); setEditing(null); setForm(empty); load();
  };
  const del = async (r) => { if (window.confirm(`Delete ${r.name}?`)) { await api.delete(`/batches/${r.id}`); load(); } };
  return (
    <>
      <CrudTable title="Batches" testidPrefix="batch" rows={rows}
        columns={[{ k: "name", label: "Name" }, { k: "course_name", label: "Course" }, { k: "timing", label: "Timing" }, { k: "capacity", label: "Capacity" }]}
        onNew={() => { setEditing(null); setForm(empty); setOpen(true); }}
        onEdit={(r) => { setEditing(r); setForm({ ...empty, ...r, start_date: r.start_date || "", end_date: r.end_date || "" }); setOpen(true); }}
        onDelete={del}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Batch" : "New Batch"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField select fullWidth label="Course" value={form.course_id || ""} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <MenuItem value="">-</MenuItem>{courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="date" label="Start" slotProps={{ inputLabel: { shrink: true } }} value={form.start_date || ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="date" label="End" slotProps={{ inputLabel: { shrink: true } }} value={form.end_date || ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Grid>
            <Grid size={{ xs: 8 }}><TextField fullWidth label="Timing" value={form.timing || ""} onChange={(e) => setForm({ ...form, timing: e.target.value })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth type="number" label="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save} data-testid="batch-save">Save</Button></DialogActions>
      </Dialog>
    </>
  );
}

function SourcesTab() {
  const [rows, setRows] = useState([]); const [open, setOpen] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", is_active: true });
  const load = () => api.get("/lead-sources").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (editing) await api.put(`/lead-sources/${editing.id}`, form); else await api.post("/lead-sources", form);
    setOpen(false); setEditing(null); setForm({ name: "", is_active: true }); load();
  };
  const del = async (r) => { if (window.confirm(`Delete ${r.name}?`)) { await api.delete(`/lead-sources/${r.id}`); load(); } };
  return (
    <>
      <CrudTable title="Lead Sources" testidPrefix="src" rows={rows}
        columns={[{ k: "name", label: "Name" }, { k: "is_active", label: "Active", render: (r) => (<Chip size="small" label={r.is_active ? "Active" : "Inactive"} color={r.is_active ? "success" : "default"} />) }]}
        onNew={() => { setEditing(null); setForm({ name: "", is_active: true }); setOpen(true); }}
        onEdit={(r) => { setEditing(r); setForm({ name: r.name, is_active: r.is_active }); setOpen(true); }}
        onDelete={del}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit Source" : "New Source"}</DialogTitle>
        <DialogContent><TextField fullWidth label="Name" sx={{ mt: 1 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
    </>
  );
}

function UsersTab() {
  const [rows, setRows] = useState([]); const [open, setOpen] = useState(false); const [editing, setEditing] = useState(null); const [err, setErr] = useState("");
  const empty = { email: "", full_name: "", role: "reception", phone: "", is_active: true, password: "" };
  const [form, setForm] = useState(empty);
  const load = () => api.get("/users").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    setErr("");
    try {
      if (editing) await api.put(`/users/${editing.id}`, form); else await api.post("/users", form);
      setOpen(false); setEditing(null); setForm(empty); load();
    } catch (e) { setErr(formatApiError(e.response?.data?.detail)); }
  };
  const del = async (r) => { if (window.confirm(`Delete ${r.full_name}?`)) { await api.delete(`/users/${r.id}`); load(); } };
  return (
    <>
      <CrudTable title="Users" testidPrefix="user" rows={rows}
        columns={[{ k: "full_name", label: "Name" }, { k: "email", label: "Email" }, { k: "role", label: "Role", render: (r) => <Chip size="small" label={r.role} /> }, { k: "phone", label: "Phone" }]}
        onNew={() => { setEditing(null); setForm(empty); setOpen(true); }}
        onEdit={(r) => { setEditing(r); setForm({ ...empty, ...r, password: "" }); setOpen(true); }}
        onDelete={del}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit User" : "New User"}</DialogTitle>
        <DialogContent>
          {err && <Typography color="error" variant="body2" sx={{ mb: 1 }}>{err}</Typography>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editing} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField select fullWidth label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth type="password" label={editing ? "New password (leave blank to keep)" : "Password"} value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save} data-testid="user-save">Save</Button></DialogActions>
      </Dialog>
    </>
  );
}
