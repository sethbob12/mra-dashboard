// src/FeedbackData.js
/* This static data array will be replaced with an API call to the database */

const FeedbackData = [
  // Reviewer 1: Alyssa Teves (clients: PFR, Lincoln, Hartford)
  {
    reviewer: "Alyssa Teves",
    feedbackType: "client",
    client: "PFR",
    content:
      "Great attention to detail, but slightly slow turnaround. Please review the claimant's documentation and ensure clarity in the report. TESTING 1234567890!@#$%^&*()_+",
    date: "2024-09-15T08:00:00Z",
    caseID: "5-3000001"
  },
  {
    reviewer: "Alyssa Teves",
    feedbackType: "client",
    client: "Lincoln",
    content: "Verify that the formatting meets the required standards for submission.",
    date: "2024-10-02T09:15:00Z",
    caseID: "5-3000002"
  },
  {
    reviewer: "Alyssa Teves",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 1,
    content:
      "Consider updating the case restrictions based on recent clinical data.",
    date: "2024-11-20T10:30:00Z",
    caseID: "5-3000003"
  },
  {
    reviewer: "Alyssa Teves",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 2,
    content:
      "Ensure that the revised feedback aligns with updated treatment guidelines.",
    date: "2024-12-05T11:45:00Z",
    caseID: "5-3000004"
  },

  // Reviewer 2: Beatrice Solon (clients: PFR, Lincoln, Hartford, Peer Review, Telco, LTC)
  {
    reviewer: "Beatrice Solon",
    feedbackType: "client",
    client: "Peer Review",
    content:
      "Review the claimant's progress and update the documentation accordingly.",
    date: "2024-09-20T08:10:00Z",
    caseID: "5-3000005"
  },
  {
    reviewer: "Beatrice Solon",
    feedbackType: "client",
    client: "Telco",
    content:
      "Ensure all formatting is consistent with client guidelines.",
    date: "2024-10-05T09:20:00Z",
    caseID: "5-3000006"
  },
  {
    reviewer: "Beatrice Solon",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "Incorporate updated diagnostic details into the case revision.",
    date: "2024-11-10T10:25:00Z",
    caseID: "5-3000007"
  },
  {
    reviewer: "Beatrice Solon",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 4,
    content:
      "The case documentation requires further refinement for clarity.",
    date: "2024-12-01T11:35:00Z",
    caseID: "5-3000008"
  },

  // Reviewer 3: Becca Kennedy (clients: PFR, Lincoln)
  {
    reviewer: "Becca Kennedy",
    feedbackType: "client",
    client: "PFR",
    content:
      "Update the case notes to reflect the latest patient history accurately.",
    date: "2024-09-25T08:30:00Z",
    caseID: "5-3000009"
  },
  {
    reviewer: "Becca Kennedy",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Ensure the report clearly states all necessary revisions.",
    date: "2024-10-12T09:40:00Z",
    caseID: "5-3000010"
  },
  {
    reviewer: "Becca Kennedy",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 2,
    content:
      "Reassess the claimant's case restrictions in light of recent findings.",
    date: "2024-11-05T10:50:00Z",
    caseID: "5-3000011"
  },
  {
    reviewer: "Becca Kennedy",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 5,
    content:
      "Modify the case documentation to incorporate updated clinical metrics.",
    date: "2024-11-28T11:55:00Z",
    caseID: "5-3000012"
  },

  // Reviewer 4: Chukwudi Akubueze (clients: PFR, Lincoln, Hartford, Peer Review, Telco, Standard)
  {
    reviewer: "Chukwudi Akubueze",
    feedbackType: "client",
    client: "Standard",
    content:
      "The case review requires a detailed update based on the latest evaluations.",
    date: "2024-09-30T08:15:00Z",
    caseID: "5-3000013"
  },
  {
    reviewer: "Chukwudi Akubueze",
    feedbackType: "client",
    client: "Telco",
    content:
      "Please ensure that all client guidelines are met in the revised report.",
    date: "2024-10-18T09:25:00Z",
    caseID: "5-3000014"
  },
  {
    reviewer: "Chukwudi Akubueze",
    feedbackType: "internal",
    client: "Peer Review",
    qaMember: 1,
    content:
      "Update the case restrictions based on the most recent diagnostic outcomes.",
    date: "2024-11-12T10:30:00Z",
    caseID: "5-3000015"
  },
  {
    reviewer: "Chukwudi Akubueze",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 3,
    content:
      "Ensure that revisions accurately reflect the latest patient data.",
    date: "2024-12-02T11:40:00Z",
    caseID: "5-3000016"
  },

  // Reviewer 5: Chris Ekundare (clients: PFR, Lincoln, Hartford)
  {
    reviewer: "Chris Ekundare",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Review and update the case details to improve overall clarity.",
    date: "2024-10-02T08:05:00Z",
    caseID: "5-3000017"
  },
  {
    reviewer: "Chris Ekundare",
    feedbackType: "client",
    client: "PFR",
    content:
      "Ensure that all client-specific requirements are incorporated in the final report.",
    date: "2024-10-20T09:15:00Z",
    caseID: "5-3000018"
  },
  {
    reviewer: "Chris Ekundare",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "Re-evaluate the treatment restrictions based on updated case metrics.",
    date: "2024-11-08T10:20:00Z",
    caseID: "5-3000019"
  },
  {
    reviewer: "Chris Ekundare",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 2,
    content:
      "Modify the feedback to align with the latest diagnostic evaluations.",
    date: "2024-11-30T11:30:00Z",
    caseID: "5-3000020"
  },

  // Reviewer 6: Dilay Ackan (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard, LTC)
  {
    reviewer: "Dilay Ackan",
    feedbackType: "client",
    client: "NYL",
    content:
      "Examine the claimant's file for recent updates and adjust the case notes accordingly.",
    date: "2024-09-28T08:40:00Z",
    caseID: "5-3000021"
  },
  {
    reviewer: "Dilay Ackan",
    feedbackType: "client",
    client: "LTC",
    content:
      "The report should incorporate all recent observations and patient history updates.",
    date: "2024-10-15T09:50:00Z",
    caseID: "5-3000022"
  },
  {
    reviewer: "Dilay Ackan",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 5,
    content:
      "Reassess the case restrictions based on updated clinical guidelines.",
    date: "2024-11-12T10:55:00Z",
    caseID: "5-3000023"
  },
  {
    reviewer: "Dilay Ackan",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Ensure that all revisions reflect the latest diagnostic test results.",
    date: "2024-12-03T11:45:00Z",
    caseID: "5-3000024"
  },

  // Reviewer 7: Ebenezer Arisa (clients: PFR, Lincoln, Hartford)
  {
    reviewer: "Ebenezer Arisa",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Review the current case file to update outdated information.",
    date: "2024-10-05T08:30:00Z",
    caseID: "5-3000025"
  },
  {
    reviewer: "Ebenezer Arisa",
    feedbackType: "client",
    client: "PFR",
    content:
      "Ensure all revisions are compliant with client-specific standards.",
    date: "2024-10-22T09:40:00Z",
    caseID: "5-3000026"
  },
  {
    reviewer: "Ebenezer Arisa",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Re-evaluate the claimant's restrictions in light of recent feedback.",
    date: "2024-11-15T10:50:00Z",
    caseID: "5-3000027"
  },
  {
    reviewer: "Ebenezer Arisa",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 4,
    content:
      "The feedback indicates a need for further adjustments in the case documentation.",
    date: "2024-12-07T11:55:00Z",
    caseID: "5-3000028"
  },

  // Reviewer 8: Emmanuel Uduigwome (clients: PFR, Lincoln, Hartford, NYL)
  {
    reviewer: "Emmanuel Uduigwome",
    feedbackType: "client",
    client: "NYL",
    content:
      "Please update the case report to include the latest clinical observations.",
    date: "2024-09-30T08:20:00Z",
    caseID: "5-3000029"
  },
  {
    reviewer: "Emmanuel Uduigwome",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Ensure the documentation reflects all recent updates in the claimant's status.",
    date: "2024-10-18T09:30:00Z",
    caseID: "5-3000030"
  },
  {
    reviewer: "Emmanuel Uduigwome",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "Review and adjust the case restrictions based on updated patient data.",
    date: "2024-11-10T10:40:00Z",
    caseID: "5-3000031"
  },
  {
    reviewer: "Emmanuel Uduigwome",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 5,
    content:
      "The revised report should clearly outline any changes to the treatment plan.",
    date: "2024-11-28T11:50:00Z",
    caseID: "5-3000032"
  },

  // Reviewer 9: Eliza Gomez (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL)
  {
    reviewer: "Eliza Gomez",
    feedbackType: "client",
    client: "Peer Review",
    content:
      "Incorporate the latest evaluation results into the case documentation.",
    date: "2024-10-10T08:25:00Z",
    caseID: "5-3000033"
  },
  {
    reviewer: "Eliza Gomez",
    feedbackType: "client",
    client: "NYL",
    content:
      "Update the case narrative with the newest clinical feedback available.",
    date: "2024-10-28T09:35:00Z",
    caseID: "5-3000034"
  },
  {
    reviewer: "Eliza Gomez",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 2,
    content:
      "Review the claimant's progress and adjust the restrictions as needed.",
    date: "2024-11-15T10:45:00Z",
    caseID: "5-3000035"
  },
  {
    reviewer: "Eliza Gomez",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "Ensure that the revised report includes updated diagnostic details.",
    date: "2024-12-05T11:55:00Z",
    caseID: "5-3000036"
  },

  // Reviewer 10: Erika Sucgang (clients: PFR, Lincoln, Hartford)
  {
    reviewer: "Erika Sucgang",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The report should integrate the latest clinical evaluations for better accuracy.",
    date: "2024-09-22T08:10:00Z",
    caseID: "5-3000037"
  },
  {
    reviewer: "Erika Sucgang",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Ensure all revisions adhere to the latest client requirements.",
    date: "2024-10-12T09:20:00Z",
    caseID: "5-3000038"
  },
  {
    reviewer: "Erika Sucgang",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Update the case restrictions based on the latest feedback from the clinical team.",
    date: "2024-11-05T10:30:00Z",
    caseID: "5-3000039"
  },
  {
    reviewer: "Erika Sucgang",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "Reassess the documentation to ensure consistency with updated treatment protocols.",
    date: "2024-11-25T11:40:00Z",
    caseID: "5-3000040"
  },

  // Reviewer 11: Geni Payales (clients: PFR)
  {
    reviewer: "Geni Payales",
    feedbackType: "client",
    client: "PFR",
    content:
      "The evaluation indicates a positive trend in patient progress; update accordingly.",
    date: "2024-09-18T08:05:00Z",
    caseID: "5-3000041"
  },
  {
    reviewer: "Geni Payales",
    feedbackType: "client",
    client: "PFR",
    content:
      "Ensure that the case notes reflect all recent clinical observations.",
    date: "2024-10-08T09:15:00Z",
    caseID: "5-3000042"
  },
  {
    reviewer: "Geni Payales",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Reassess the restrictions in light of updated diagnostic results.",
    date: "2024-10-28T10:25:00Z",
    caseID: "5-3000043"
  },
  {
    reviewer: "Geni Payales",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 2,
    content:
      "Update the documentation to incorporate the latest treatment modifications.",
    date: "2024-11-18T11:35:00Z",
    caseID: "5-3000044"
  },

  // Reviewer 12: Ieva Puidoke (clients: PFR, Lincoln, Hartford, Peer Review, Telco)
  {
    reviewer: "Ieva Puidoke",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Review the claimant's updated file and ensure all modifications are included.",
    date: "2024-09-25T08:40:00Z",
    caseID: "5-3000045"
  },
  {
    reviewer: "Ieva Puidoke",
    feedbackType: "client",
    client: "Peer Review",
    content:
      "Ensure that the feedback accurately reflects recent clinical findings.",
    date: "2024-10-15T09:50:00Z",
    caseID: "5-3000046"
  },
  {
    reviewer: "Ieva Puidoke",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "The case documentation requires refinement to better capture the updated data.",
    date: "2024-11-05T10:55:00Z",
    caseID: "5-3000047"
  },
  {
    reviewer: "Ieva Puidoke",
    feedbackType: "internal",
    client: "Telco",
    qaMember: 4,
    content:
      "Review the case notes for accuracy and update them with the latest observations.",
    date: "2024-11-28T11:05:00Z",
    caseID: "5-3000048"
  },

  // Reviewer 13: Ileri Lawal (clients: PFR)
  {
    reviewer: "Ileri Lawal",
    feedbackType: "client",
    client: "PFR",
    content:
      "Ensure that the case revisions include detailed notes on patient progress.",
    date: "2024-09-30T08:50:00Z",
    caseID: "5-3000049"
  },
  {
    reviewer: "Ileri Lawal",
    feedbackType: "client",
    client: "PFR",
    content:
      "Update the report to include all necessary adjustments based on recent findings.",
    date: "2024-10-22T09:55:00Z",
    caseID: "5-3000050"
  },
  {
    reviewer: "Ileri Lawal",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Reassess the case restrictions in light of the latest clinical evaluations.",
    date: "2024-11-12T10:40:00Z",
    caseID: "5-3000051"
  },
  {
    reviewer: "Ileri Lawal",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 2,
    content:
      "Ensure the report is updated with all recent diagnostic information.",
    date: "2024-12-03T11:45:00Z",
    caseID: "5-3000052"
  },

  // Reviewer 14: Iyanuoluwa Oni (clients: PFR, Lincoln, Hartford, Peer Review, LTC)
  {
    reviewer: "Iyanuoluwa Oni",
    feedbackType: "client",
    client: "Hartford",
    content:
      "The claimant's case file requires a detailed update based on recent evaluations.",
    date: "2024-09-28T08:30:00Z",
    caseID: "5-3000053"
  },
  {
    reviewer: "Iyanuoluwa Oni",
    feedbackType: "client",
    client: "LTC",
    content:
      "Review the treatment guidelines and update the case documentation accordingly.",
    date: "2024-10-18T09:40:00Z",
    caseID: "5-3000054"
  },
  {
    reviewer: "Iyanuoluwa Oni",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Ensure that all recent clinical data is incorporated into the feedback.",
    date: "2024-11-08T10:50:00Z",
    caseID: "5-3000055"
  },
  {
    reviewer: "Iyanuoluwa Oni",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Reassess the current case restrictions and update the report as needed.",
    date: "2024-11-30T11:55:00Z",
    caseID: "5-3000056"
  },

  // Reviewer 15: Joshua Arisa (clients: PFR, Lincoln, LTC)
  {
    reviewer: "Joshua Arisa",
    feedbackType: "client",
    client: "PFR",
    content:
      "The latest review suggests an update to the case notes for improved clarity.",
    date: "2024-09-22T08:15:00Z",
    caseID: "5-3000057"
  },
  {
    reviewer: "Joshua Arisa",
    feedbackType: "client",
    client: "LTC",
    content:
      "Ensure that the revised report includes a detailed account of the claimant's progress.",
    date: "2024-10-10T09:25:00Z",
    caseID: "5-3000058"
  },
  {
    reviewer: "Joshua Arisa",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "Review recent updates and modify the case restrictions accordingly.",
    date: "2024-11-05T10:30:00Z",
    caseID: "5-3000059"
  },
  {
    reviewer: "Joshua Arisa",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 4,
    content:
      "Ensure that all modifications are clearly detailed in the case documentation.",
    date: "2024-11-28T11:40:00Z",
    caseID: "5-3000060"
  },

  // Reviewer 16: Joan Ajayi (clients: PFR, Lincoln, Hartford, Muckleshoot)
  {
    reviewer: "Joan Ajayi",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Update the case report to incorporate recent clinical insights.",
    date: "2024-09-25T08:35:00Z",
    caseID: "5-3000061"
  },
  {
    reviewer: "Joan Ajayi",
    feedbackType: "client",
    client: "Muckleshoot",
    content:
      "Ensure the documentation reflects all recent patient assessments.",
    date: "2024-10-15T09:45:00Z",
    caseID: "5-3000062"
  },
  {
    reviewer: "Joan Ajayi",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Review the case notes and update them with the latest diagnostic data.",
    date: "2024-11-10T10:50:00Z",
    caseID: "5-3000063"
  },
  {
    reviewer: "Joan Ajayi",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Reassess the current treatment guidelines and adjust the restrictions accordingly.",
    date: "2024-11-30T11:55:00Z",
    caseID: "5-3000064"
  },

  // Reviewer 17: Khwaish Vasnani (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard, LTC)
  {
    reviewer: "Khwaish Vasnani",
    feedbackType: "client",
    client: "NYL",
    content:
      "The report should include comprehensive details of the claimant's recent evaluations.",
    date: "2024-09-28T08:20:00Z",
    caseID: "5-3000065"
  },
  {
    reviewer: "Khwaish Vasnani",
    feedbackType: "client",
    client: "LTC",
    content:
      "Ensure that all revisions reflect the latest patient data accurately.",
    date: "2024-10-18T09:30:00Z",
    caseID: "5-3000066"
  },
  {
    reviewer: "Khwaish Vasnani",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "Review the claimant's latest diagnostic tests to update the treatment plan.",
    date: "2024-11-12T10:40:00Z",
    caseID: "5-3000067"
  },
  {
    reviewer: "Khwaish Vasnani",
    feedbackType: "internal",
    client: "Peer Review",
    qaMember: 4,
    content:
      "Detailed review of the case indicates that further adjustments are needed.",
    date: "2024-12-02T11:50:00Z",
    caseID: "5-3000068"
  },

  // Reviewer 18: Lina Gutierrez (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard)
  {
    reviewer: "Lina Gutierrez",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Revise the case documentation to include the most recent clinical updates.",
    date: "2024-09-20T08:10:00Z",
    caseID: "5-3000069"
  },
  {
    reviewer: "Lina Gutierrez",
    feedbackType: "client",
    client: "Standard",
    content:
      "Ensure that the report captures all critical changes in the claimant's condition.",
    date: "2024-10-10T09:20:00Z",
    caseID: "5-3000070"
  },
  {
    reviewer: "Lina Gutierrez",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 1,
    content:
      "Review the latest patient progress and update the case restrictions accordingly.",
    date: "2024-11-05T10:30:00Z",
    caseID: "5-3000071"
  },
  {
    reviewer: "Lina Gutierrez",
    feedbackType: "internal",
    client: "NYL",
    qaMember: 2,
    content:
      "Ensure the revised report includes detailed updates from recent assessments.",
    date: "2024-11-28T11:35:00Z",
    caseID: "5-3000072"
  },

  // Reviewer 19: Mary Goyenechea (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard)
  {
    reviewer: "Mary Goyenechea",
    feedbackType: "client",
    client: "PFR",
    content:
      "The case file should be updated to reflect the latest clinical evaluations.",
    date: "2024-09-25T08:15:00Z",
    caseID: "5-3000073"
  },
  {
    reviewer: "Mary Goyenechea",
    feedbackType: "client",
    client: "Telco",
    content:
      "Ensure that all recent diagnostic findings are included in the updated report.",
    date: "2024-10-15T09:25:00Z",
    caseID: "5-3000074"
  },
  {
    reviewer: "Mary Goyenechea",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "Reassess the claimant's restrictions based on the most recent clinical data.",
    date: "2024-11-10T10:30:00Z",
    caseID: "5-3000075"
  },
  {
    reviewer: "Mary Goyenechea",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 4,
    content:
      "Update the case narrative to clearly reflect any changes in treatment guidelines.",
    date: "2024-11-28T11:40:00Z",
    caseID: "5-3000076"
  },

  // Reviewer 20: Mary Galos (clients: PFR, Lincoln, Hartford, NYL)
  {
    reviewer: "Mary Galos",
    feedbackType: "client",
    client: "NYL",
    content:
      "Incorporate the latest treatment outcomes into the case report for a comprehensive update.",
    date: "2024-09-30T08:05:00Z",
    caseID: "5-3000077"
  },
  {
    reviewer: "Mary Galos",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Ensure the report includes a detailed review of the claimant's progress.",
    date: "2024-10-20T09:10:00Z",
    caseID: "5-3000078"
  },
  {
    reviewer: "Mary Galos",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Review and update the case documentation with the latest clinical insights.",
    date: "2024-11-05T10:15:00Z",
    caseID: "5-3000079"
  },
  {
    reviewer: "Mary Galos",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Ensure that all changes in the treatment plan are clearly documented.",
    date: "2024-11-25T11:20:00Z",
    caseID: "5-3000080"
  },

  // Reviewer 21: Maja Loja (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard)
  {
    reviewer: "Maja Loja",
    feedbackType: "client",
    client: "Peer Review",
    content:
      "The case revisions should reflect the most recent clinical evaluations.",
    date: "2024-10-02T08:30:00Z",
    caseID: "5-3000081"
  },
  {
    reviewer: "Maja Loja",
    feedbackType: "client",
    client: "PFR",
    content:
      "Update the case file to include a comprehensive review of recent diagnostic tests.",
    date: "2024-10-22T09:40:00Z",
    caseID: "5-3000082"
  },
  {
    reviewer: "Maja Loja",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "Review the claimant's progress and adjust the restrictions as needed.",
    date: "2024-11-12T10:45:00Z",
    caseID: "5-3000083"
  },
  {
    reviewer: "Maja Loja",
    feedbackType: "internal",
    client: "Standard",
    qaMember: 4,
    content:
      "Incorporate detailed insights from recent assessments into the revised report.",
    date: "2024-11-30T11:50:00Z",
    caseID: "5-3000084"
  },
  {
    reviewer: "Maja Loja",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Ensure that the case report accurately reflects all recent clinical observations.",
    date: "2024-10-05T08:20:00Z",
    caseID: "5-3000085"
  },
  {
    reviewer: "Maja Loja",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Update the report with comprehensive details from the latest diagnostic evaluations.",
    date: "2024-10-25T09:30:00Z",
    caseID: "5-3000086"
  },
  {
    reviewer: "Maja Loja",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Reassess the treatment guidelines and update the case restrictions accordingly.",
    date: "2024-11-15T10:35:00Z",
    caseID: "5-3000087"
  },
  {
    reviewer: "Maja Loja",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Ensure the documentation includes all necessary modifications based on recent findings.",
    date: "2024-11-28T11:40:00Z",
    caseID: "5-3000088"
  },

  // Reviewer 22: Oluseye Oluremi (clients: PFR, Lincoln, Hartford, Standard)
  {
    reviewer: "Oluseye Oluremi",
    feedbackType: "client",
    client: "Standard",
    content:
      "Review the current case file for any discrepancies and update accordingly.",
    date: "2024-10-10T08:25:00Z",
    caseID: "5-3000089"
  },
  {
    reviewer: "Oluseye Oluremi",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Ensure that the case narrative reflects all recent clinical updates.",
    date: "2024-10-28T09:35:00Z",
    caseID: "5-3000090"
  },
  {
    reviewer: "Oluseye Oluremi",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Additional details are required in the case notes to reflect recent evaluations.",
    date: "2024-11-15T10:45:00Z",
    caseID: "5-3000091"
  },
  {
    reviewer: "Oluseye Oluremi",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Update the report to include all relevant modifications based on the latest tests.",
    date: "2024-11-30T11:55:00Z",
    caseID: "5-3000092"
  },

  // Reviewer 23: Oluwadamilola Ogunsemowo (clients: PFR, Lincoln, Hartford, Standard)
  {
    reviewer: "Oluwadamilola Ogunsemowo",
    feedbackType: "client",
    client: "PFR",
    content:
      "Examine the case file for any outdated information and update as needed.",
    date: "2024-10-12T08:30:00Z",
    caseID: "5-3000093"
  },
  {
    reviewer: "Oluwadamilola Ogunsemowo",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Ensure that the case report includes comprehensive details from the latest review.",
    date: "2024-10-30T09:40:00Z",
    caseID: "5-3000094"
  },
  {
    reviewer: "Oluwadamilola Ogunsemowo",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 1,
    content:
      "Review and update the case notes to reflect new clinical data.",
    date: "2024-11-18T10:50:00Z",
    caseID: "5-3000095"
  },
  {
    reviewer: "Oluwadamilola Ogunsemowo",
    feedbackType: "internal",
    client: "Standard",
    qaMember: 2,
    content:
      "Ensure all recent feedback is clearly documented in the updated report.",
    date: "2024-12-08T11:55:00Z",
    caseID: "5-3000096"
  },

  // Reviewer 24: Thomas Oyinlola (clients: PFR, Lincoln, Hartford, Peer Review, Standard)
  {
    reviewer: "Thomas Oyinlola",
    feedbackType: "client",
    client: "Peer Review",
    content:
      "Incorporate the latest clinical evaluations into the case documentation.",
    date: "2024-10-05T08:15:00Z",
    caseID: "5-3000097"
  },
  {
    reviewer: "Thomas Oyinlola",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Update the report with a detailed review of recent diagnostic findings.",
    date: "2024-10-25T09:25:00Z",
    caseID: "5-3000098"
  },
  {
    reviewer: "Thomas Oyinlola",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "Review the latest patient data to adjust the case restrictions appropriately.",
    date: "2024-11-15T10:30:00Z",
    caseID: "5-3000099"
  },
  {
    reviewer: "Thomas Oyinlola",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "Ensure that all modifications are accurately reflected in the revised report.",
    date: "2024-11-30T11:40:00Z",
    caseID: "5-3000100"
  },

  // Reviewer 25: Ravit Haleva
  {
    reviewer: "Ravit Haleva",
    feedbackType: "client",
    client: "PFR",
    content:
      "Please review the claimant's activity levels and adjust the restrictions accordingly.",
    date: "2024-10-12T08:15:00Z",
    caseID: "5-2000101"
  },
  {
    reviewer: "Ravit Haleva",
    feedbackType: "client",
    client: "NYL",
    content:
      "The case documentation requires additional context regarding the claimant's recent medical tests.",
    date: "2024-11-05T09:22:00Z",
    caseID: "5-2000102"
  },
  {
    reviewer: "Ravit Haleva",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "Observed improvements in compliance suggest the current restrictions might be slightly relaxed.",
    date: "2024-12-20T10:05:00Z",
    caseID: "5-2000103"
  },
  {
    reviewer: "Ravit Haleva",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 2,
    content:
      "The claimant's detailed history indicates that further diagnostic evaluation could be beneficial.",
    date: "2025-01-07T11:40:00Z",
    caseID: "5-2000104"
  },

  // Reviewer 26: Sarah Watkins (clients: Standard)
  {
    reviewer: "Sarah Watkins",
    feedbackType: "client",
    client: "Standard",
    content:
      "An update to the case summary with the latest physical exam findings is recommended.",
    date: "2024-09-25T08:50:00Z",
    caseID: "5-2000105"
  },
  {
    reviewer: "Sarah Watkins",
    feedbackType: "client",
    client: "Standard",
    content:
      "Consider re-assessing the claimant's progress based on the updated lab results.",
    date: "2024-10-10T09:30:00Z",
    caseID: "5-2000106"
  },
  {
    reviewer: "Sarah Watkins",
    feedbackType: "internal",
    client: "Standard",
    qaMember: 3,
    content:
      "The review highlights the need for enhanced clarity in the case narrative.",
    date: "2024-11-15T10:20:00Z",
    caseID: "5-2000107"
  },
  {
    reviewer: "Sarah Watkins",
    feedbackType: "internal",
    client: "Standard",
    qaMember: 4,
    content:
      "Inconsistencies in the reported data require further clarification for a comprehensive assessment.",
    date: "2024-12-01T11:10:00Z",
    caseID: "5-2000108"
  },

  // Reviewer 27: Shaila Maramara (clients: PFR, Lincoln, Hartford, Standard)
  {
    reviewer: "Shaila Maramara",
    feedbackType: "client",
    client: "PFR",
    content:
      "The claimant's progress report indicates a stable condition, though minor adjustments may be warranted.",
    date: "2024-10-30T08:35:00Z",
    caseID: "5-2000109"
  },
  {
    reviewer: "Shaila Maramara",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Re-evaluate the current treatment plan in light of the updated imaging results.",
    date: "2024-11-22T09:45:00Z",
    caseID: "5-2000110"
  },
  {
    reviewer: "Shaila Maramara",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 1,
    content:
      "The current restrictions align well with the claimant's performance metrics, but additional data may refine the approach.",
    date: "2024-12-15T10:55:00Z",
    caseID: "5-2000111"
  },
  {
    reviewer: "Shaila Maramara",
    feedbackType: "internal",
    client: "Standard",
    qaMember: 2,
    content:
      "A detailed analysis of the claimant's response to therapy supports a modification of the prescribed restrictions.",
    date: "2025-01-05T11:05:00Z",
    caseID: "5-2000112"
  },

  // Reviewer 28: Vincent Medicielo (clients: PFR, NYL)
  {
    reviewer: "Vincent Medicielo",
    feedbackType: "client",
    client: "PFR",
    content:
      "Please consider incorporating recent feedback from the latest consultation into the report.",
    date: "2024-10-08T08:10:00Z",
    caseID: "5-2000113"
  },
  {
    reviewer: "Vincent Medicielo",
    feedbackType: "client",
    client: "NYL",
    content:
      "The evaluation should factor in the claimant's improved mobility and reduced symptom severity.",
    date: "2024-11-12T09:15:00Z",
    caseID: "5-2000114"
  },
  {
    reviewer: "Vincent Medicielo",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "Further review of the claimant's long-term treatment outcomes is advised for optimal case management.",
    date: "2024-12-03T10:30:00Z",
    caseID: "5-2000115"
  },
  {
    reviewer: "Vincent Medicielo",
    feedbackType: "internal",
    client: "NYL",
    qaMember: 4,
    content:
      "Re-assess the claimant's progress based on recent treatment adjustments.",
    date: "2025-01-02T11:45:00Z",
    caseID: "5-2000116"
  },

  // Reviewer 29: Will Smith (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard)
  {
    reviewer: "Will Smith",
    feedbackType: "client",
    client: "PFR",
    content:
      "The case narrative needs to integrate updated clinical observations for a comprehensive report.",
    date: "2024-09-30T08:25:00Z",
    caseID: "5-2000117"
  },
  {
    reviewer: "Will Smith",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Revisions should include an analysis of the claimant's latest functional assessments.",
    date: "2024-10-20T09:35:00Z",
    caseID: "5-2000118"
  },
  {
    reviewer: "Will Smith",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 1,
    content:
      "Updated diagnostic tests support a revision of the current restrictions.",
    date: "2024-11-18T10:40:00Z",
    caseID: "5-2000119"
  },
  {
    reviewer: "Will Smith",
    feedbackType: "internal",
    client: "Peer Review",
    qaMember: 2,
    content:
      "The feedback suggests that a multi-disciplinary review could improve the case outcome.",
    date: "2024-12-09T11:50:00Z",
    caseID: "5-2000120"
  },

  // Reviewer 30: Yllana Saavedra (clients: PFR)
  {
    reviewer: "Yllana Saavedra",
    feedbackType: "client",
    client: "PFR",
    content:
      "The latest evaluation indicates a need for enhanced case documentation.",
    date: "2024-10-05T08:15:00Z",
    caseID: "5-2000121"
  },
  {
    reviewer: "Yllana Saavedra",
    feedbackType: "client",
    client: "PFR",
    content:
      "Current feedback suggests potential for minor adjustments in the treatment plan.",
    date: "2024-11-01T09:25:00Z",
    caseID: "5-2000122"
  },
  {
    reviewer: "Yllana Saavedra",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "Reassess the claimant's restrictions in light of the new clinical data.",
    date: "2024-11-28T10:35:00Z",
    caseID: "5-2000123"
  },
  {
    reviewer: "Yllana Saavedra",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 4,
    content:
      "Detailed analysis of the case indicates that additional review is necessary.",
    date: "2024-12-16T11:45:00Z",
    caseID: "5-2000124"
  },

  // Reviewer 31: Temilola Edun (clients: PFR)
  {
    reviewer: "Temilola Edun",
    feedbackType: "client",
    client: "PFR",
    content:
      "Case notes should incorporate recent observations from the latest consultation.",
    date: "2024-10-15T08:05:00Z",
    caseID: "5-2000125"
  },
  {
    reviewer: "Temilola Edun",
    feedbackType: "client",
    client: "PFR",
    content:
      "The treatment plan may benefit from updated diagnostic information.",
    date: "2024-11-07T09:15:00Z",
    caseID: "5-2000126"
  },
  {
    reviewer: "Temilola Edun",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Further details are needed to reconcile discrepancies in the reported data.",
    date: "2024-11-30T10:25:00Z",
    caseID: "5-2000127"
  },
  {
    reviewer: "Temilola Edun",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 2,
    content:
      "Consider a re-evaluation of the claimant's clinical progress for more accurate restrictions.",
    date: "2024-12-20T11:35:00Z",
    caseID: "5-2000128"
  },

  // Reviewer 32: Toluwani Merari (clients: PFR, Lincoln)
  {
    reviewer: "Toluwani Merari",
    feedbackType: "client",
    client: "PFR",
    content:
      "The report should integrate the latest functional assessments for accuracy.",
    date: "2024-10-22T08:10:00Z",
    caseID: "5-2000129"
  },
  {
    reviewer: "Toluwani Merari",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Revisions must address gaps in the current case narrative.",
    date: "2024-11-18T09:20:00Z",
    caseID: "5-2000130"
  },
  {
    reviewer: "Toluwani Merari",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "Review the recent diagnostic results to update the case restrictions appropriately.",
    date: "2024-12-10T10:30:00Z",
    caseID: "5-2000131"
  },
  {
    reviewer: "Toluwani Merari",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "The case analysis reveals a need for additional clinical context.",
    date: "2025-01-02T11:40:00Z",
    caseID: "5-2000132"
  },

  // Reviewer 33: Oluwapelumi Gabriel (clients: PFR, Lincoln)
  {
    reviewer: "Oluwapelumi Gabriel",
    feedbackType: "client",
    client: "PFR",
    content:
      "Updated clinical observations indicate that the case summary requires a more detailed narrative.",
    date: "2024-10-30T08:30:00Z",
    caseID: "5-2000133"
  },
  {
    reviewer: "Oluwapelumi Gabriel",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "A comprehensive review of the claimant's condition is needed for optimal case management.",
    date: "2024-11-25T09:35:00Z",
    caseID: "5-2000134"
  },
  {
    reviewer: "Oluwapelumi Gabriel",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "Ensure that all relevant clinical data is reflected in the revision notes.",
    date: "2024-12-15T10:45:00Z",
    caseID: "5-2000135"
  },
  {
    reviewer: "Oluwapelumi Gabriel",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "The current restrictions could be refined with further input from recent tests.",
    date: "2025-01-05T11:55:00Z",
    caseID: "5-2000136"
  },

  // Reviewer 34: Tolulope Ajayi (clients: PFR, Lincoln)
  {
    reviewer: "Tolulope Ajayi",
    feedbackType: "client",
    client: "PFR",
    content:
      "Integrate updated imaging results into the case documentation for clarity.",
    date: "2024-10-18T08:20:00Z",
    caseID: "5-2000137"
  },
  {
    reviewer: "Tolulope Ajayi",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Current revisions should include a detailed account of recent clinical evaluations.",
    date: "2024-11-10T09:25:00Z",
    caseID: "5-2000138"
  },
  {
    reviewer: "Tolulope Ajayi",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 3,
    content:
      "Review recent laboratory findings to reassess the existing treatment plan.",
    date: "2024-12-05T10:35:00Z",
    caseID: "5-2000139"
  },
  {
    reviewer: "Tolulope Ajayi",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "The narrative suggests that further diagnostic details are necessary for a complete assessment.",
    date: "2025-01-02T11:45:00Z",
    caseID: "5-2000140"
  },

  // Reviewer 35: Addison Marimberga (clients: PFR, Lincoln, Hartford, Peer Review, Telco, NYL, Standard)
  {
    reviewer: "Addison Marimberga",
    feedbackType: "client",
    client: "Hartford",
    content:
      "The claimant's condition appears stable; however, a slight modification in restrictions may be beneficial.",
    date: "2024-10-12T08:15:00Z",
    caseID: "5-2000141"
  },
  {
    reviewer: "Addison Marimberga",
    feedbackType: "client",
    client: "Peer Review",
    content:
      "Consider revising the case documentation to reflect the latest treatment outcomes.",
    date: "2024-11-03T09:25:00Z",
    caseID: "5-2000142"
  },
  {
    reviewer: "Addison Marimberga",
    feedbackType: "internal",
    client: "PFR",
    qaMember: 1,
    content:
      "An analysis of recent patient progress supports a minor adjustment in the case restrictions.",
    date: "2024-11-28T10:30:00Z",
    caseID: "5-2000143"
  },
  {
    reviewer: "Addison Marimberga",
    feedbackType: "internal",
    client: "NYL",
    qaMember: 2,
    content:
      "Review and update the current narrative to include recent diagnostic improvements.",
    date: "2024-12-20T11:40:00Z",
    caseID: "5-2000144"
  },

  // Reviewer 36: Goodluck Odii (clients: Lincoln)
  {
    reviewer: "Goodluck Odii",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The case review highlights the need for improved documentation of clinical progress.",
    date: "2024-10-05T08:10:00Z",
    caseID: "5-2000145"
  },
  {
    reviewer: "Goodluck Odii",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Ensure that the latest examination results are accurately reflected in the case notes.",
    date: "2024-11-01T09:15:00Z",
    caseID: "5-2000146"
  },
  {
    reviewer: "Goodluck Odii",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "It is advised to reassess the claimant's treatment plan based on updated clinical observations.",
    date: "2024-11-25T10:20:00Z",
    caseID: "5-2000147"
  },
  {
    reviewer: "Goodluck Odii",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "Further review of the reported data indicates that revisions are necessary for clarity.",
    date: "2024-12-10T11:30:00Z",
    caseID: "5-2000148"
  },

  // Reviewer 37: Fiyinfoluwa Yemi-Lebi (clients: Lincoln, Hartford)
  {
    reviewer: "Fiyinfoluwa Yemi-Lebi",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Recent evaluations suggest that a comprehensive update of the case summary is required.",
    date: "2024-10-18T08:00:00Z",
    caseID: "5-2000149"
  },
  {
    reviewer: "Fiyinfoluwa Yemi-Lebi",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Integrate detailed observations from the latest consultation into the report.",
    date: "2024-11-12T09:10:00Z",
    caseID: "5-2000150"
  },
  {
    reviewer: "Fiyinfoluwa Yemi-Lebi",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "Re-assess the current restrictions considering the latest patient progress data.",
    date: "2024-12-04T10:20:00Z",
    caseID: "5-2000151"
  },
  {
    reviewer: "Fiyinfoluwa Yemi-Lebi",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 2,
    content:
      "The case analysis indicates that additional clinical details should be incorporated for accuracy.",
    date: "2024-12-28T11:30:00Z",
    caseID: "5-2000152"
  },

  // Reviewer 38: Elizabeth Adeyanju (clients: Lincoln, Standard)
  {
    reviewer: "Elizabeth Adeyanju",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Review the claimant's recent assessments and update the case narrative accordingly.",
    date: "2024-10-25T08:05:00Z",
    caseID: "5-2000153"
  },
  {
    reviewer: "Elizabeth Adeyanju",
    feedbackType: "client",
    client: "Standard",
    content:
      "Consider a revision that includes detailed insights from the latest diagnostic tests.",
    date: "2024-11-17T09:15:00Z",
    caseID: "5-2000154"
  },
  {
    reviewer: "Elizabeth Adeyanju",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "Enhanced clarity in documentation is needed to better reflect the clinical findings.",
    date: "2024-12-08T10:25:00Z",
    caseID: "5-2000155"
  },
  {
    reviewer: "Elizabeth Adeyanju",
    feedbackType: "internal",
    client: "Standard",
    qaMember: 4,
    content:
      "A thorough review of the treatment plan suggests that updated restrictions may be appropriate.",
    date: "2024-12-30T11:35:00Z",
    caseID: "5-2000156"
  },

  // Reviewer 39: Opemipo Ade-Akingboye (clients: Lincoln)
  {
    reviewer: "Opemipo Ade-Akingboye",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Ensure that the case report integrates the most recent clinical evaluations seamlessly.",
    date: "2024-10-10T08:20:00Z",
    caseID: "5-2000157"
  },
  {
    reviewer: "Opemipo Ade-Akingboye",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The revision should reflect a comprehensive analysis of the claimant's functional status.",
    date: "2024-11-03T09:25:00Z",
    caseID: "5-2000158"
  },
  {
    reviewer: "Opemipo Ade-Akingboye",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "A review of recent diagnostic data supports a modification of the current restrictions.",
    date: "2024-11-27T10:30:00Z",
    caseID: "5-2000159"
  },
  {
    reviewer: "Opemipo Ade-Akingboye",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Additional narrative details are required to fully capture the claimant's progress.",
    date: "2024-12-19T11:40:00Z",
    caseID: "5-2000160"
  },

  // Reviewer 40: Lebari Damgbor (clients: Lincoln, Hartford)
  {
    reviewer: "Lebari Damgbor",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The current case narrative needs to be updated with the latest patient feedback.",
    date: "2024-10-05T08:12:00Z",
    caseID: "5-2000161"
  },
  {
    reviewer: "Lebari Damgbor",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Consider re-assessing the claimant's restrictions after the recent lab results.",
    date: "2024-11-01T09:15:00Z",
    caseID: "5-2000162"
  },
  {
    reviewer: "Lebari Damgbor",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "The documentation requires additional clarification to match updated clinical guidelines.",
    date: "2024-11-20T10:20:00Z",
    caseID: "5-2000163"
  },
  {
    reviewer: "Lebari Damgbor",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 2,
    content:
      "Ensure that all modifications are clearly reflected in the case history.",
    date: "2024-12-10T11:30:00Z",
    caseID: "5-2000164"
  },

  // Reviewer 41: Uchechukwu Ejike (clients: Lincoln, Hartford)
  {
    reviewer: "Uchechukwu Ejike",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "A comprehensive review of the case details is needed to address minor discrepancies.",
    date: "2024-10-12T08:45:00Z",
    caseID: "5-2000165"
  },
  {
    reviewer: "Uchechukwu Ejike",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Updated patient information suggests the need for revising current restrictions.",
    date: "2024-10-28T09:50:00Z",
    caseID: "5-2000166"
  },
  {
    reviewer: "Uchechukwu Ejike",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "The claimant's file should incorporate the latest clinical observations for accuracy.",
    date: "2024-11-15T10:55:00Z",
    caseID: "5-2000167"
  },
  {
    reviewer: "Uchechukwu Ejike",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 4,
    content:
      "Consider cross-checking the updated records to ensure consistency across all reports.",
    date: "2024-12-05T11:35:00Z",
    caseID: "5-2000168"
  },

  // Reviewer 42: Oluwaseyi Adare (clients: Lincoln, Hartford)
  {
    reviewer: "Oluwaseyi Adare",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The case file reflects a need for enhanced detail regarding patient progress.",
    date: "2024-10-20T08:30:00Z",
    caseID: "5-2000169"
  },
  {
    reviewer: "Oluwaseyi Adare",
    feedbackType: "client",
    client: "Hartford",
    content:
      "Review the current documentation to ensure it aligns with updated diagnostic results.",
    date: "2024-11-10T09:40:00Z",
    caseID: "5-2000170"
  },
  {
    reviewer: "Oluwaseyi Adare",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "Additional details are needed in the case narrative to reflect recent clinical evaluations.",
    date: "2024-11-25T10:50:00Z",
    caseID: "5-2000171"
  },
  {
    reviewer: "Oluwaseyi Adare",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 2,
    content:
      "The report should be updated to incorporate new findings from the latest tests.",
    date: "2024-12-15T11:55:00Z",
    caseID: "5-2000172"
  },

  // Reviewer 43: Mariam Akubo (clients: Lincoln, Hartford)
  {
    reviewer: "Mariam Akubo",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Ensure the case documentation includes comprehensive details from the latest assessment.",
    date: "2024-10-25T08:20:00Z",
    caseID: "5-2000173"
  },
  {
    reviewer: "Mariam Akubo",
    feedbackType: "client",
    client: "Hartford",
    content:
      "The revision should address recent updates in the claimant's treatment plan.",
    date: "2024-11-18T09:30:00Z",
    caseID: "5-2000174"
  },
  {
    reviewer: "Mariam Akubo",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "There is a need for additional explanation of the treatment modifications in the case report.",
    date: "2024-12-05T10:40:00Z",
    caseID: "5-2000175"
  },
  {
    reviewer: "Mariam Akubo",
    feedbackType: "internal",
    client: "Hartford",
    qaMember: 4,
    content:
      "Update the narrative to clearly outline changes in the diagnostic findings.",
    date: "2024-12-25T11:45:00Z",
    caseID: "5-2000176"
  },

  // Reviewer 44: Jamiu Olurunnisola (clients: Lincoln)
  {
    reviewer: "Jamiu Olurunnisola",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "A focused review of the claimant's file suggests a need for minor revisions.",
    date: "2024-11-02T08:10:00Z",
    caseID: "5-2000177"
  },
  {
    reviewer: "Jamiu Olurunnisola",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The current restrictions may benefit from incorporating updated examination results.",
    date: "2024-11-20T09:15:00Z",
    caseID: "5-2000178"
  },
  {
    reviewer: "Jamiu Olurunnisola",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "Review the latest patient data to refine the case documentation.",
    date: "2024-12-10T10:20:00Z",
    caseID: "5-2000179"
  },
  {
    reviewer: "Jamiu Olurunnisola",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 2,
    content:
      "Ensure the updated report includes all relevant clinical findings.",
    date: "2024-12-28T11:30:00Z",
    caseID: "5-2000180"
  },

  // Reviewer 45: Al Ameen Kalejaiye (clients: Lincoln)
  {
    reviewer: "Al Ameen Kalejaiye",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The case report should be enhanced with recent observations from the latest review.",
    date: "2024-10-15T08:00:00Z",
    caseID: "5-2000181"
  },
  {
    reviewer: "Al Ameen Kalejaiye",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Consider including a detailed analysis of the claimant's progress in the revision.",
    date: "2024-11-05T09:10:00Z",
    caseID: "5-2000182"
  },
  {
    reviewer: "Al Ameen Kalejaiye",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "A comprehensive update of the case details is recommended based on recent assessments.",
    date: "2024-11-25T10:20:00Z",
    caseID: "5-2000183"
  },
  {
    reviewer: "Al Ameen Kalejaiye",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "The documentation must be revised to include all pertinent clinical information.",
    date: "2024-12-15T11:30:00Z",
    caseID: "5-2000184"
  },

  // Reviewer 46: Solomon Bailey (clients: Lincoln, NYL)
  {
    reviewer: "Solomon Bailey",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "The current report requires updates to incorporate the latest functional evaluations.",
    date: "2024-10-22T08:30:00Z",
    caseID: "5-2000185"
  },
  {
    reviewer: "Solomon Bailey",
    feedbackType: "client",
    client: "NYL",
    content:
      "Revisions should reflect a thorough review of the claimant's recent progress.",
    date: "2024-11-12T09:40:00Z",
    caseID: "5-2000186"
  },
  {
    reviewer: "Solomon Bailey",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 1,
    content:
      "The evaluation suggests that updated clinical data should inform the case revisions.",
    date: "2024-12-02T10:50:00Z",
    caseID: "5-2000187"
  },
  {
    reviewer: "Solomon Bailey",
    feedbackType: "internal",
    client: "NYL",
    qaMember: 2,
    content:
      "A multi-disciplinary review could enhance the clarity and completeness of the report.",
    date: "2024-12-20T11:55:00Z",
    caseID: "5-2000188"
  },

  // Reviewer 47: Oluwafemi Durojaiye (clients: Lincoln)
  {
    reviewer: "Oluwafemi Durojaiye",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Updated documentation is required to accurately reflect the claimant's current status.",
    date: "2024-10-30T08:15:00Z",
    caseID: "5-2000189"
  },
  {
    reviewer: "Oluwafemi Durojaiye",
    feedbackType: "client",
    client: "Lincoln",
    content:
      "Ensure the revision incorporates the latest feedback from the clinical review.",
    date: "2024-11-18T09:20:00Z",
    caseID: "5-2000190"
  },
  {
    reviewer: "Oluwafemi Durojaiye",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 3,
    content:
      "The report should be refined to better highlight the claimant's progress over recent assessments.",
    date: "2024-12-08T10:25:00Z",
    caseID: "5-2000191"
  },
  {
    reviewer: "Oluwafemi Durojaiye",
    feedbackType: "internal",
    client: "Lincoln",
    qaMember: 4,
    content:
      "Further clarification in the documentation is necessary to fully capture the updated clinical findings.",
    date: "2024-12-28T11:30:00Z",
    caseID: "5-2000192"
  }
];

export default FeedbackData;
