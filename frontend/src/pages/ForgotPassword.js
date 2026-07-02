import React, { useState } from "react";
import { Box, Card, Button, TextField, Typography, Alert, Stack, Link } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api, { formatApiError } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await api.post("/auth/forgot-password", { email, new_password: password });
      setMsg("Password reset. Redirecting to login...");
      setTimeout(() => nav("/login"), 1400);
    } catch (e2) {
      setErr(formatApiError(e2.response?.data?.detail));
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F4F5F7", p: 3 }}>
      <Card sx={{ p: 5, width: "100%", maxWidth: 460 }}>
        <Typography variant="overline" color="text.secondary">Reset access</Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>Forgot password</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your registered email and choose a new password.
        </Typography>
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <form onSubmit={submit}>
          <Stack spacing={2}>
            <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} slotProps={{ htmlInput: { "data-testid": "forgot-email" } }} />
            <TextField label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} slotProps={{ htmlInput: { "data-testid": "forgot-password" } }} />
            <Button type="submit" variant="contained" data-testid="forgot-submit">Reset password</Button>
          </Stack>
        </form>
        <Box sx={{ mt: 3 }}>
          <Link component={RouterLink} to="/login" underline="hover" fontSize={14}>Back to login</Link>
        </Box>
      </Card>
    </Box>
  );
}
