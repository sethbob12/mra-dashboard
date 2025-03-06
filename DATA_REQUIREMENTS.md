# DATA REQUIREMENTS

This document outlines all the dynamic data points that must be retrieved from the platform via API calls. The dashboard relies on three main data sources: **FLData**, **QAData**, and **FeedbackData**.


## FLData (Reviewer Performance Data)

This data source provides key performance and quality metrics for reviewers. The following dynamic data points are required:

- **name** (Reviewer's full name as a string)
- **clients** (A comma‐separated string listing all clients assigned to the reviewer)
- **casesPast30Days** (Number of cases the reviewer submitted in the last 30 days)
- **avgCasesDay** (Average number of cases submitted per day by the reviewer)
- **clientRevisionsWeek** (Number of cases returned by clients for revision over the past week; used to calculate the revision rate. Will need to define was to differentiate revisions vs. addendums (these should not count))
- **revisionRate** (Calculated percentage indicating the revision rate, e.g., (clientRevisionsWeek / totalCases) × 100)
- **qualityScore** (Overall quality score for the reviewer; a composite of accuracy, timeliness, and efficiency)
- **lateCasePercentage** (Percentage of cases submitted late (will also need defined what is late))
- **totalCasesSubmitted** (For a selected date range)

---

## QAData (Quality Assurance Member Metrics)

This data source focuses on the metrics for QA members, including historical and trend data. The required dynamic data points are:

- **qaMember** (Unique identifier for the QA member)
- **name** (QA member’s name as a string)
- **totalCasesSubmitted** (Total number of cases submitted by the QA member (for a date range))
- **breakdownByClient** (An object mapping client names to the number of cases submitted for each client in a date range, e.g., `{ PFR: 600, Lincoln: 500, Hartford: 400 }`)
- **casesPast7Days** (Number of cases submitted in the past 7 days)
- **casesPast30Days** (Number of cases submitted in the past 30 days)
- **casesPast60Days** (Number of cases submitted in the past 60 days)
- **revisionsSentWeek** (The number of cases sent back for revision to the reviewer.)
- **revisionsSentMonth** (Number of cases sent back for revision over the past month.)
- **clientRevisionsWeek** (The number of cases submitted by the QA member that were sent back by the client (may need to define time limit, e.g., within 3 days).)
- **avgCasesDay** (Average number of cases submitted per day during the current period.)
**- **prevAvgCasesDay** (Average number of cases submitted per day during the previous period; used for trend comparisons.)
- **prevCasesPast7Days** (Number of cases submitted in the previous 7-day period.)
- **prevCasesPast30Days** (Number of cases submitted in the previous 30-day period.)
- **prevTotalCases** (Total number of cases submitted in the previous period for a 7-day timeframe.)
- **prevRevisionsSentWeek** (Number of revisions sent back for the reviewer in the previous week.)
- **prevClientRevisionsWeek** (NEW previous period value: Number of cases submitted that were sent back by the client in the previous week.)**
- **feedback**  
  (An array of feedback objects. Each feedback object includes:
  - **content** (Text of the feedback)
  - **reviewer** (Name of the reviewer who provided the feedback)
  - **client** (Client associated with the feedback)
  - **caseID** (Unique identifier for the case)
  - **date** (Timestamp when the feedback was given, ideally in ISO format)
  )

---

## FeedbackData (Detailed Feedback Information)

This data source provides  feedback entries that are used for generating both client and internal feedback reports. Each feedback object should include the following fields:

- **name** (Name of the person receiving the feedback; the reviewer’s name.)
- **feedbackType** (A string indicating the type of feedback. For example, `"internal"` for internal QA feedback or `"client"` for client feedback.)
- **client** (The name of the client associated with the feedback, e.g., `"Lincoln"`.)
- **qaMember** (The QA member's identifier who is associated with this feedback. This helps in grouping internal feedback by QA member.)
- **text** (The content of the feedback, as a string. Copy button functions will concatenate feedback text only for possible bulk text analysis)
- **date** (The timestamp when the feedback was given, ideally in ISO format, e.g., `"2024-12-28T11:30:00Z"`.)
- **caseID** (A unique identifier for the case associated with the feedback. This will allow any feedback to further investigated by searching and locating the case stored securely on the platform)

---

## Summary

- **FLData** supplies the core reviewer performance and quality metrics, including case counts, quality scores, and revision rates.
- **QAData** provides the metrics for QA members along with historical data for trend analysis (trend analysis can be limited or removed if data storage and categorization become unfeasible).
- **FeedbackData** delivers detailed feedback information with timestamps, reviewer names, and associated case/client data.


