import React, { useState } from "react";
import { Box, Button, Card, TextField, Typography, Alert, Stack, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("admin@mtcedu.co.in");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" }, bgcolor: "#F4F5F7" }}>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          backgroundImage: "url(https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwYXJjaGl0ZWN0dXJlJTIwYnVpbGRpbmd8ZW58MHx8fHwxNzgyODg5NTY5fDA&ixlib=rb-4.1.0&q=85)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(11,16,14,0.55)" }} />
        <Box sx={{ position: "relative", p: 6, color: "#fff", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 90, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/brand/microtech-logo-tight.png" alt="Microtech" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Microtech<span style={{ color: "#D26B58" }}> Computers</span></Typography>
          </Box>
          <Box>
            <Typography variant="h2" sx={{ mb: 2, letterSpacing: "-0.02em" }}>Where enquiries<br/>become admissions.</Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 460 }}>
              A modern lead management workspace for Microtech Computers — reception, counsellors, and admins in one place.
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            mtcedu.co.in · Institute Enquiry System
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, md: 6 } }}>
        <Card sx={{ p: { xs: 3, md: 5 }, width: "100%", maxWidth: 460 }}>
          <Typography variant="overline" color="text.secondary">Welcome back</Typography>
          <Typography variant="h3" sx={{ mb: 1 }}>Sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your Microtech Computers credentials to continue.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }} data-testid="login-error">{error}</Alert>}
          <form onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                slotProps={{ htmlInput: { "data-testid": "login-email-input" } }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                slotProps={{ htmlInput: { "data-testid": "login-password-input" } }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                fullWidth
                data-testid="login-submit-button"
                sx={{ py: 1.4 }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </form>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Link component={RouterLink} to="/forgot-password" underline="hover" fontSize={14} data-testid="login-forgot-link">Forgot password?</Link>
            <Typography variant="caption" color="text.secondary">v1.0</Typography>
          </Box>
          <Box sx={{ mt: 4, p: 2, bgcolor: "#F8F9FA", borderRadius: 1, border: "1px solid #E2E8F0" }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.08em" }}>DEMO ACCOUNTS · pw: Admin@123</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5, mt: 1, fontSize: 12 }}>
              <span>superadmin@mtcedu.co.in</span><span style={{ color: "#5C6B64" }}>Super Admin</span>
              <span>admin@mtcedu.co.in</span><span style={{ color: "#5C6B64" }}>Admin</span>
              <span>reception@mtcedu.co.in</span><span style={{ color: "#5C6B64" }}>Reception</span>
              <span>counsellor@mtcedu.co.in</span><span style={{ color: "#5C6B64" }}>Counsellor</span>
              <span>faculty@mtcedu.co.in</span><span style={{ color: "#5C6B64" }}>Faculty</span>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
