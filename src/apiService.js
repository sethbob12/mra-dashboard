// src/apiService.js

// Import mock data as fallback
import FLData from "./FLData";         // Frontline Reviewer Data (Mock)
import QAData from "./QAData";           // Quality Assurance Data (Mock)
import FeedbackData from "./FeedbackData"; // Feedback Data (Mock)

// Toggle to force using mock data (for debugging/fallback)
const USE_MOCK_DATA = false;

// ===================================================================
// Future Integration with Tableau Cloud:
// Replace the endpoint URLs below with the corresponding Tableau Cloud API endpoints.
// ===================================================================

// Fetch Reviewer Data (Frontline Reviewer Data)
export const fetchReviewerData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Reviewer Data.");
      return FLData;
    } else {
      // TODO: Replace the URL below with the Tableau Cloud endpoint for Frontline Reviewer Data.
      const endpointUrl = "https://my-json-server-9oad.onrender.com/mockFLData";
      console.log("Fetching Reviewer Data from Tableau Cloud endpoint...");
      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Reviewer Data successfully loaded.");
      return data;
    }
  } catch (error) {
    console.error("Error fetching Reviewer Data:", error);
    console.log("Falling back to MOCK data.");
    return FLData;
  }
};

// Fetch QA Data (Quality Assurance Data)
export const fetchQualityData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for QA Data.");
      return QAData;
    } else {
      // TODO: Replace the URL below with the Tableau Cloud endpoint for QA Data.
      const endpointUrl = "https://my-json-server-9oad.onrender.com/mockQAData";
      console.log("Fetching QA Data from Tableau Cloud endpoint...");
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

// Fetch Feedback Data
export const fetchFeedbackData = async (forceMock = false) => {
  try {
    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Feedback Data.");
      return FeedbackData;
    } else {
      // TODO: Replace the URL below with the Tableau Cloud endpoint for Feedback Data.
      const endpointUrl = "https://my-json-server-9oad.onrender.com/mockFeedbackData";
      console.log("Fetching Feedback Data from Tableau Cloud endpoint...");
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
