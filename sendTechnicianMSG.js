function sendTechnicianArrivalMessageToUser(ticketId, row) {
  
  sendWhatsAppTemplateMessage(
    row[3], // Assuming column D = contact_number
    "unity_homes_technician_arrival_message",
    "EN",
    [ticketId],
    [
      `Technician has arrived at the location. Ticket ID: ${ticketId}`,
      `Technician has not arrived at the location. Ticket ID: ${ticketId}`
    ],
    ticketId,
    "Technician Arrival Notification to User"
  );
}

function sendIssueResolvedMessageToUser(ticketId, row) {

  sendWhatsAppTemplateMessage(
    row[3],
    "unity_homes_issue_resolved_message",
    "EN",
    [ticketId],
    [
      `Technician have resolved this issue ticketID: ${ticketId}`,
      `Technician have not resolved this issue ticketID: ${ticketId}`
    ],
    ticketId,
    "Issue Resolved Confirmation to User"
  );
}

function sendIssueResolvedMessageToTechnician(ticketId, row) {
  const techName = row[22]; // Column W = technician_assigned
  const techPhone = getTechnicianContact(techName);

  if (!techPhone) {
    Logger.log(`❌ Technician number not found for: ${techName}`);
    return;
  }

  sendWhatsAppTemplateMessage(
    techPhone,
    "unity_homes_issue_resolved_message_technician",
    "EN",
    [ticketId],
    [`I have resolved this issue ticketID: ${ticketId}`],
    ticketId,
    "Issue Resolved Confirmation to Technician"
  );
}

function sendTechnicianReconfirmationMessage(ticketId, row) {
  const techName = row[22];
  const techPhone = getTechnicianContact(techName);

  if (!techPhone) {
    Logger.log(`❌ Technician number not found for: ${techName}`);
    return;
  }

  sendWhatsAppTemplateMessage(
    techPhone,
    "unity_homes_reconfirmation_message_technician",
    "EN",
    [ticketId],
    [`I have reached to resolve this issue ticketID: ${ticketId}`],
    ticketId,
    "Technician Reconfirmation"
  );
}

function sendIssueResolvedReconfirmationMessage(ticketId, row) {
  const techName = row[22];
  const techPhone = getTechnicianContact(techName);

  if (!techPhone) {
    Logger.log(`❌ Technician number not found for: ${techName}`);
    return;
  }

  sendWhatsAppTemplateMessage(
    techPhone,
    "unity_homes_issue_resolved_message_technician",
    "EN",
    [ticketId],
    [`I have resolved this issue ticketID: ${ticketId}`],
    ticketId,
    "Issue Resolved Reconfirmation"
  );
}
