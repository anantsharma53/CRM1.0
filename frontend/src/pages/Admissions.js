import React, { useEffect, useState } from "react";
import { Box, Card, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import api from "../services/api";
import { downloadCSV } from "../utils/constants";

export default function Admissions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/admissions").then((r) => setRows(r.data)).finally(() => setLoading(false)); }, []);

  const exportCsv = () => {
    downloadCSV(
      rows.map((r) => ({ AdmNo: r.admission_no, Student: r.student_name, Course: r.course_name, Batch: r.batch_name, Date: r.admission_date, TotalFee: r.total_fee, FeePaid: r.fee_paid })),
      ["AdmNo", "Student", "Course", "Batch", "Date", "TotalFee", "FeePaid"], "admissions.csv");
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">Admissions</Typography>
          <Typography variant="h2">All Admissions</Typography>
          <Typography variant="body2" color="text.secondary">{rows.length} total students admitted</Typography>
        </Box>
        <Button startIcon={<DownloadIcon />} variant="outlined" onClick={exportCsv} data-testid="adm-export">Export CSV</Button>
      </Stack>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Adm No</TableCell><TableCell>Student</TableCell><TableCell>Course</TableCell>
              <TableCell>Batch</TableCell><TableCell>Date</TableCell><TableCell>Total Fee</TableCell><TableCell>Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (<TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>)}
            {!loading && rows.length === 0 && (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>No admissions yet.</TableCell></TableRow>)}
            {rows.map((a) => (
              <TableRow key={a.id} hover data-testid={`adm-row-${a.id}`}>
                <TableCell><Chip size="small" label={a.admission_no} sx={{ bgcolor: "#132A13", color: "#fff" }} /></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{a.student_name}</TableCell>
                <TableCell>{a.course_name || "—"}</TableCell>
                <TableCell>{a.batch_name || "—"}</TableCell>
                <TableCell>{a.admission_date}</TableCell>
                <TableCell>₹{Number(a.total_fee || 0).toLocaleString()}</TableCell>
                <TableCell>₹{Number(a.fee_paid || 0).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
