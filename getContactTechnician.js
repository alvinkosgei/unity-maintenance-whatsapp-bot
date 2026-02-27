function getTechnicianContact(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactsSheet = ss.getSheetByName("Contacts");
  const rows = contactsSheet.getDataRange().getValues();

  // Start from row 2 (skip "Technician Details" label in row 1)
  for (let i = 2; i < rows.length; i++) {
    const techName = rows[i][4]; // Column E
    const techPhone = rows[i][5]; // Column F

    if (techName && techName.trim() === name && techPhone) {
      return techPhone.toString().replace(/\D/g, '');
    }
  }

  return null; // Not found
}
