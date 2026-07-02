import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, Chip, IconButton, MenuItem, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, TablePagination, InputAdornment, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { STATUS_OPTIONS, statusColor, priorityColor, downloadCSV } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

export default function EnquiryList() {
  const nav = useNavigate();
  const { hasRole } = useAuth();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, page_size: pageSize };
      if (q) params.search = q;
      if (statusF) params.status = statusF;
      const r = await api.get("/enquiries", { params });
      setData(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, pageSize, statusF]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); load(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  const remove = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    await api.delete(`/enquiries/${id}`);
    load();
  };

  const exportCsv = () => {
    const rows = data.items.map((e) => ({
      ID: e.id, Student: e.student_name, Mobile: e.mobile, Email: e.email,
      Course: e.course_name, Counsellor: e.counsellor_name, Status: e.status,
      Priority: e.priority, EnquiryDate: e.enquiry_date, NextFollowUp: e.next_followup_date,
    }));
    downloadCSV(rows, ["ID", "Student", "Mobile", "Email", "Course", "Counsellor", "Status", "Priority", "EnquiryDate", "NextFollowUp"], "enquiries.csv");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">Manage</Typography>
          <Typography variant="h2">Enquiries</Typography>
          <Typography variant="body2" color="text.secondary">{data.total} total records</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button startIcon={<DownloadIcon />} variant="outlined" onClick={exportCsv} data-testid="enq-export-csv">Export CSV</Button>
          <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => window.print()} data-testid="enq-print">Print</Button>
          {hasRole("reception", "admin", "counsellor") && (
            <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={() => nav("/enquiries/new")} data-testid="enq-new-btn">
              New Enquiry
            </Button>
          )}
        </Stack>
      </Box>

      <Card>
        <Box sx={{ p: 2.5, borderBottom: "1px solid #E2E8F0", display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by name, mobile, email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            size="small"
            sx={{ minWidth: 320 }}
            slotProps={{ htmlInput: { "data-testid": "enq-search-input" } }}
          />
          <TextField
            select label="Status" size="small" value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            sx={{ minWidth: 200 }}
            slotProps={{ htmlInput: { "data-testid": "enq-status-filter" } }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Counsellor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Follow-up</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (<TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>)}
            {!loading && data.items.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                <Typography color="text.secondary">No enquiries found</Typography>
              </TableCell></TableRow>
            )}
            {data.items.map((e) => {
              const sc = statusColor(e.status); const pc = priorityColor(e.priority);
              return (
                <TableRow key={e.id} hover data-testid={`enq-row-${e.id}`}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{e.student_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{e.email || "—"}</Typography>
                  </TableCell>
                  <TableCell>{e.mobile || "—"}</TableCell>
                  <TableCell>{e.course_name || "—"}</TableCell>
                  <TableCell>{e.counsellor_name || "—"}</TableCell>
                  <TableCell><Chip size="small" label={e.status} sx={{ bgcolor: sc.bg, color: sc.fg }} /></TableCell>
                  <TableCell><Chip size="small" label={e.priority} sx={{ bgcolor: pc.bg, color: pc.fg }} /></TableCell>
                  <TableCell>{e.next_followup_date || "—"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View"><IconButton size="small" onClick={() => nav(`/enquiries/${e.id}`)} data-testid={`enq-view-${e.id}`}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    {hasRole("reception", "admin", "counsellor") && (
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => nav(`/enquiries/${e.id}/edit`)} data-testid={`enq-edit-${e.id}`}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                    {hasRole("admin") && (
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => remove(e.id)} data-testid={`enq-del-${e.id}`}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          data-testid="enq-pagination"
        />
      </Card>
    </Box>
  );
}
