import React, { useState } from "react";
import { Box, Card, Button, TextField, Typography, Alert, Stack } from "@mui/material";
import api, { formatApiError } from "../services/api";

export default function ChangePassword() {
  const [oldPw, setOld] = useState("");
  const [newPw, setNew] = useState("");
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setMsg("");
    try {
      await api.post("/auth/change-password", { old_password: oldPw, new_password: newPw });
      setMsg("Password updated");
      setOld(""); setNew("");
    } catch (e2) {
      setErr(formatApiError(e2.response?.data?.detail));
    }
  };

  return (
    <Box sx={{ maxWidth: 520 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>Change Password</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Update your account password.</Typography>
      <Card sx={{ p: 4 }}>
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <form onSubmit={submit}>
          <Stack spacing={2}>
            <TextField label="Current password" type="password" required value={oldPw} onChange={(e) => setOld(e.target.value)} slotProps={{ htmlInput: { "data-testid": "cp-old" } }} />
            <TextField label="New password" type="password" required value={newPw} onChange={(e) => setNew(e.target.value)} slotProps={{ htmlInput: { "data-testid": "cp-new" } }} />
            <Button type="submit" variant="contained" data-testid="cp-submit">Update password</Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
