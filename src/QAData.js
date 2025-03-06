// src/QAData.js

const QAData = [
  {
    qaMember: 1,
    name: "QA Member 1",
    totalCasesSubmitted: 1500,
    breakdownByClient: {
      PFR: 600,
      Lincoln: 500,
      Hartford: 400,
    },
    casesPast7Days: 80,
    casesPast30Days: 350,
    casesPast60Days: 700,
    revisionsSentWeek: 25,  // cases sent back for revision to the reviewer (old metric)
    revisionsSentMonth: 80,
    clientRevisionsWeek: 20,  // NEW: cases submitted that were sent back by the client
    avgCasesDay: 40,
    // New previous period data (approximate)
    prevAvgCasesDay: 38,
    prevCasesPast7Days: 75,
    prevCasesPast30Days: 340,
    prevTotalCases: 75, // For a 7-day period
    prevRevisionsSentWeek: 27,
    prevClientRevisionsWeek: 22,  // NEW previous period value
    feedback: [
      {
        content: "Great job on clarifying the report structure.",
        reviewer: "Alyssa Teves",
        client: "PFR",
        caseID: "5-3000003",
        date: "2024-10-05T09:00:00Z"
      },
      {
        content: "Consider revising the formatting for better clarity.",
        reviewer: "Beatrice Solon",
        client: "Lincoln",
        caseID: "5-3000008",
        date: "2024-11-01T10:15:00Z"
      },
      {
        content: "Feedback is concise and effective.",
        reviewer: "Chukwudi Akubueze",
        client: "Hartford",
        caseID: "5-3000016",
        date: "2024-11-20T08:30:00Z"
      },
      {
        content: "The submission reflects the updated guidelines well.",
        reviewer: "Chris Ekundare",
        client: "PFR",
        caseID: "5-3000020",
        date: "2024-12-15T11:45:00Z"
      },
      {
        content: "Review the changes in the case narrative carefully.",
        reviewer: "Dilay Ackan",
        client: "Lincoln",
        caseID: "5-3000004",
        date: "2025-01-10T09:30:00Z"
      },
      {
        content: "Excellent attention to detail in the feedback provided.",
        reviewer: "Ebenezer Arisa",
        client: "Hartford",
        caseID: "5-3000007",
        date: "2025-02-05T10:00:00Z"
      },
      {
        content: "Overall performance is strong with minimal revisions needed.",
        reviewer: "Emmanuel Uduigwome",
        client: "PFR",
        caseID: "5-3000010",
        date: "2025-02-28T08:45:00Z"
      }
    ],
  },
  {
    qaMember: 2,
    name: "QA Member 2",
    totalCasesSubmitted: 1400,
    breakdownByClient: {
      PFR: 500,
      Lincoln: 450,
      Hartford: 450,
    },
    casesPast7Days: 70,
    casesPast30Days: 320,
    casesPast60Days: 680,
    revisionsSentWeek: 20,
    revisionsSentMonth: 70,
    clientRevisionsWeek: 18,  // NEW
    avgCasesDay: 35,
    // New previous period data (approximate)
    prevAvgCasesDay: 39,
    prevCasesPast7Days: 68,
    prevCasesPast30Days: 310,
    prevTotalCases: 68,
    prevRevisionsSentWeek: 21,
    prevClientRevisionsWeek: 20,  // NEW
    feedback: [
      {
        content: "Ensure consistency in the case documentation.",
        reviewer: "Chukwudi Akubueze",
        client: "PFR",
        caseID: "5-3000015",
        date: "2024-10-10T09:15:00Z"
      },
      {
        content: "Updated treatment guidelines need to be applied.",
        reviewer: "Chris Ekundare",
        client: "Hartford",
        caseID: "5-3000020",
        date: "2024-10-25T10:30:00Z"
      },
      {
        content: "Good attention to detail in the feedback provided.",
        reviewer: "Becca Kennedy",
        client: "Lincoln",
        caseID: "5-3000012",
        date: "2024-11-05T08:45:00Z"
      },
      {
        content: "Consider expanding the analysis for better insights.",
        reviewer: "Dilay Ackan",
        client: "PFR",
        caseID: "5-3000018",
        date: "2024-11-25T09:00:00Z"
      },
      {
        content: "The feedback aligns well with the updated clinical data.",
        reviewer: "Ebenezer Arisa",
        client: "Hartford",
        caseID: "5-3000011",
        date: "2024-12-10T10:15:00Z"
      },
      {
        content: "Review the structure and ensure all metrics are clear.",
        reviewer: "Emmanuel Uduigwome",
        client: "Lincoln",
        caseID: "5-3000014",
        date: "2025-01-05T11:00:00Z"
      },
      {
        content: "The overall submission meets the criteria effectively.",
        reviewer: "Alyssa Teves",
        client: "PFR",
        caseID: "5-3000009",
        date: "2025-02-20T09:45:00Z"
      }
    ],
  },
  {
    qaMember: 3,
    name: "QA Member 3",
    totalCasesSubmitted: 1600,
    breakdownByClient: {
      PFR: 700,
      Lincoln: 500,
      Hartford: 400,
    },
    casesPast7Days: 75,
    casesPast30Days: 380,
    casesPast60Days: 750,
    revisionsSentWeek: 30,
    revisionsSentMonth: 90,
    clientRevisionsWeek: 28,  // NEW
    avgCasesDay: 60,
    // New previous period data (approximate)
    prevAvgCasesDay: 58,
    prevCasesPast7Days: 70,
    prevCasesPast30Days: 360,
    prevTotalCases: 70,
    prevRevisionsSentWeek: 32,
    prevClientRevisionsWeek: 30,  // NEW
    feedback: [
      {
        content: "Feedback is concise and well-structured.",
        reviewer: "Becca Kennedy",
        client: "PFR",
        caseID: "5-3000011",
        date: "2024-09-30T08:50:00Z"
      },
      {
        content: "Include additional clinical details in the report.",
        reviewer: "Dilay Ackan",
        client: "Lincoln",
        caseID: "5-3000024",
        date: "2024-10-20T09:30:00Z"
      },
      {
        content: "Excellent work overall with minimal errors.",
        reviewer: "Chukwudi Akubueze",
        client: "PFR",
        caseID: "5-3000013",
        date: "2024-11-15T10:00:00Z"
      },
      {
        content: "Reassess the restrictions based on the latest data.",
        reviewer: "Erika Sucgang",
        client: "Hartford",
        caseID: "5-3000020",
        date: "2024-12-05T11:20:00Z"
      },
      {
        content: "The submission clearly reflects recent changes.",
        reviewer: "Geni Payales",
        client: "Lincoln",
        caseID: "5-3000010",
        date: "2025-01-15T08:45:00Z"
      },
      {
        content: "Some minor revisions are needed for clarity.",
        reviewer: "Ieva Puidoke",
        client: "PFR",
        caseID: "5-3000012",
        date: "2025-02-10T10:30:00Z"
      },
      {
        content: "Overall, the feedback is solid and well-documented.",
        reviewer: "Ileri Lawal",
        client: "Lincoln",
        caseID: "5-3000014",
        date: "2025-02-25T09:15:00Z"
      }
    ],
  },
  {
    qaMember: 4,
    name: "QA Member 4",
    totalCasesSubmitted: 1550,
    breakdownByClient: {
      PFR: 600,
      Lincoln: 400,
      Hartford: 550,
    },
    casesPast7Days: 68,
    casesPast30Days: 360,
    casesPast60Days: 720,
    revisionsSentWeek: 22,
    revisionsSentMonth: 75,
    clientRevisionsWeek: 20,  // NEW
    avgCasesDay: 50,
    // New previous period data (approximate)
    prevAvgCasesDay: 48,
    prevCasesPast7Days: 65,
    prevCasesPast30Days: 350,
    prevTotalCases: 65,
    prevRevisionsSentWeek: 20,
    prevClientRevisionsWeek: 18,  // NEW
    feedback: [
      {
        content: "The analysis of restrictions is excellent.",
        reviewer: "Erika Sucgang",
        client: "PFR",
        caseID: "5-3000039",
        date: "2024-10-15T09:00:00Z"
      },
      {
        content: "A few improvements in the documentation style are needed.",
        reviewer: "Geni Payales",
        client: "PFR",
        caseID: "5-3000044",
        date: "2024-11-02T10:00:00Z"
      },
      {
        content: "Overall performance meets expectations.",
        reviewer: "Alyssa Teves",
        client: "Hartford",
        caseID: "5-3000004",
        date: "2024-11-18T09:45:00Z"
      },
      {
        content: "Consider verifying the clinical data before submission.",
        reviewer: "Beatrice Solon",
        client: "Lincoln",
        caseID: "5-3000008",
        date: "2024-12-10T10:30:00Z"
      },
      {
        content: "The revisions are well-handled and clear.",
        reviewer: "Chukwudi Akubueze",
        client: "PFR",
        caseID: "5-3000015",
        date: "2025-01-08T11:15:00Z"
      },
      {
        content: "Ensure that the case notes are updated with the latest figures.",
        reviewer: "Chris Ekundare",
        client: "Hartford",
        caseID: "5-3000020",
        date: "2025-02-02T09:30:00Z"
      },
      {
        content: "Great consistency in feedback and thorough review.",
        reviewer: "Dilay Ackan",
        client: "Lincoln",
        caseID: "5-3000018",
        date: "2025-02-22T10:00:00Z"
      }
    ],
  },
  {
    qaMember: 5,
    name: "QA Member 5",
    totalCasesSubmitted: 1450,
    breakdownByClient: {
      PFR: 550,
      Lincoln: 400,
      Hartford: 500,
    },
    casesPast7Days: 65,
    casesPast30Days: 340,
    casesPast60Days: 680,
    revisionsSentWeek: 18,
    revisionsSentMonth: 65,
    clientRevisionsWeek: 16,  // NEW
    avgCasesDay: 30,
    // New previous period data (approximate)
    prevAvgCasesDay: 36,
    prevCasesPast7Days: 63,
    prevCasesPast30Days: 330,
    prevTotalCases: 63,
    prevRevisionsSentWeek: 19,
    prevClientRevisionsWeek: 15,  // NEW
    feedback: [
      {
        content: "Ensure accuracy in data extraction and client feedback.",
        reviewer: "Ieva Puidoke",
        client: "Lincoln",
        caseID: "5-3000047",
        date: "2024-10-05T10:00:00Z"
      },
      {
        content: "Formatting needs to be more consistent.",
        reviewer: "Ileri Lawal",
        client: "PFR",
        caseID: "5-3000051",
        date: "2024-10-28T09:15:00Z"
      },
      {
        content: "Feedback could be more detailed regarding clinical nuances.",
        reviewer: "Mary Galos",
        client: "Hartford",
        caseID: "5-3000078",
        date: "2024-11-10T10:30:00Z"
      },
      {
        content: "The review provides clear insights for improvements.",
        reviewer: "Chukwudi Akubueze",
        client: "PFR",
        caseID: "5-3000050",
        date: "2024-11-28T08:45:00Z"
      },
      {
        content: "Well-structured feedback that enhances report clarity.",
        reviewer: "Alyssa Teves",
        client: "Lincoln",
        caseID: "5-3000042",
        date: "2024-12-20T11:00:00Z"
      },
      {
        content: "The submission meets the criteria with minor tweaks needed.",
        reviewer: "Beatrice Solon",
        client: "Hartford",
        caseID: "5-3000040",
        date: "2025-01-12T10:15:00Z"
      },
      {
        content: "Overall, a satisfactory review with room for improvement.",
        reviewer: "Chukwudi Akubueze",
        client: "PFR",
        caseID: "5-3000045",
        date: "2025-02-18T09:30:00Z"
      }
    ],
  }
];

export default QAData;
