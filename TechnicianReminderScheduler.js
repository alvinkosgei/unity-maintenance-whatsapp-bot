function sendTechnicianReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName("Data");
  const contactSheet = ss.getSheetByName("Contacts");
  const activitySheet = ss.getSheetByName("Activity Change Log");
  const logData=activitySheet.getDataRange().getValues();
  var tempArr

  const data = dataSheet.getDataRange().getValues();
  const headers = data[1];

  // Normalize header names to snake_case (underscore format)
  const colIndex = {};
  headers.forEach((colName, i) => {
    if (colName) {
      const key = colName.trim().toLowerCase().replace(/\s+/g, "_");
      colIndex[key] = i;
    }
  });

  const contacts = contactSheet.getDataRange().getValues();
  const now = new Date();

  for (let i = data.length - 1; i > 0; i--) {
    const row = data[i];
    const ticketNumber = row[colIndex["ticket_id"]];
    const status = row[colIndex["status"]];
    const technicianName = row[colIndex["technician_assigned"]];
    const expectedDate = row[colIndex["technician_expected_date"]];
    const expectedTime = row[colIndex["technician_expected_time"]];
    const technician_reached = row[colIndex["technician_reached"]]; // snake_case

    if (technician_reached === "Yes") continue;

    if (status !== "Assign" || !ticketNumber || !technicianName || !expectedDate || !expectedTime) continue;

    const dateObj = new Date(expectedDate);
    const timeObj = new Date(expectedTime);

    if (isNaN(dateObj.getTime()) || isNaN(timeObj.getTime())) continue;

    dateObj.setHours(timeObj.getHours());
    dateObj.setMinutes(timeObj.getMinutes());
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);

    const scheduledDateTime = dateObj;
    const diffInMinutes = Math.floor((scheduledDateTime-now) / 60000);

    // if (diffInMinutes < 30 || diffInMinutes > 30) continue;
    tempArr=logData.filter(itm => itm[0]==ticketNumber)
    if (diffInMinutes > 30 || tempArr.length>0) continue;

    const technicianRow = contacts.find(row => row[4]?.toLowerCase() === technicianName.toLowerCase());
    const phoneNumber = technicianRow ? technicianRow[5] : null;

    if (!phoneNumber) continue;

    const response = sendWhatsAppTemplateMessage(
      phoneNumber,
      "unity_homes_reminder_message_technician",
      "EN",
      [ticketNumber],
      [`I have reached to resolve this issue ticketID: ${ticketNumber}`],
      ticketNumber,
      "Technician Reminder"
    );

    activitySheet.appendRow([ticketNumber, "Technician", "Reminder Sent", "Yes", now]);

  }
}

function sendRatingReminder()
{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName("Data");
  const contactSheet = ss.getSheetByName("Contacts");
  const shLog=ss.getSheetByName("Log");
  const shWLog=ss.getSheetByName("Whatsapp Log");

  var data = dataSheet.getDataRange().getValues();
  const headers = data[1];

  const colIndex = {};
  headers.forEach((colName, i) => {
    if (colName) {
      const key = colName.trim().toLowerCase().replace(/\s+/g, "_");
      colIndex[key] = i;
    }
  });

  const now = new Date();

  data=data.filter(itm => itm[colIndex["rate_your_experience"]]=="" && itm[colIndex["resolved_at"]]!="" && itm[colIndex["status"]]=="Resolved")

  for (let i = data.length - 1; i > 0; i--) 
  {
    const row = data[i];
    const ticketNumber = row[colIndex["ticket_id"]].toString();
    var contactNumber = row[colIndex["contact_number"]];
    const status = row[colIndex["status"]];
    var resolveDate = row[colIndex["resolved_at"]];
    const rateExp = row[colIndex["rate_your_experience"]]; // snake_case
    const now = new Date();

    if (rateExp !="" || resolveDate=="" || status!="Resolved") continue;
    resolveDate=new Date(resolveDate)

    if (isNaN(resolveDate.getTime())) continue;
    
    const diffInHours = Math.floor((now - resolveDate) / 3600000);

    if(diffInHours==1 || diffInHours==3 || diffInHours==6)
    {
      // contactNumber="918866397097"
      const response = sendWhatsAppTemplateMessage(
        contactNumber,
        "unity_homes_feedback",
        "EN",
        [ticketNumber],
        [ticketNumber],
        ticketNumber,
        "Submit Feedback"
      );
    }
  }
}
