// import React, { useEffect, useState } from "react";
// import { Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
// import PrintIcon from "@mui/icons-material/Print";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../services/api";
// import { INSTITUTE } from "../utils/institute";

// /** Beautiful A4-sized enquiry acknowledgement receipt.
//  *  Given to students right after registration for future reference.
//  *  Print-optimized: hides all navigation chrome when printed.
//  */
// export default function EnquiryReceipt() {
//   const { id } = useParams();
//   const nav = useNavigate();
//   const [e, setE] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.get(`/enquiries/${id}`).then((r) => setE(r.data)).finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;
//   if (!e) return <Typography>Enquiry not found.</Typography>;

//   const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
//   const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

//   const Row = ({ label, value }) => (
//     <Box sx={{ display: "flex", py: 0.7, borderBottom: "1px dashed #E2E8F0" }}>
//       <Typography sx={{ width: 170, fontWeight: 600, color: "#5C6B64", fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</Typography>
//       <Typography sx={{ flex: 1, fontSize: 13.5, color: "#121212", fontWeight: 500 }}>{value || "—"}</Typography>
//     </Box>
//   );

//   const Section = ({ title, children }) => (
//     <Box sx={{ mb: 2.5, breakInside: "avoid" }}>
//       <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
//         <Box sx={{ width: 4, height: 20, bgcolor: "#1E2A78", borderRadius: 0.5 }} />
//         <Typography sx={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1E2A78" }}>{title}</Typography>
//       </Box>
//       <Box>{children}</Box>
//     </Box>
//   );

//   return (
//     <>
//       {/* Print-only styles */}
//       <style>{`
//         @media print {
//           @page { size: A4; margin: 12mm; }
//           body { background: #fff !important; }
//           .no-print { display: none !important; }
//           .receipt-page { box-shadow: none !important; margin: 0 !important; }
//         }
//       `}</style>

//       {/* Action bar (hidden in print) */}
//       <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
//         <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => nav(-1)} data-testid="receipt-back">Back</Button>
//         <Stack direction="row" spacing={1.5}>
//           <Button startIcon={<PrintIcon />} variant="contained" color="primary" size="large" onClick={() => window.print()} data-testid="receipt-print">
//             Print Receipt
//           </Button>
//         </Stack>
//       </Box>

//       {/* A4 receipt */}
//       <Box
//         className="receipt-page"
//         sx={{
//           width: "210mm",
//           minHeight: "297mm",
//           maxWidth: "100%",
//           mx: "auto",
//           bgcolor: "#fff",
//           boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
//           border: "1px solid #E2E8F0",
//           borderRadius: 2,
//           overflow: "hidden",
//           "@media print": { border: "none", borderRadius: 0 },
//         }}
//       >
//         {/* Letterhead — dark navy header w/ logo + institute info */}
//         <Box sx={{ bgcolor: "#0B1247", color: "#fff", px: 4, py: 3, display: "flex", alignItems: "center", gap: 3 }}>
//           <Box sx={{ width: 96, height: 96, borderRadius: 2, bgcolor: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
//             <img src={INSTITUTE.logo} alt="Microtech" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
//           </Box>
//           <Box sx={{ flex: 1 }}>
//             <Typography sx={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.02em", lineHeight: 1.1 }}>
//               {INSTITUTE.name}
//             </Typography>
//             <Typography sx={{ fontSize: 12, fontStyle: "italic", opacity: 0.85, mt: 0.3 }}>{INSTITUTE.tagline}</Typography>
//             <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px", fontSize: 11.5, opacity: 0.92 }}>
//               <span>📍 {INSTITUTE.address.full}</span>
//               <span>🌐 {INSTITUTE.website}</span>
//               <span>✉️ {INSTITUTE.email}</span>
//               <span>📞 {INSTITUTE.phones.join(" · ")}</span>
//             </Box>
//           </Box>
//         </Box>

//         {/* Orange accent bar */}
//         <Box sx={{ height: 6, bgcolor: "#F58A0C" }} />

//         {/* Title row */}
//         <Box sx={{ px: 4, pt: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #F58A0C" }}>
//           <Box>
//             <Typography sx={{ fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#5C6B64", fontWeight: 700 }}>
//               Enquiry Acknowledgement Slip
//             </Typography>
//             <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#0B1247", mt: 0.2 }}>Registration #{String(e.id).padStart(5, "0")}</Typography>
//           </Box>
//           <Box sx={{ textAlign: "right" }}>
//             <Typography sx={{ fontSize: 11, color: "#5C6B64", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Issued On</Typography>
//             <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#121212" }}>{today}</Typography>
//           </Box>
//         </Box>

//         {/* Body */}
//         <Box sx={{ px: 4, py: 3 }}>
//           <Box sx={{ p: 2, mb: 3, bgcolor: "#F4F5F7", borderRadius: 1.5, borderLeft: "4px solid #0B1247" }}>
//             <Typography sx={{ fontSize: 13, color: "#121212", lineHeight: 1.6 }}>
//               Dear <b>{e.student_name}</b>, thank you for showing interest in <b>{INSTITUTE.name}</b>. Your enquiry has been successfully registered.
//               Please keep this slip for your future reference. Our counsellor will get in touch with you shortly.
//             </Typography>
//           </Box>

//           <Section title="Personal Details">
//             <Row label="Student Name" value={e.student_name} />
//             <Row label="Father's Name" value={e.father_name} />
//             <Row label="Mother's Name" value={e.mother_name} />
//             <Row label="Gender / DOB" value={`${e.gender || "—"}   ·   ${fmtDate(e.dob)}`} />
//             <Row label="Mobile / WhatsApp" value={`${e.mobile || "—"}   ·   ${e.whatsapp || "—"}`} />
//             <Row label="Email" value={e.email} />
//             <Row label="Address" value={[e.address, e.city, e.state, e.pincode].filter(Boolean).join(", ")} />
//           </Section>

//           <Section title="Academic Background">
//             <Row label="Qualification" value={e.qualification} />
//             <Row label="School / College" value={e.school_college} />
//             <Row label="Board / University" value={e.board_university} />
//             <Row label="Passing Year" value={e.passing_year} />
//             <Row label="Percentage / CGPA" value={e.percentage} />
//           </Section>

//           <Section title="Course Interest">
//             <Row label="Interested Course" value={e.course_name} />
//             <Row label="Batch" value={e.batch_name} />
//             <Row label="Preferred Timing" value={e.preferred_timing} />
//             <Row label="Mode of Learning" value={e.mode} />
//           </Section>

//           <Section title="Counselling & Status">
//             <Row label="Assigned Counsellor" value={e.counsellor_name} />
//             <Row label="Lead Source" value={e.lead_source_name} />
//             <Row label="Enquiry Date" value={fmtDate(e.enquiry_date)} />
//             <Row label="Next Follow-up" value={fmtDate(e.next_followup_date)} />
//             <Row label="Priority" value={e.priority} />
//             <Row label="Current Status" value={e.status} />
//           </Section>

//           {e.remarks && (
//             <Section title="Remarks">
//               <Typography sx={{ fontSize: 13, color: "#121212", p: 1.5, bgcolor: "#F8F9FA", borderRadius: 1, border: "1px solid #E2E8F0" }}>
//                 {e.remarks}
//               </Typography>
//             </Section>
//           )}

//           <Divider sx={{ my: 3, borderColor: "#E2E8F0" }} />

//           {/* Signatures */}
//           <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, mt: 6 }}>
//             <Box>
//               <Box sx={{ borderTop: "1.5px solid #121212", pt: 1 }}>
//                 <Typography sx={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#121212" }}>Student Signature</Typography>
//                 <Typography sx={{ fontSize: 10.5, color: "#5C6B64", mt: 0.3 }}>{e.student_name}</Typography>
//               </Box>
//             </Box>
//             <Box>
//               <Box sx={{ borderTop: "1.5px solid #121212", pt: 1 }}>
//                 <Typography sx={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#121212" }}>Counsellor / Authorised Signature</Typography>
//                 <Typography sx={{ fontSize: 10.5, color: "#5C6B64", mt: 0.3 }}>{e.counsellor_name || "For Microtech Computers"}</Typography>
//               </Box>
//             </Box>
//           </Box>
//         </Box>

//         {/* Footer strip */}
//         <Box sx={{ bgcolor: "#0B1247", color: "#fff", px: 4, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
//           <Typography sx={{ fontSize: 11, opacity: 0.85 }}>
//             This is a computer-generated acknowledgement. Please retain for future reference.
//           </Typography>
//           <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
//             {INSTITUTE.website}
//           </Typography>
//         </Box>
//       </Box>
//     </>
//   );
// }
import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { INSTITUTE } from "../utils/institute";

/** Beautiful A4-sized enquiry acknowledgement receipt.
 *  Given to students right after registration for future reference.
 *  Print-optimized: hides all navigation chrome when printed.
 */
export default function EnquiryReceipt() {
  const { id } = useParams();
  const nav = useNavigate();
  const [e, setE] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/enquiries/${id}`).then((r) => setE(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;
  if (!e) return <Typography>Enquiry not found.</Typography>;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const Row = ({ label, value }) => (
    <Box sx={{ display: "flex", py: 0.35, borderBottom: "1px dashed #E2E8F0" }}>
      <Typography sx={{ width: 150, fontWeight: 600, color: "#5C6B64", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</Typography>
      <Typography sx={{ flex: 1, fontSize: 11.5, color: "#121212", fontWeight: 500 }}>{value || "—"}</Typography>
    </Box>
  );

  const Section = ({ title, children }) => (
    <Box sx={{ mb: 1.2, breakInside: "avoid" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box sx={{ width: 3.5, height: 15, bgcolor: "#1E2A78", borderRadius: 0.5 }} />
        <Typography sx={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1E2A78" }}>{title}</Typography>
      </Box>
      <Box>{children}</Box>
    </Box>
  );

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 8mm; }
          html, body { background: #fff !important; height: auto !important; }
          .no-print { display: none !important; }
          .receipt-page {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Action bar (hidden in print) */}
      <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => nav(-1)} data-testid="receipt-back">Back</Button>
        <Stack direction="row" spacing={1.5}>
          <Button startIcon={<PrintIcon />} variant="contained" color="primary" size="large" onClick={() => window.print()} data-testid="receipt-print">
            Print Receipt
          </Button>
        </Stack>
      </Box>

      {/* A4 receipt */}
      <Box
        className="receipt-page"
        sx={{
          width: "210mm",
          // minHeight: "297mm",
          maxWidth: "100%",
          mx: "auto",
          bgcolor: "#fff",
          boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontSize: "12px",
        }}
      >
        {/* Letterhead — dark navy header w/ logo + institute info */}
        <Box sx={{ bgcolor: "#0B1247", color: "#fff", px: 3.5, py: 1.8, display: "flex", alignItems: "center", gap: 2.5 }}>
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: 1.5,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              p: 0.5,
            }}
          >
            <img src={INSTITUTE.logo} alt="Microtech" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.02em", lineHeight: 1.1 }}>
              {INSTITUTE.name}
            </Typography>
            <Typography sx={{ fontSize: 10.5, fontStyle: "italic", opacity: 0.85, mt: 0.2 }}>{INSTITUTE.tagline}</Typography>
            <Box sx={{ mt: 0.7, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 14px", fontSize: 10, opacity: 0.92 }}>
              <span>📍 {INSTITUTE.address.full}</span>
              <span>🌐 {INSTITUTE.website}</span>
              <span>✉️ {INSTITUTE.email}</span>
              <span>📞 {INSTITUTE.phones.join(" · ")}</span>
            </Box>
          </Box>
        </Box>

        {/* Orange accent bar */}
        <Box sx={{ height: 4, bgcolor: "#F58A0C" }} />

        {/* Title row */}
        <Box sx={{ px: 3.5, pt: 1.5, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #F58A0C" }}>
          <Box>
            <Typography sx={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5C6B64", fontWeight: 700 }}>
              Enquiry Acknowledgement Slip
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0B1247", mt: 0.1 }}>Registration #{String(e.id).padStart(5, "0")}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 9.5, color: "#5C6B64", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Issued On</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#121212" }}>{today}</Typography>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ px: 3.5, py: 1.5, flex: 1 }}>
          <Box sx={{ p: 1.2, mb: 1.5, bgcolor: "#F4F5F7", borderRadius: 1.5, borderLeft: "4px solid #0B1247" }}>
            <Typography sx={{ fontSize: 11, color: "#121212", lineHeight: 1.45 }}>
              Dear <b>{e.student_name}</b>, thank you for showing interest in <b>{INSTITUTE.name}</b>. Your enquiry has been successfully registered.
              Please keep this slip for your future reference. Our counsellor will get in touch with you shortly.
            </Typography>
          </Box>

          {/* Two-column layout to save vertical space */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <Box>
              <Section title="Personal Details">
                <Row label="Student Name" value={e.student_name} />
                <Row label="Father's Name" value={e.father_name} />
                <Row label="Mother's Name" value={e.mother_name} />
                <Row label="Gender / DOB" value={`${e.gender || "—"}  ·  ${fmtDate(e.dob)}`} />
                <Row label="Mobile / WhatsApp" value={`${e.mobile || "—"}  ·  ${e.whatsapp || "—"}`} />
                <Row label="Email" value={e.email} />
                <Row label="Address" value={[e.address, e.city, e.state, e.pincode].filter(Boolean).join(", ")} />
              </Section>

              <Section title="Academic Background">
                <Row label="Qualification" value={e.qualification} />
                <Row label="School / College" value={e.school_college} />
                <Row label="Board / University" value={e.board_university} />
                <Row label="Passing Year" value={e.passing_year} />
                <Row label="Percentage / CGPA" value={e.percentage} />
              </Section>
            </Box>

            <Box>
              <Section title="Course Interest">
                <Row label="Interested Course" value={e.course_name} />
                <Row label="Batch" value={e.batch_name} />
                <Row label="Preferred Timing" value={e.preferred_timing} />
                <Row label="Mode of Learning" value={e.mode} />
              </Section>

              <Section title="Counselling & Status">
                <Row label="Assigned Counsellor" value={e.counsellor_name} />
                <Row label="Lead Source" value={e.lead_source_name} />
                <Row label="Enquiry Date" value={fmtDate(e.enquiry_date)} />
                <Row label="Next Follow-up" value={fmtDate(e.next_followup_date)} />
                <Row label="Priority" value={e.priority} />
                <Row label="Current Status" value={e.status} />
              </Section>

              {e.remarks && (
                <Section title="Remarks">
                  <Typography sx={{ fontSize: 11, color: "#121212", p: 1, bgcolor: "#F8F9FA", borderRadius: 1, border: "1px solid #E2E8F0" }}>
                    {e.remarks}
                  </Typography>
                </Section>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: "#E2E8F0" }} />

          {/* Signatures */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, mt: 3 }}>
            <Box>
              <Box sx={{ borderTop: "1.5px solid #121212", pt: 0.7 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#121212" }}>Student Signature</Typography>
                <Typography sx={{ fontSize: 9.5, color: "#5C6B64", mt: 0.2 }}>{e.student_name}</Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ borderTop: "1.5px solid #121212", pt: 0.7 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#121212" }}>Counsellor / Authorised Signature</Typography>
                <Typography sx={{ fontSize: 9.5, color: "#5C6B64", mt: 0.2 }}>{e.counsellor_name || "For Microtech Computers"}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer strip */}
        <Box sx={{ bgcolor: "#0B1247", color: "#fff", px: 3.5, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
          <Typography sx={{ fontSize: 10, opacity: 0.85 }}>
            This is a computer-generated acknowledgement. Please retain for future reference.
          </Typography>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>
            {INSTITUTE.website}
          </Typography>
        </Box>
      </Box>
    </>
  );
}