// 
function sendIssueResolvedOrNotRequestToTechnician(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Data");
  const contactsSheet = ss.getSheetByName("Contacts");

  const data = sheet.getDataRange().getValues();
  const contacts = contactsSheet.getDataRange().getValues();

  const headers = data[1];
  const colIndex = {};

  headers.forEach((header, i) => {
    const key = header?.toString().trim().toLowerCase().replace(/\s+/g, "_");
    if (key) colIndex[key] = i;
  });

  const ticketIdKey = colIndex["ticket_id"];
  const statusKey = colIndex["status"];
  const technicianKey = colIndex["technician_assigned"];

  for (let i = data.length - 1; i > 0; i--) {
    const rowTicketId = data[i][ticketIdKey]?.toString().trim();
    if (rowTicketId === payload.ticket_id) {
      const technicianName = data[i][technicianKey]?.toString().trim();

      if (!technicianName) {
        Logger.log("Technician not assigned.");
        return;
      }

      const contactRow = contacts.find(row => row[4]?.toLowerCase() === technicianName.toLowerCase());
      const phoneNumber = contactRow ? contactRow[5]?.toString().trim() : null;

      if (!phoneNumber) {
        Logger.log("Technician contact not found.");
        return;
      }

      // CASE 1: User clicked "Technician Not Arrived"
      if (payload.technician_arrived_or_not_arrived.toLowerCase() === "No") {
        // 1. Update status back to 'Assign'
        sheet.getRange(i + 1, statusKey + 1).setValue("Assign");

        // 2. Send reminder again to technician with "I've reached" button
        sendWhatsAppTemplateMessage(
          phoneNumber,
          "unity_homes_reminder_message_technician",
          "EN",
          [payload.ticket_id],
          [`I have reached to resolve this issue ticketID: ${payload.ticket_id}`],
          payload.ticket_id,
          "Reminder to Technician to Confirm Arrival"
        );
        Logger.log(`Reminder sent again to technician (${technicianName})`);
      }

      // CASE 2: User clicked "Technician Arrived"
      else if (payload.technician_arrived_or_not_arrived.toLowerCase() === "Yes") {
        
        sheet.getRange(i + 1, statusKey + 1).setValue("Assign");
        
        sendWhatsAppTemplateMessage(
          phoneNumber,
          "unity_homes_issue_resolved_message_technician",
          "EN",
          [payload.ticket_id],
          [],
          payload.ticket_id,
          "Request to Technician to Confirm Issue Resolved"
        );
        Logger.log(`Sent 'Issue Resolved' message to technician (${technicianName})`);
      }

      return;
    }
  }

  Logger.log(`Ticket ID ${payload.ticket_id} not found`);
}
