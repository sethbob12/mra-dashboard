// src/apiService.js

// Import mock data as fallback
import FLData from "./FLData";         // MRA Data (Mock)
import QAData from "./QAData";           // Quality Assurance Data (Mock)
import FeedbackData from "./FeedbackData"; // Feedback Data (Mock)

// Toggle to force using mock data (for debugging/demonstration)
const USE_MOCK_DATA = false;

/**
 * Fetch Reviewer Data (MRA Data) using the serverless proxy endpoint to bypass CORS.
 * Accepts startDate and endDate parameters (in YYYY-MM-DD format).
 * Falls back to FLData (mock data) on error or if forced.
 *
 * @param {string} d1 - Start date string (YYYY-MM-DD)
 * @param {string} d2 - End date string (YYYY-MM-DD)
 * @param {boolean} forceMock - Set to true to force using mock data.
 * @returns {Promise<any>} - Returns a promise that resolves to the data.
 */
export const fetchReviewerData = async (
  d1 = "2025-01-01",
  d2 = "2025-01-03",
  forceMock = false
) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Reviewer Data.");
      return FLData;
    } else {
      // Using the serverless function endpoint (relative URL) on Vercel to bypass CORS restrictions.
      const endpointUrl = `/api/reviewer-stats?d1=${d1}&d2=${d2}`;
      console.log("Fetching Reviewer Data from proxy endpoint:", endpointUrl);
      
      // We rely on the proxy (serverless function) to handle the API key.
      const response = await fetch(endpointUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Reviewer Data successfully loaded from proxy.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching Reviewer Data from proxy:", error);
    console.log("Falling back to MOCK data.");
    return FLData;
  }
};

/**
 * Fetch QA Data (Quality Assurance Data) from the live API.
 */
export const fetchQualityData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for QA Data.");
      return QAData;
    } else {
      // Replace the URL below with your live QA API endpoint when ready.
      const endpointUrl = "https://my-json-server-9oad.onrender.com/mockQAData";
      console.log("Fetching QA Data from live API endpoint...", endpointUrl);
      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("QA Data successfully loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching QA Data:", error);
    console.log("Falling back to MOCK data.");
    return QAData;
  }
};

/**
 * Fetch Feedback Data from the live API.
 */
export const fetchFeedbackData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Feedback Data.");
      return FeedbackData;
    } else {
      // Replace the URL below with your live Feedback API endpoint when ready.
      const endpointUrl = "https://my-json-server-9oad.onrender.com/mockFeedbackData";
      console.log("Fetching Feedback Data from live API endpoint...", endpointUrl);
      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Feedback Data successfully loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching Feedback Data:", error);
    console.log("Falling back to MOCK data.");
    return FeedbackData;
  }
};

const apiService = {
  fetchReviewerData,
  fetchQualityData,
  fetchFeedbackData
};

export default apiService;
