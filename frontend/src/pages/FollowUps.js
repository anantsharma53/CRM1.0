import React, { useEffect, useState } from "react";
import { Box, Card, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { statusColor } from "../utils/constants";

export default function FollowUps() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  const filters = [
    { label: "Today", key: "today" },
    { label: "Pending", key: "pending" },
    { label: "Missed", key: "missed" },
  ];

  useEffect(() => {
    setLoading(true);
    api.get("/enquiries", { params: { page_size: 200 } })
      .then((r) => {
        const key = filters[tab].key;
        const rows = r.data.items.filter((e) => {
          if (!e.next_followup_date) return false;
          if (["Admitted", "Cancelled", "Not Interested"].includes(e.status)) return false;
          if (key === "today") return e.next_followup_date === today;
          if (key === "pending") return e.next_followup_date >= today;
          if (key === "missed") return e.next_followup_date < today;
          return true;
        });
        setItems(rows);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [tab]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary">Counsellor</Typography>
        <Typography variant="h2">Follow-ups</Typography>
        <Typography variant="body2" color="text.secondary">Manage upcoming, pending, and missed follow-ups.</Typography>
      </Box>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #E2E8F0", px: 2 }} data-testid="fu-tabs">
          {filters.map((f) => <Tab key={f.key} label={f.label} />)}
        </Tabs>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell><TableCell>Mobile</TableCell><TableCell>Course</TableCell>
              <TableCell>Status</TableCell><TableCell>Next Follow-up</TableCell><TableCell>Counsellor</TableCell><TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (<TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>)}
            {!loading && items.length === 0 && (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>No follow-ups.</TableCell></TableRow>)}
            {items.map((e) => {
              const sc = statusColor(e.status);
              return (
                <TableRow key={e.id} hover data-testid={`fu-row-${e.id}`}>
                  <TableCell><Typography fontWeight={600} variant="body2">{e.student_name}</Typography></TableCell>
                  <TableCell>{e.mobile}</TableCell>
                  <TableCell>{e.course_name || "—"}</TableCell>
                  <TableCell><Chip size="small" label={e.status} sx={{ bgcolor: sc.bg, color: sc.fg }} /></TableCell>
                  <TableCell>{e.next_followup_date}</TableCell>
                  <TableCell>{e.counsellor_name || "—"}</TableCell>
                  <TableCell align="right"><Button size="small" variant="outlined" onClick={() => nav(`/enquiries/${e.id}`)}>Open</Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
