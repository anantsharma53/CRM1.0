import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar, Box, Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, Avatar, Menu, MenuItem,
  Divider, Chip, useMediaQuery, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PasswordIcon from "@mui/icons-material/Password";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 248;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon />, roles: ["super_admin", "admin", "reception", "counsellor", "faculty"], testid: "sidebar-nav-dashboard" },
  { label: "New Enquiry", path: "/enquiries/new", icon: <PersonAddIcon />, roles: ["super_admin", "admin", "reception", "counsellor"], testid: "sidebar-nav-new-enquiry" },
  { label: "Enquiries", path: "/enquiries", icon: <ListAltIcon />, roles: ["super_admin", "admin", "reception", "counsellor", "faculty"], testid: "sidebar-nav-enquiries" },
  { label: "Follow-ups", path: "/followups", icon: <EventNoteIcon />, roles: ["super_admin", "admin", "counsellor"], testid: "sidebar-nav-followups" },
  { label: "Admissions", path: "/admissions", icon: <SchoolIcon />, roles: ["super_admin", "admin", "reception", "counsellor", "faculty"], testid: "sidebar-nav-admissions" },
  { label: "Reports", path: "/reports", icon: <AssessmentIcon />, roles: ["super_admin", "admin", "counsellor"], testid: "sidebar-nav-reports" },
  { label: "Settings", path: "/settings", icon: <SettingsIcon />, roles: ["super_admin", "admin"], testid: "sidebar-nav-settings" },
];

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, hasRole } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const items = navItems.filter((i) => hasRole(...i.roles));

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #1E2A24", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src="/brand/microtech-logo-tight.png" alt="Microtech" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.1, fontSize: "1.05rem" }} data-testid="sidebar-brand">
            Microtech Computers
          </Typography>
          <Typography variant="caption" sx={{ color: "#A0AAB2", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem" }}>
            mtcedu.co.in
          </Typography>
        </Box>
      </Box>
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {items.map((item) => {
          const active = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                data-testid={item.testid}
                onClick={() => { nav(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 1.5,
                  color: active ? "#fff" : "#A0AAB2",
                  bgcolor: active ? "rgba(166, 66, 47, 0.15)" : "transparent",
                  borderLeft: active ? "3px solid #A6422F" : "3px solid transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" },
                  py: 1.1,
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { fontWeight: 500, fontSize: "0.92rem" } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2, borderTop: "1px solid #1E2A24" }}>
        <Typography variant="caption" sx={{ color: "#5C6B64" }}>© {new Date().getFullYear()} Microtech Computers · mtcedu.co.in</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "#FFFFFF",
          color: "#121212",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2, display: { md: "none" } }} onClick={() => setMobileOpen(true)} data-testid="menu-open-btn">
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {items.find((i) => location.pathname.startsWith(i.path))?.label || "Dashboard"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={user?.role?.replace("_", " ").toUpperCase()}
            sx={{ mr: 2, bgcolor: "#132A13", color: "#fff" }}
            data-testid="topbar-role-chip"
          />
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} data-testid="topbar-avatar-btn">
              <Avatar sx={{ bgcolor: "#A6422F", width: 34, height: 34, fontSize: 14 }}>
                {user?.full_name?.[0] || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" fontWeight={600}>{user?.full_name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); nav("/change-password"); }} data-testid="menu-change-password">
              <PasswordIcon fontSize="small" sx={{ mr: 1.5 }} /> Change Password
            </MenuItem>
            <MenuItem onClick={logout} data-testid="menu-logout">
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Box className="no-print" sx={{ mt: 4, pt: 3, borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, color: "text.secondary", fontSize: 12 }}>
          <span>© {new Date().getFullYear()} Microtech Computers · Badhi Para, Hill Road, Mihijam, Jamtara, Jharkhand</span>
          <span>📞 9113788397 · 9308616839 · ✉️ mtcmihijam@gmail.com</span>
        </Box>
      </Box>
    </Box>
  );
}
