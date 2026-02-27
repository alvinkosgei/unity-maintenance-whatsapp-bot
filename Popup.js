function onOpen() 
{
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Run')
    .addItem('Assign Technician','getActiveRowData')
    .addItem('Change Ticket Status','getStatusChangeData')
    .addToUi()
}

function assignTechnicianHTML(obj) 
{
  var t1= HtmlService.createTemplateFromFile('assignTechnician')
  var data={obj:obj,page:"Assign Technician"}
  t1.obj = data
  var html = t1.evaluate();
  html.setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(550).setWidth(900);  
  SpreadsheetApp.getUi().showModalDialog(html, "Assign Technician");
}

function changeStatusHTML(obj) 
{
  var t1= HtmlService.createTemplateFromFile('assignTechnician')
  var data={obj:obj,page:"Change Ticket Status"}
  t1.obj = data
  var html = t1.evaluate();
  html.setSandboxMode(HtmlService.SandboxMode.IFRAME).setHeight(450).setWidth(900);  
  SpreadsheetApp.getUi().showModalDialog(html, "Change Ticket Status");
}

function getStatusChangeData()
{
  getActiveRowData(true)
}

function getActiveRowData(flag)
{
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var shData=ss.getSheetByName("Data");
  var shContact=ss.getSheetByName("Contacts");
  var techCol=shContact.getRange("techCol").getColumn();
  var contactData=shContact.getDataRange().getValues();
  var data=shData.getDataRange().getValues();
  var shName=ss.getActiveSheet().getName();
  var actRow=shData.getActiveCell().getRow();

  if(shName!="Data")
  {
    Browser.msgBox("Data sheet is not active your active sheet.")
    return;
  }

  if(shData.getRange(actRow,1).getValue()=="" || actRow==1)
  {
    Browser.msgBox("Please active in data cell.")
    return;
  }

  var keys=data[1];
  var rowData=data[actRow-1]
  var rowObj={}
  var techArr=[]
  var category=""
  
  for(var i=0;i<keys.length;i++)
  {
    if((keys[i]=="reported_date" && rowData[i]!="") || (keys[i]=="proposed_date" && rowData[i]!=""))
      rowObj[keys[i]]=Utilities.formatDate(rowData[i],Session.getScriptTimeZone(),"dd/MM/yyyy")
    else if(keys[i]=="reported_time" && rowData[i]!="")      //(keys[i]=="proposed_time" && rowData[i]!="")
      rowObj[keys[i]]=Utilities.formatDate(rowData[i],Session.getScriptTimeZone(),"hh:mm:ss")
    else
      rowObj[keys[i]]=rowData[i];

    if(CATEGORY.indexOf(keys[i])>=0)
    {
      if(category=="" && rowData[i]!="")
        category=rowData[i]
      else if(rowData[i]!="")
        category=category + ", " + rowData[i]
    }
  }
  rowObj["category"]=category

  for(var i=2;i<contactData.length;i++)
  {
    if(contactData[i][techCol-1]=="")
      break;
    
    if(contactData[i][techCol-1]!="" && contactData[i][techCol]!="")
    {
      techArr.push([contactData[i][techCol-1],contactData[i][techCol].toString()])
    }
  }

  if(rowObj.status!="Open" && rowObj.status!="" && !flag)
  {
    Browser.msgBox("Selected ticket status is not open.")
    return;
  }
  var output={"rowObj":rowObj,"techArr":techArr}

  if(flag)
    changeStatusHTML(output) 
  else
    assignTechnicianHTML(output) 
}

// function assignTechnician(rowObj,page)
// {
//   // rowObj={
//   //     "Time_Stamp": "2024-11-20T13:28:41.869Z",
//   //     "ticket_id": 10005,
//   //     "name": "Krishna",
//   //     "contact_number": 918866397097,
//   //     "apartment_number": "A1 04",
//   //     "category": "Plumbing",
//   //     "description": "I need plumbing service",
//   //     "reported_date": "20/11/2024",
//   //     "reported_time": "06:58:40",
//   //     "status": "Open",
//   //     "technician_assigned": "Nitin Panchal",
//   //     "technician_expected_date": "",
//   //     "technician_expected_time": "",
//   //     "technician_no": "918866397097"
//   // }

//   var ss=SpreadsheetApp.getActiveSpreadsheet();
//   var shData=ss.getSheetByName("Data");
//   var shContact=ss.getSheetByName("Contacts");
//   var shWLog=ss.getSheetByName("Whatsapp Log");
//   var iDate=new Date();
//   var msgText=shContact.getRange("msgText").getValue();   //supervisor msg
//   // var techMsg=shContact.getRange("techMsg").getValue();   //techMsg
//   var userMsg=shContact.getRange("userMsg").getValue();   //userMsg
//   var tempMsg,response,tempObj={},tObj={}

//   var keys=Object.keys(rowObj)

//   if(page=="Assign Technician" || rowObj.status=="Assign")
//   {
//     sendMsgByPopup(rowObj)
//   }
//   else if(rowObj.status=="About to be resolved" || page=="Change Ticket Status")
//   {
//     sendMsgByPopup(rowObj)
//   }

//   return "Technician Assign Successfully."
// }