// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Container, CssBaseline } from "@mui/material";
import Navbar from "./Navbar";
import Home from "./Home"; // Home/Dashboard Page
import FLTable from "./FLTable";
import FLChart from "./FLChart";
import EmailListGenerator from "./EmailListGenerator";
import QAFeedbackAggregator from "./QAFeedbackAggregator";
import ClientFeedbackAggregator from "./ClientFeedbackAggregator";
import Reports from "./Reports";
import QAMetrics from "./QAMetrics";
import LoginPage from "./LoginPage";
import FLData from "./FLData";
import FeedbackData from "./FeedbackData";
import ProtectedRoute from "./ProtectedRoute";

// Full list of reviewers
const reviewers = [
  "Alyssa Teves", "Beatrice Solon", "Becca Kennedy", "Chukwudi Akubueze", "Chris Ekundare",
  "Dilay Ackan", "Ebenezer Arisa", "Emmanuel Uduigwome", "Eliza Gomez", "Erika Sucgang",
  "Geni Payales", "Ieva Puidoke", "Ileri Lawal", "Iyanuoluwa Oni", "Joshua Arisa",
  "Joan Ajayi", "Khwaish Vasnani", "Lina Gutierrez", "Mary Goyenechea", "Mary Galos",
  "Maja Loja", "Miray Kaptan", "Oluseye Oluremi", "Oluwadamilola Ogunsemowo", "Thomas Oyinlola",
  "Ravit Haleva", "Sarah Watkins", "Shaila Maramara", "Vincent Medicielo", "Will Smith",
  "Yllana Saavedra", "Temilola Edu", "Toluwani Merari", "Oluwapelumi Gabriel", "Tolulope Ajayi",
  "Addison Marimberga", "Goodluck Odii", "Fiyinfoluwa Yemi-Lebi", "Elizabeth Adeyanju", "Opemipo Ade-Akingboye",
  "Lebari Damgbor", "Uchechukwu Ejike", "Oluwaseyi Adare", "Mariam Akubo", "Jamiu Olurunnisola",
  "Al Ameen Kalejaiye", "Solomon Bailey", "Oluwafemi Durojaiye"
];

const fetchReportData = (filters) => {
  console.log("Fetching report with filters:", filters);
};

function App() {
  return (
    <>
      <CssBaseline />
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          {/* Public route for login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/table"
            element={
              <ProtectedRoute>
                <FLTable data={FLData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chart"
            element={
              <ProtectedRoute>
                <FLChart data={FLData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emails"
            element={
              <ProtectedRoute>
                <EmailListGenerator data={FLData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa-feedback"
            element={
              <ProtectedRoute>
                <QAFeedbackAggregator feedbackData={FeedbackData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-feedback"
            element={
              <ProtectedRoute>
                <ClientFeedbackAggregator feedbackData={FeedbackData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports reviewers={reviewers} fetchReportData={fetchReportData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa-metrics"
            element={
              <ProtectedRoute>
                <QAMetrics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </>
  );
}

export default App;
