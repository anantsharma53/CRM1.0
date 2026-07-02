import React, { useEffect, useState } from "react";
import { Box, Button, Card, Grid, TextField, Typography, Stack, Chip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import api from "../services/api";
import { downloadCSV } from "../utils/constants";

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    const params = {};
    if (start) params.start_date = start;
    if (end) params.end_date = end;
    const r = await api.get("/reports/summary", { params });
    setData(r.data);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const exportRow = (name, arr) => downloadCSV(arr, Object.keys(arr[0] || { column: "" }), `${name}.csv`);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary">Analytics</Typography>
        <Typography variant="h2">Reports</Typography>
        <Typography variant="body2" color="text.secondary">Institute performance summaries.</Typography>
      </Box>

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField type="date" label="Start" value={start} onChange={(e) => setStart(e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { "data-testid": "rep-start" } }} />
          <TextField type="date" label="End" value={end} onChange={(e) => setEnd(e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { "data-testid": "rep-end" } }} />
          <Button variant="contained" onClick={load} data-testid="rep-apply">Apply</Button>
        </Stack>
      </Card>

      {data && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">Total Enquiries</Typography>
              <Typography variant="h2">{data.total}</Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Status Breakdown</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Object.entries(data.by_status).map(([k, v]) => (
                  <Chip key={k} label={`${k}: ${v}`} sx={{ mb: 1 }} />
                ))}
              </Stack>
            </Card>
          </Grid>

          <ReportSection title="By Course" rows={data.by_course} keyField="course" onExport={() => exportRow("by_course", data.by_course)} testid="rep-course" />
          <ReportSection title="By Lead Source" rows={data.by_source} keyField="source" onExport={() => exportRow("by_source", data.by_source)} testid="rep-source" />
          <ReportSection title="By Counsellor" rows={data.by_counsellor} keyField="counsellor" onExport={() => exportRow("by_counsellor", data.by_counsellor)} testid="rep-counsellor" />
        </Grid>
      )}
    </Box>
  );
}

const ReportSection = ({ title, rows, keyField, onExport, testid }) => (
  <Grid size={{ xs: 12, md: 4 }}>
    <Card sx={{ p: 3, height: "100%" }} data-testid={testid}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Button size="small" startIcon={<DownloadIcon />} onClick={onExport}>CSV</Button>
      </Stack>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No data</Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((r, i) => (
            <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #F1F3F5" }}>
              <Typography variant="body2">{r[keyField]}</Typography>
              <Typography variant="body2" fontWeight={700}>{r.count}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  </Grid>
);
