// src/apiService.js

// Import mock data as fallback
import FLData from "./FLData";
import QAData from "./QAData";
import FeedbackData from "./FeedbackData";

// Toggle to force using mock data (for debugging/demonstration)
const USE_MOCK_DATA = false;

// Cache config
const CACHE_KEY_REVIEWER = "reviewerDataCache";
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Fetch Reviewer Data directly from the live API, with 12-hour caching.
 */
export const fetchReviewerData = async (
  d1 = "2025-01-01",
  d2 = "2025-04-01",
  forceMock = false,
  forceRefresh = false
) => {
  try {
    if (!forceRefresh && !USE_MOCK_DATA && !forceMock) {
      const cached = localStorage.getItem(CACHE_KEY_REVIEWER);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          console.log("Serving Reviewer Data from cache.");
          return data;
        }
      }
    }

    if (USE_MOCK_DATA || forceMock) {
      console.log("Using MOCK data for Reviewer Data.");
      return FLData;
    }

    const endpointUrl = `https://apifm.peerxc.com/api/reviewer-stats?d1=${d1}&d2=${d2}`;
    console.log("Fetching Reviewer Data from live API:", endpointUrl);

    const response = await fetch(endpointUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "pxc-super-secret-key",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Reviewer Data successfully loaded from live API.");

    // Cache the result
    localStorage.setItem(
      CACHE_KEY_REVIEWER,
      JSON.stringify({ timestamp: Date.now(), data })
    );

    return data;
  } catch (error) {
    console.error("Error fetching Reviewer Data from live API:", error);
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
    }
    const endpointUrl = "https://apifm.peerxc.com/api/mockQAData"; // update when real QA endpoint exists
    console.log("Fetching QA Data from live API endpoint...", endpointUrl);
    const response = await fetch(endpointUrl, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log("QA Data successfully loaded.");
    return data;
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
    }
    const endpointUrl = "https://apifm.peerxc.com/api/mockFeedbackData"; // update when real Feedback endpoint exists
    console.log("Fetching Feedback Data from live API endpoint...", endpointUrl);
    const response = await fetch(endpointUrl, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    console.log("Feedback Data successfully loaded.");
    return data;
  } catch (error) {
    console.error("Error fetching Feedback Data:", error);
    console.log("Falling back to MOCK data.");
    return FeedbackData;
  }
};

const apiService = {
  fetchReviewerData,
  fetchQualityData,
  fetchFeedbackData,
};

export default apiService;
