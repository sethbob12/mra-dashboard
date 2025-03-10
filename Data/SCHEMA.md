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
clients - A comma-separated string listing the client types the reviewer works with. // Makes it easy to expand reviewer info if they become trained on a new client or stop writing for one
email - The reviewer's email address.
totalCases - The total number of cases handled by the reviewer.
casesPast30Days - Number of cases handled in the past 30 days.
casesPast60Days - Number of cases handled in the past 60 days.
clientRevisionsWeek - Number of cases sent for revision in the past week. //Need to define a 'revision' vs 'addendum'. Hopefully, client can characterize accurately before sending request.
clientRevisionsMonth - Number of cases revised in the past month.
clientRevisionsPast60 - Number of cases revised in the past 60 days.
lateCasePercentage - Percentage of cases that were submitted late. //'Late' also needs defined. Possibly ~36 hours from when first assigned, allowing for timezone differences
avgCasesPerDay - Average number of cases handled per day.
revisionRate - The rate or percentage of cases that required revisions.
timelinessScore - A score representing how timely the reviewer is. // It's (100 - latecasePercentage)
efficiencyScore - A score representing the efficiency of the reviewer. // It's =MIN(100, 75 + (5 × (Avg Cases/Day − 1)))... reviewers averaging 1 case per day score 75, 2 cases per day 80, 3 cases per day 85, 4 cases per day 90, 5 cases per day 95, >6 cases per day 100. MIN function ensures no values over 100
accuracyScore - A score representing the accuracy of the reviewer's work. // It's (100 - revisionRate)
qualityScore - Overall quality score derived from performance metrics. // Quality Score = Accuracy (60%) + Timeliness (20%) + Efficiency (20%) --> this can be optimized once real data available to ensure it reflects sentiment currently
notes - Additional notes or comments about the reviewer.
snapshotDate - The date and time when this snapshot of reviewer data was recorded (This field uses ISO 8601 date-time format (e.g., "2025-03-09T12:34:56Z") // Needed for reports on historical trends.
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
// Additional clients can/should be added in additional rows
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
breakdownByClient - An object showing the number of cases QAd per client:
PFR - Number of cases for PFR.
Lincoln - Number of cases for Lincoln.
Hartford - Number of cases for Hartford.
// all clients should be listed out here
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
caseID - The identifier for the case associated with this feedback.
qaMember - Numeric identifier/name for the QA member (included when feedback is internal). // Current architecture requires this field for reports to work under QA Metrics