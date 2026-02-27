function UntitledMacro() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('H:H').activate();
  spreadsheet.setCurrentCell(spreadsheet.getRange('E1'));
  spreadsheet.getActiveRangeList().setNumberFormat('@');
};

function UntitledMacro1() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('H:I').activate();
  spreadsheet.setCurrentCell(spreadsheet.getRange('E1'));
  spreadsheet.getActiveRangeList().setNumberFormat('@');
};