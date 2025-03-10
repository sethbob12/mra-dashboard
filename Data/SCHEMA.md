FLData.js Schema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "number" },
    "mra_id": { "type": "number" },
    "name": { "type": "string" },
    "clients": { "type": "string" },
    "email": { "type": "string" },
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
    "qualityScore": { "type": "number" },
    "notes": { "type": "string" },
    "snapshotDate": { "type": "string", "format": "date-time" },
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
    }
  },
  "required": [
    "id",
    "mra_id",
    "name",
    "clients",
    "email",
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
    "qualityScore",
    "notes",
    "costPerCase",
    "snapshotDate"
  ]
}

Explanations for above data points:
id - unique identifier for each record for API operations
mra_id - Unique reviewer identifier.
name - The reviewer's full name.
clients - A comma-separated string listing the client types the reviewer works with.
email - The reviewer's email address.
totalCases - The total number of cases handled by the reviewer.
casesPast30Days - Number of cases handled in the past 30 days.
casesPast60Days - Number of cases handled in the past 60 days.
clientRevisionsWeek - Number of cases revised in the past week.
clientRevisionsMonth - Number of cases revised in the past month.
clientRevisionsPast60 - Number of cases revised in the past 60 days.
lateCasePercentage - Percentage of cases that were submitted late.
avgCasesPerDay - Average number of cases handled per day.
revisionRate - The rate or percentage of cases that required revisions.
timelinessScore - A score representing how timely the reviewer is.
efficiencyScore - A score representing the efficiency of the reviewer.
accuracyScore - A score representing the accuracy of the reviewer's work.
qualityScore - Overall quality score derived from performance metrics.
notes - Additional notes or comments about the reviewer.
snapshotDate - The date and time when this snapshot of reviewer data was recorded (This field uses ISO 8601 date-time format (e.g., "2025-03-09T12:34:56Z"); needed for reports on historical trends.
costPerCase - An object mapping each client type to its respective cost per case:
PFR - Cost per case for PFR.
NYL - Cost per case for NYL.
LTC - Cost per case for LTC.
Telco - Cost per case for Telco.
Lincoln - Cost per case for Lincoln.
Hartford - Cost per case for Hartford.
Peer Review - Cost per case for Peer Review.
Muckleshoot - Cost per case for Muckleshoot.
Standard - Cost per case for Standard.

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
        "Hartford": { "type": "number" }
      },
      "required": ["PFR", "Lincoln", "Hartford"]
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
qaMember - Numeric identifier for the QA member.
name - The QA member's name.
totalCasesSubmitted - Total number of cases the QA member has submitted.
breakdownByClient - An object showing the number of cases per client:
PFR - Number of cases for PFR.
Lincoln - Number of cases for Lincoln.
Hartford - Number of cases for Hartford.
casesPast7Days - Number of cases handled in the past 7 days.
casesPast30Days - Number of cases handled in the past 30 days.
casesPast60Days - Number of cases handled in the past 60 days.
revisionsSentWeek - Number of revisions sent in the past week.
revisionsSentMonth - Number of revisions sent in the past month.
clientRevisionsWeek - Number of client-driven revisions in the past week.
avgCasesDay - Average number of cases processed per day.
prevAvgCasesDay - Previous period's average cases per day.
prevCasesPast7Days - Number of cases in the previous 7-day period.
prevCasesPast30Days - Number of cases in the previous 30-day period.
prevTotalCases - Total cases count in the previous period (typically a 7-day period).
prevRevisionsSentWeek - Number of revisions sent in the previous week.
prevClientRevisionsWeek - Number of client revisions in the previous week.
feedback - An array of feedback objects:
content - The feedback text.
reviewer - The name of the reviewer who provided the feedback.
client - The client associated with the feedback.
caseID - The identifier for the case.
date - The date and time when the feedback was provided (ISO 8601 format).

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
name - The name of the reviewer providing feedback.
feedbackType - The type of feedback, such as "client" or "internal".
client - The client associated with this feedback.
text - The content of the feedback.
date - The date and time when the feedback was given (ISO 8601 format).
caseID - The identifier for the case associated with this feedback.
qaMember - (Optional) Numeric identifier for the QA member (included when feedback is internal).