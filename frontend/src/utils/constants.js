/** Status/Priority color helpers and shared constants. */
export const STATUS_OPTIONS = ["New", "Interested", "Follow-up", "Demo Scheduled", "Admitted", "Cancelled", "Not Interested"];
export const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
export const MODE_OPTIONS = ["Offline", "Online", "Hybrid"];
export const GENDER_OPTIONS = ["Male", "Female", "Other"];
export const COMM_TYPES = ["Call", "WhatsApp", "Email", "Visit", "SMS"];

export const statusColor = (s) => ({
  "New": { bg: "#E7EFF4", fg: "#4A6FA5" },
  "Interested": { bg: "#EAF3E1", fg: "#4F772D" },
  "Follow-up": { bg: "#FCEBD9", fg: "#D97736" },
  "Demo Scheduled": { bg: "#EFECFB", fg: "#5A4AA5" },
  "Admitted": { bg: "#D8E4D5", fg: "#132A13" },
  "Cancelled": { bg: "#F5D9D9", fg: "#9E2A2B" },
  "Not Interested": { bg: "#EEE7E5", fg: "#7A2E20" },
}[s] || { bg: "#F1F3F5", fg: "#5C6B64" });

export const priorityColor = (p) => ({
  "High": { bg: "#F5D9D9", fg: "#9E2A2B" },
  "Medium": { bg: "#FCEBD9", fg: "#D97736" },
  "Low": { bg: "#EAF3E1", fg: "#4F772D" },
}[p] || { bg: "#F1F3F5", fg: "#5C6B64" });

export function downloadCSV(rows, headers, filename) {
  const csv = [headers.join(",")].concat(
    rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
