# MRA Dashboard Data Schema

This document describes the JSON data schema powering the MRA Dashboard. The dashboard uses three main data sources:

1. **FLData (MRA Data)**
2. **QAData (Quality Assurance Data)**
3. **FeedbackData (Reviewer Feedback Data)**

Each section’s schema is provided below with the JSON definition followed by explanations of each field.

---

## 1. FLData.js Schema

This section stores information for frontline reviewers. It includes basic reviewer details, client associations, cost per case information, and an array of performance snapshots.

### JSON Schema

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "number" },
    "mra_id": { "type": "number" },
    "name": { "type": "string" },
    "clients": { "type": "string" },
    "email": { "type": "string" },
    "notes": { "type": "string" },
    "costPerCase": {
      "type": "object",
      "properties": {
        "PFR": { "type": "number" },
        "NYL": { "type": "number" },
        "LTC": { "type": "number" },
        "Telco": { "type": "number" },
        "Lincoln": { "type": "number" },
        "Hartford": { "type": "number" },
        "Peer Review": { "type": "number" },
        "Muckleshoot": { "type": "number" },
        "Standard": { "type": "number" }
      },
      "required": [
        "PFR",
        "NYL",
        "LTC",
        "Telco",
        "Lincoln",
        "Hartford",
        "Peer Review",
        "Muckleshoot",
        "Standard"
      ]
    },
    "caseType": { 
      "type": "string",
      "enum": ["Psych", "Non-Psych", "Both"]
    },
    "snapshots": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "snapshotDate": { "type": "string", "format": "date-time" },
          "totalCases": { "type": "number" },
          "casesPast30Days": { "type": "number" },
          "casesPast60Days": { "type": "number" },
          "clientRevisionsWeek": { "type": "number" },
          "clientRevisionsMonth": { "type": "number" },
          "clientRevisionsPast60": { "type": "number" },
          "lateCasePercentage": { "type": "number" },
          "avgCasesPerDay": { "type": "number" },
          "revisionRate": { "type": "number" },
          "timelinessScore": { "type": "number" },
          "efficiencyScore": { "type": "number" },
          "accuracyScore": { "type": "number" },
          "qualityScore": { "type": "number" }
        },
        "required": [
          "snapshotDate",
          "totalCases",
          "casesPast30Days",
          "casesPast60Days",
          "clientRevisionsWeek",
          "clientRevisionsMonth",
          "clientRevisionsPast60",
          "lateCasePercentage",
          "avgCasesPerDay",
          "revisionRate",
          "timelinessScore",
          "efficiencyScore",
          "accuracyScore",
          "qualityScore"
        ]
      }
    }
  },
  "required": [
    "id",
    "mra_id",
    "name",
    "clients",
    "email",
    "notes",
    "costPerCase",
    "caseType",
    "snapshots"
  ]
}

// Explanations for above data points:
id: Unique identifier for each FLData record.
mra_id: Unique reviewer identifier within the MRA system.
name: The reviewer's full name.
clients: A comma-separated string listing the client names associated with the reviewer. This makes it easy to update if a reviewer adds or drops a client.
email: The reviewer's email address.
notes: Additional remarks or comments about the reviewer.
costPerCase: An object mapping each client type to its cost per case:
  PFR, NYL, LTC, Telco, Lincoln, Hartford, Peer Review, Muckleshoot, Standard, etc.
caseType: Indicates whether the reviewer handles "Psych", "Non-Psych", or "Both" types of cases.
snapshots: An array containing performance snapshots. Each snapshot includes:
  snapshotDate: The date and time (in ISO 8601 format) when the snapshot was taken.
  totalCases: Total cases handled up to the snapshot date.
  casesPast30Days: Number of cases processed in the past 30 days.
  casesPast60Days: Number of cases processed in the past 60 days.
  clientRevisionsWeek: Number of client revision requests in the past week.
  clientRevisionsMonth: Number of client revision requests in the past month.
  clientRevisionsPast60: Number of client revision requests in the past 60 days.
  lateCasePercentage: Percentage of cases that were submitted late.
  avgCasesPerDay: Average number of cases processed per day.
  revisionRate: Percentage rate of cases requiring revisions.
  timelinessScore: Score indicating the timeliness of the reviewer's performance.
  efficiencyScore: Efficiency score for the reviewer.
  accuracyScore: Score reflecting the accuracy of the reviewer's work.
  qualityScore: Composite quality score derived from key performance metrics.
---------------------------------------------------------------------------

QAData.js Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "number" },
    "qaMember": { "type": "number" },
    "name": { "type": "string" },
    "totalCasesSubmitted": { "type": "number" },
    "breakdownByClient": {
      "type": "object",
      "properties": {
        "PFR": { "type": "number" },
        "Lincoln": { "type": "number" },
        "Hartford": { "type": "number" },
        "Peer Review": { "type": "number" },
        "Telco": { "type": "number" },
        "Standard": { "type": "number" },
        "NYL": { "type": "number" },
        "Muckleshoot": { "type": "number" },
        "LTC": { "type": "number" }
      },
      "required": ["PFR", "Lincoln", "Hartford", "Peer Review", "Telco", "Standard", "NYL", "Muckleshoot", "LTC"]
    },
    "casesPast7Days": { "type": "number" },
    "casesPast30Days": { "type": "number" },
    "casesPast60Days": { "type": "number" },
    "revisionsSentWeek": { "type": "number" },
    "revisionsSentMonth": { "type": "number" },
    "clientRevisionsWeek": { "type": "number" },
    "avgCasesDay": { "type": "number" },
    "prevAvgCasesDay": { "type": "number" },
    "prevCasesPast7Days": { "type": "number" },
    "prevCasesPast30Days": { "type": "number" },
    "prevTotalCases": { "type": "number" },
    "prevRevisionsSentWeek": { "type": "number" },
    "prevClientRevisionsWeek": { "type": "number" },
    "feedback": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "content": { "type": "string" },
          "reviewer": { "type": "string" },
          "client": { "type": "string" },
          "caseID": { "type": "string" },
          "date": { "type": "string", "format": "date-time" }
        },
        "required": ["content", "reviewer", "client", "caseID", "date"]
      }
    }
  },
  "required": [
    "id",
    "qaMember",
    "name",
    "totalCasesSubmitted",
    "breakdownByClient",
    "casesPast7Days",
    "casesPast30Days",
    "casesPast60Days",
    "revisionsSentWeek",
    "revisionsSentMonth",
    "clientRevisionsWeek",
    "avgCasesDay",
    "prevAvgCasesDay",
    "prevCasesPast7Days",
    "prevCasesPast30Days",
    "prevTotalCases",
    "prevRevisionsSentWeek",
    "prevClientRevisionsWeek",
    "feedback"
  ]
}

Explanations for above data points:
id - Unique identifier for each QA record (for API operations)
qaMember - Numeric identifier for the QA member. // Was used for testing but probably should be name
name - The QA member's name.
totalCasesSubmitted - Total number of cases the QA member has submitted. //Count triggered by use of the 'submit 100%' or 'submit for further review' buttons
breakdownByClient - An object showing the number of cases QAd per client // all clients should be listed out here
casesPast7Days - Number of cases handled in the past 7 days.
casesPast30Days - Number of cases handled in the past 30 days.
casesPast60Days - Number of cases handled in the past 60 days.
revisionsSentWeek - Number of revisions sent in the past week.
revisionsSentMonth - Number of revisions sent in the past month.
clientRevisionsWeek - Number of client-driven revisions in the past week. // These are cases submitted by the QA member which later come back for 'revision'. 'Revision' here also needs defined, possibly with a time component (within 72-96 hours).
avgCasesDay - Average number of cases processed per day.
prevAvgCasesDay - Previous period's average cases per day.
prevCasesPast7Days - Number of cases in the previous 7-day period.
prevCasesPast30Days - Number of cases in the previous 30-day period.
prevTotalCases - Total cases count in the previous period (typically a 7-day period).
prevRevisionsSentWeek - Number of revisions sent in the previous week.
prevClientRevisionsWeek - Number of client revisions in the previous week.
feedback - An array of feedback objects:
   content - The feedback text.
   reviewer - The name of the reviewer (MRA) who received the feedback.
   client - The client associated with the case feedback.
   caseID - The identifier for the case. // This allows the specific case to be located on the platform without having any PHI on the dashboard
   date - The date and time when the feedback was provided (ISO 8601 format). // Needed for sorting and QA metrics section

--------------------------------------------------------------------------

FeedbackData.js Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "number" },
    "name": { "type": "string" },
    "feedbackType": { "type": "string" },
    "client": { "type": "string" },
    "text": { "type": "string" },
    "date": { "type": "string", "format": "date-time" },
    "caseID": { "type": "string" },
    "qaMember": { "type": "number" }
  },
  "required": [
    "id",
    "name",
    "feedbackType",
    "client",
    "text",
    "date",
    "caseID"
  ]
}

Explanations for above data points:

id - Unique identifier for each feedback entry (for API operations)
name - The name of the reviewer (MRA) receiving feedback.
feedbackType - The type of feedback, such as "client" or "internal". // client being external; internal being our medical QA team
client - The client associated with this case feedback.
text - The content of the feedback.
date - The date and time when the feedback was given (ISO 8601 format).
caseID - The identifier for the case associated with this feedback (helps locate actual case without exposing PHI on dashboard).
qaMember - Numeric identifier/name for the QA member (included when feedback is internal). // Current architecture requires this field for internal feedback reports to generate under QA Metrics