import React, { useEffect, useState } from "react";
import { Box, Card, Grid, Typography, Chip, LinearProgress } from "@mui/material";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, LineElement, PointElement, Tooltip, Legend, Title,
} from "chart.js";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EventIcon from "@mui/icons-material/Event";
import CancelIcon from "@mui/icons-material/Cancel";
import PercentIcon from "@mui/icons-material/Percent";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import api from "../services/api";
import { CHART_COLORS } from "../theme";
import { useAuth } from "../context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Title);

const StatCard = ({ icon, label, value, sub, color = "#132A13", testid }) => (
  <Card sx={{ p: 3, height: "100%" }} data-testid={testid}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 0.5, color }}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
    </Box>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/dashboard/stats"), api.get("/dashboard/charts")])
      .then(([s, c]) => { setStats(s.data); setCharts(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;
  if (!stats || !charts) return <Typography>Failed to load dashboard.</Typography>;

  const monthlyData = {
    labels: charts.monthly_enquiries.map((m) => m.label),
    datasets: [{
      label: "Enquiries",
      data: charts.monthly_enquiries.map((m) => m.count),
      backgroundColor: CHART_COLORS[0],
      borderRadius: 6,
    }],
  };
  const trendData = {
    labels: charts.admission_trend.map((m) => m.label),
    datasets: [{
      label: "Admissions",
      data: charts.admission_trend.map((m) => m.count),
      borderColor: CHART_COLORS[1],
      backgroundColor: "rgba(166,66,47,0.12)",
      tension: 0.35, fill: true, pointRadius: 4,
    }],
  };
  const courseData = {
    labels: charts.course_wise.map((c) => c.label),
    datasets: [{ data: charts.course_wise.map((c) => c.count), backgroundColor: CHART_COLORS }],
  };
  const sourceData = {
    labels: charts.lead_sources.map((c) => c.label),
    datasets: [{ data: charts.lead_sources.map((c) => c.count), backgroundColor: CHART_COLORS }],
  };
  const counsellorData = {
    labels: charts.counsellor_performance.map((c) => c.label),
    datasets: [{
      label: "Enquiries",
      data: charts.counsellor_performance.map((c) => c.count),
      backgroundColor: CHART_COLORS[2], borderRadius: 6,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 16, font: { family: "'Outfit', sans-serif" } } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#E2E8F0" }, beginAtZero: true, ticks: { precision: 0 } } },
  };
  const pieOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { usePointStyle: true, padding: 12, font: { family: "'Outfit', sans-serif" } } } } };

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">Overview</Typography>
          <Typography variant="h2">Welcome back, {user?.full_name?.split(" ")[0]}.</Typography>
        </Box>
        <Chip label={`Conversion ${stats.conversion_rate}%`} color="primary" sx={{ alignSelf: "center", px: 1, height: 32 }} data-testid="dash-conversion-chip" />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-total" icon={<PeopleIcon />} label="Total Enquiries" value={stats.total_enquiries} sub={`${stats.today_enquiries} today`} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-admissions" icon={<SchoolIcon />} label="Admissions" value={stats.admissions} sub={`${stats.monthly_admissions} this month`} color="#A6422F" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-pending" icon={<PendingActionsIcon />} label="Pending Follow-ups" value={stats.pending_followups} sub={`${stats.today_followups} due today`} color="#D97736" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-conversion" icon={<PercentIcon />} label="Conversion Rate" value={`${stats.conversion_rate}%`} sub="enquiry → admission" color="#4F772D" /></Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-interested" icon={<TrendingUpIcon />} label="Interested" value={stats.interested} color="#4A6FA5" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-today-followups" icon={<EventIcon />} label="Today's Follow-ups" value={stats.today_followups} color="#132A13" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-missed" icon={<HourglassBottomIcon />} label="Missed Follow-ups" value={stats.missed_followups} color="#9E2A2B" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard testid="stat-cancelled" icon={<CancelIcon />} label="Cancelled Leads" value={stats.cancelled_leads} color="#5C6B64" /></Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, height: 360 }} data-testid="chart-monthly-enquiries">
            <Typography variant="h5" sx={{ mb: 2 }}>Monthly Enquiries</Typography>
            <Box sx={{ height: 280 }}><Bar data={monthlyData} options={chartOpts} /></Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, height: 360 }} data-testid="chart-lead-source">
            <Typography variant="h5" sx={{ mb: 2 }}>Lead Source</Typography>
            <Box sx={{ height: 280 }}>{sourceData.labels.length ? <Doughnut data={sourceData} options={pieOpts} /> : <Empty text="No data" />}</Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 340 }} data-testid="chart-course-wise">
            <Typography variant="h5" sx={{ mb: 2 }}>Course-wise Enquiries</Typography>
            <Box sx={{ height: 260 }}>{courseData.labels.length ? <Pie data={courseData} options={pieOpts} /> : <Empty text="No data" />}</Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 340 }} data-testid="chart-counsellor-perf">
            <Typography variant="h5" sx={{ mb: 2 }}>Counsellor Performance</Typography>
            <Box sx={{ height: 260 }}>{counsellorData.labels.length ? <Bar data={counsellorData} options={chartOpts} /> : <Empty text="No data" />}</Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, height: 320 }} data-testid="chart-admission-trend">
            <Typography variant="h5" sx={{ mb: 2 }}>Admission Trend</Typography>
            <Box sx={{ height: 240 }}><Line data={trendData} options={chartOpts} /></Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

const Empty = ({ text }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "text.secondary" }}>{text}</Box>
);
