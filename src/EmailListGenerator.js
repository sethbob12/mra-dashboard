// src/EmailListGenerator.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Modal,
  Fade,
  Backdrop,
  Stack,
  IconButton,
  createTheme,
  ThemeProvider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import DownloadIcon from "@mui/icons-material/Download";

const openSansTheme = createTheme({
  typography: {
    fontFamily: "Open Sans, sans-serif"
  }
});

const uniformGradient = "linear-gradient(to right, #1E73BE, #1565C0)";

// Hardcoded psych writers.
const psychWriters = {
  "Becca Kennedy": "becca@peerlinkmedical.com",
  "Eliza Gómez Toro": "elizagomeztoro4545@gmail.com",
  "Khwaish Vasnani": "khwaishvasnani@gmail.com",
  "Lina Gutierrez": "linis2791@gmail.com",
  "Mary Lorens Goyenechea": "lorensgee1@gmail.com",
  "Maja Loja": "lojamaja@gmail.com",
  "Ravit Haleva": "ravithaleva@gmail.com",
  "Shaila Anne Maramara": "shailamaramara@gmail.com",
  "Will Smith": "will@peerlinkmedical.com",
  "Addison Marimberga": "addison@peerlinkmedical.com"
};

/**
 * EmailListGenerator component
 * @param {Array} data - Array of reviewer data (mock/live) passed from App.js
 */
const EmailListGenerator = ({ data }) => {
  const theme = useTheme();
  const [selectedClient, setSelectedClient] = useState(null);
  const [copiedClient, setCopiedClient] = useState(null);

  // 1) If data is undefined or empty, show a placeholder
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <ThemeProvider theme={openSansTheme}>
        <Box sx={{ mb: 4, pt: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              textAlign: "center",
              color: theme.palette.mode === "dark" ? "#fff" : "#000"
            }}
          >
            Email List Generator
          </Typography>
          <Typography sx={{ textAlign: "center", color: "gray" }}>
            No data available.
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // 2) Group Emails by Client from the passed-in `data`.
  const groupedEmails = data.reduce((acc, item) => {
    if (!item.email) return acc;
    const clientsArray = item.clients.split(",").map((c) => c.trim());
    clientsArray.forEach((client) => {
      if (!acc[client]) acc[client] = [];
      if (!acc[client].includes(item.email)) acc[client].push(item.email);
    });
    return acc;
  }, {});

  // 3) All unique emails across reviewers
  const allEmails = [
    ...new Set(data.filter((item) => item.email).map((item) => item.email))
  ];

  // 4) Build categories: "All", "Psych", plus each client
  const emailCategories = {
    All: allEmails,
    Psych: Object.values(psychWriters),
    ...groupedEmails
  };

  // Copy to clipboard
  const handleCopy = (client) => {
    const textToCopy = emailCategories[client].join(", ");
    navigator.clipboard.writeText(textToCopy);
    setCopiedClient(client);
    setTimeout(() => setCopiedClient(null), 1000);
  };

  // Compose an email in user’s default mail client
  const handleEmailGroup = (client) => {
    if (emailCategories[client]) {
      const addresses = emailCategories[client].join(", ");
      const subject = `[${client}] Update -`;
      const mailtoLink = `mailto:?bcc=${encodeURIComponent(
        addresses
      )}&subject=${encodeURIComponent(subject)}`;
      window.location.href = mailtoLink;
    } else {
      const mailtoLink = `mailto:?subject=${encodeURIComponent("Update -")}`;
      window.location.href = mailtoLink;
    }
  };

  // Export the "All" emails as CSV
  const handleExportEmails = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Email\n" + emailCategories["All"].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "email_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert to array for mapping
  const categoryEntries = Object.entries(emailCategories);

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box sx={{ mb: 4, pt: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: "bold",
            textAlign: "center",
            color: theme.palette.mode === "dark" ? "#fff" : "#000"
          }}
        >
          Email List Generator
        </Typography>

        <Grid container spacing={2}>
          {categoryEntries.map(([client, emails]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={client}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    transform: "translateY(-2px)"
                  }
                }}
                onClick={() => setSelectedClient(client)}
              >
                <Box
                  sx={{
                    background: uniformGradient,
                    p: 2,
                    textAlign: "center"
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      fontSize: "1.3rem",
                      letterSpacing: "0.7px",
                      textShadow:
                        "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000"
                    }}
                  >
                    {client}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor: "#fff"
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      backgroundColor: "#757575",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#616161"
                      }
                    }}
                  >
                    Show Emails
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}

          {/* Export Emails (CSV) box */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  transform: "translateY(-2px)"
                }
              }}
              onClick={handleExportEmails}
            >
              <Box
                sx={{
                  background: uniformGradient,
                  p: 2,
                  textAlign: "center"
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#fff",
                    textShadow:
                      "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000"
                  }}
                >
                  Export Emails (CSV)
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#fff"
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    backgroundColor: "#757575",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#616161"
                    }
                  }}
                >
                  <DownloadIcon sx={{ mr: 1 }} />
                  Export
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* MODAL FOR SELECTED CLIENT */}
        <Modal
          open={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 300 }}
        >
          <Fade in={Boolean(selectedClient)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "80%", md: "50%" },
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {selectedClient} Emails
                </Typography>
                <IconButton onClick={() => setSelectedClient(null)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Box sx={{ p: 2, backgroundColor: "#F5F5F5", borderRadius: 1, minHeight: 100 }}>
                <Typography
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    fontSize: "14px"
                  }}
                >
                  {emailCategories[selectedClient]?.join(", ") || "No email addresses found."}
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleCopy(selectedClient)}
                  fullWidth
                  startIcon={
                    copiedClient === selectedClient ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ContentCopyIcon />
                    )
                  }
                >
                  {copiedClient === selectedClient ? "Copied!" : "Copy Addresses"}
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleEmailGroup(selectedClient)}
                  startIcon={<EmailIcon />}
                  sx={{
                    backgroundColor: "#43a047",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#388e3c" }
                  }}
                >
                  Email Group
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default EmailListGenerator;
