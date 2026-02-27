
function updateTechnicianStatusByPayload(data) {
  // data ={
  //   ticket_id:"10001", 
  //   ticket_status:"technician reached",
  //   flag_confirmed_by_user: false,
  //   submitted_by:"user"
  // }

  const { ticket_id, ticket_status, flag_confirmed_by_user, submitted_by } = data;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName("Data");
  const activitySheet = ss.getSheetByName("Activity Change Log");
  const rows = dataSheet.getDataRange().getValues();

  const header = rows[1];
  const ticketCol = header.indexOf("ticket_id");
  const statusCol = header.indexOf("status");
  const confirmCol = header.indexOf("user_status_confirmation");
  const resolvedAt = header.indexOf("resolved_at");
  const feedbackCol = header.indexOf("rate_your_experience");

  const now = new Date();
  let rowIndex = -1;

  for (let i = 2; i < rows.length; i++) {
    if (rows[i][ticketCol] == ticket_id) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) return { error: "Ticket not found." };

  const currentStatus = rows[rowIndex][statusCol];
  const feedbackRate=rows[rowIndex][feedbackCol]
  const row = rows[rowIndex];

  if(feedbackRate=="")
  {
    if (submitted_by === "technician") {
      if (ticket_status === "technician reached") {
        dataSheet.getRange(rowIndex + 1, statusCol + 1).setValue("About to be resolved");
        dataSheet.getRange(rowIndex + 1, confirmCol + 1).setValue(false);
        activitySheet.appendRow([ticket_id, "Technician", "Technician Reached", "Yes", now]);
        sendTechnicianArrivalMessageToUser(ticket_id, row);
      } else if (ticket_status == "resolved") {
        dataSheet.getRange(rowIndex + 1, statusCol + 1).setValue("Resolved");
        dataSheet.getRange(rowIndex + 1, confirmCol + 1).setValue(false);
        dataSheet.getRange(rowIndex + 1, resolvedAt + 1).setValue(new Date());
        activitySheet.appendRow([ticket_id, "Technician", "Resolved", "Yes", now]);
        sendIssueResolvedMessageToUser(ticket_id, row);
      }
    } else if (submitted_by == "user") {
      if (ticket_status === "technician reached" && currentStatus !== "Resolved") {
        if (flag_confirmed_by_user == "true") {
          dataSheet.getRange(rowIndex + 1, confirmCol + 1).setValue(true);
          activitySheet.appendRow([ticket_id, "User", "Technician Reached", "Yes", now]);
          sendIssueResolvedMessageToTechnician(ticket_id, row);
        } else {
          dataSheet.getRange(rowIndex + 1, statusCol + 1).setValue("Assign");
          dataSheet.getRange(rowIndex + 1, confirmCol + 1).setValue("NA");
          activitySheet.appendRow([ticket_id, "User", "Technician Reached", "No", now]);
          sendTechnicianReconfirmationMessage(ticket_id, row);
        }
      } else if (ticket_status == "resolved") {
        if (flag_confirmed_by_user == "true") {
          dataSheet.getRange(rowIndex + 1, confirmCol + 1).setValue(true);
          activitySheet.appendRow([ticket_id, "User", "Resolved", "Yes", now]);
        } else {
          dataSheet.getRange(rowIndex + 1, statusCol + 1).setValue("About to be resolved");
          dataSheet.getRange(rowIndex + 1, resolvedAt + 1).setValue('');
          dataSheet.getRange(rowIndex + 1, confirmCol + 1).setValue(true);
          activitySheet.appendRow([ticket_id, "User", "Resolved", "No", now]);
          sendIssueResolvedReconfirmationMessage(ticket_id, row);
        }
      }
    }
  }
  else
  {
    return {success:false,error:"This issue has already been resolved. Please report a new issue if needed."}
  }
  return { success: true };
}




//----------------------------------------------------------------

//// "I've reached" indicating they have arrived at the user's location.
// function updateTechnicianStatusByPayload(payload) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const sheet = ss.getSheetByName("Data");
//   const data = sheet.getDataRange().getValues();

//   const headers = data[1];
//   const colIndex = {};

//   // Normalize headers to snake_case
//   headers.forEach((header, i) => {
//     const key = header?.toString().trim().toLowerCase().replace(/\s+/g, "_");
//     if (key) colIndex[key] = i;
//   });

//   const ticketIdKey = colIndex["ticket_id"];
//   const statusKey = colIndex["status"];
//   const technicianReached = colIndex["technician_reached"];
//   const userPhoneKey = colIndex["contact_number"]; // Column D

//   if (!payload.ticket_id || payload.technician_reached?.toLowerCase() !== "yes") {
//     Logger.log("Invalid payload or technician not marked as reached");
//     return { success: false, message: "Invalid payload or technician not reached" };
//   }

//   // Loop from bottom to top to find the ticket
//   for (let i = data.length - 1; i > 0; i--) {
//     const rowTicketId = data[i][ticketIdKey]?.toString().trim();
//     if (rowTicketId === payload.ticket_id) {
//       // Update the status
//       sheet.getRange(i + 1, statusKey + 1).setValue("About to be resolved");
//       sheet.getRange(i + 1, technicianReached + 1).setValue("Yes");
//       Logger.log(`Status updated for ticket ${payload.ticket_id} at row ${i + 1}`);

//       // Get user contact
//       const userPhone = data[i][userPhoneKey]?.toString().trim();
//       if (userPhone) {
//         const messageResponse = sendWhatsAppTemplateMessage(
//           userPhone,
//           "unity_homes_technician_arrival_message",
//           "EN",
//           [payload.ticket_id],
//           [],
//           payload.ticket_id,
//           "Technician Arrival Confirmation to User"
//         );
//         Logger.log(`Message sent to user ${userPhone}: ${messageResponse}`);
//       } else {
//         Logger.log(`No contact number found for ticket ${payload.ticket_id}`);
//       }

//       return { success: true, message: "Status updated and user notified" };
//     }
//   }

//   Logger.log(`Ticket ID not found: ${payload.ticket_id}`);
//   return { success: false, message: "Ticket ID not found" };
// }
