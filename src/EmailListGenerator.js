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
  ThemeProvider,
  Tooltip
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import DownloadIcon from "@mui/icons-material/Download";

// Create a theme to apply Open Sans
const openSansTheme = createTheme({
  typography: {
    fontFamily: "Open Sans, sans-serif",
  },
});

const EmailListGenerator = ({ data }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  // copiedClient holds the category that was last copied.
  const [copiedClient, setCopiedClient] = useState(null);

  // **Psych Writers (Updated with Correct Emails)**
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
    "Addison Marimberga": "addison@peerlinkmedical.com",
  };

  // **Group Emails by Client**
  const groupedEmails = data.reduce((acc, item) => {
    const clientsArray = item.clients.split(",").map((client) => client.trim());
    clientsArray.forEach((client) => {
      if (!acc[client]) acc[client] = [];
      if (!acc[client].includes(item.email)) acc[client].push(item.email);
    });
    return acc;
  }, {});

  // **Generate "All" Emails List (Unique Emails)**
  const allEmails = [...new Set(data.map((item) => item.email))];

  // **Generate "Psych" Emails List (Using Verified Psych Writers)**
  const psychEmails = Object.values(psychWriters);

  // **Insert "All" and "Psych" Categories at the Top**
  const emailCategories = {
    All: allEmails,
    Psych: psychEmails,
    ...groupedEmails,
  };

  // Function to copy addresses for a given client (comma-separated for Bcc)
  const handleCopy = (client) => {
    const textToCopy = emailCategories[client].join(", ");
    navigator.clipboard.writeText(textToCopy);
    setCopiedClient(client);
    // Reset after 1 second.
    setTimeout(() => setCopiedClient(null), 1000);
  };

  // Function to compose email using the addresses from the last copied category.
  // Defaults to "All" if nothing was copied.
  // Subject: "[client] Update -" if a specific client was copied; otherwise "Update -".
  const handleComposeEmail = () => {
    const clientForEmail = copiedClient || "All";
    const addresses = emailCategories[clientForEmail].join(", ");
    const subject =
      clientForEmail === "All" ? "Update -" : `[${clientForEmail}] Update -`;
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(
      addresses
    )}&subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoLink;
  };

  // Function to export all emails from the "All" category as a CSV file.
  const handleExportEmails = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Email\n" +
      emailCategories["All"].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "email_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ThemeProvider theme={openSansTheme}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#000" }}>
          Email List Generator
        </Typography>

        {/* Grid of Client/Category Cards */}
        <Grid container spacing={2}>
          {Object.keys(emailCategories).map((client) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={client}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  transition: "0.3s ease-in-out",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#E3F2FD",
                    transform: "scale(1.03)",
                  },
                }}
                onClick={() => setSelectedClient(client)}
              >
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                  {client}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  Show Emails
                </Button>
              </Paper>
            </Grid>
          ))}

          {/* Extra Grid Cell: Export Emails */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: "#fff",
                borderRadius: 2,
                transition: "0.3s ease-in-out",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#E3F2FD",
                  transform: "scale(1.03)",
                },
              }}
              onClick={handleExportEmails}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                Export Emails (CSV)
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #2196F3 30%, #1976D2 90%)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1976D2 30%, #1565C0 90%)",
                  },
                }}
              >
                <DownloadIcon />
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Compose Email Button with Tooltip */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Tooltip
            title="Click to open your default email client. Copied addresses will be inserted into the Bcc field and a placeholder subject will be added."
            arrow
          >
            <Button
              variant="contained"
              onClick={handleComposeEmail}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1.2rem",
                px: 4,
                py: 1.5,
                background: "linear-gradient(45deg, #66bb6a 30%, #43a047 90%)",
                color: "#fff",
                "&:hover": {
                  background: "linear-gradient(45deg, #43a047 30%, #388e3c 90%)",
                },
              }}
              startIcon={<EmailIcon />}
            >
              Compose Email
            </Button>
          </Tooltip>
        </Box>

        {/* POPUP MODAL FOR EMAIL LIST */}
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
                width: "50%",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}
            >
              {/* Modal Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {selectedClient} Emails
                </Typography>
                <IconButton onClick={() => setSelectedClient(null)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              {/* Email List (Comma-Separated) */}
              <Box sx={{ p: 2, backgroundColor: "#F5F5F5", borderRadius: 1 }}>
                <Typography
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    fontSize: "14px",
                  }}
                >
                  {emailCategories[selectedClient]?.join(", ")}
                </Typography>
              </Box>

              {/* Copy Button */}
              <Button
                variant="outlined"
                onClick={() => handleCopy(selectedClient)}
                fullWidth
                sx={{ mt: 2 }}
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
            </Box>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default EmailListGenerator;
