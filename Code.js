var ACT_SS="1q2Evk2NmoX6h4DHlrpxCwOzGZiq8NF8paKtpV2wv9hQ"

function doPost(e)
{
  var data = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Do Post Log').appendRow([new Date(),JSON.stringify(data),e.parameter['function']])
  var output;

  if(e.parameter['function']=="getReportData")
    output=getData(data.contact_number)
  else if(e.parameter['function']=="givenRateCall")
    output=givenRateCall(data)
  else if(e.parameter['function']=="enquiryForm")
    output=inquiryData(data)
  else if(e.parameter['function']=="getTicketByPhone")
    output=getTicketInfo(data)
  else if(e.parameter['function']=="setConfirmation")
    output=setConfirmationStatus(data)
  else if(e.parameter['function']=="setFeedback")
    output=setRateFeedback(data)
  else if(e.parameter['function']=="appendSuggestions")
    output=appendSuggestion(data)
  else if(e.parameter['function']=="updateTechnicianStatus")
    output=updateTechnicianStatusByPayload(data)
  else if(e.parameter['function']=="UpdateTicketStatus")
    output=updateTechnicianStatusByPayload(data)
  else
    output=appendData(data)

  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

function getData(phoneNumber)
{
  var returnData=[]
  var ss=SpreadsheetApp.openById(ACT_SS);
  var shData=ss.getSheetByName("Data");
  var oldData=shData.getDataRange().getValues();
  
  var index = oldData[1].indexOf("contact_number")
  if(index>-1){
    returnData = oldData.filter(itm => itm[index].toString().trim() == phoneNumber.toString().trim())
    if(returnData.length>0)
      returnData=arrayToJSON([oldData[0],...returnData])
  }
  return {status:true,data:returnData};

}

function appendData(data)
{
  if(!data){
    data={
   "name": "Niyati",
   "contact_number": "917976075183",
   "estate": "Unity East",
   "block":"5",
   "apartment_or_house_no":"12",
   "amenities_maintenance":"Bistro",
   "apartment_maintenance":"Leaks",
   "billing": "water",
   "common_area_maintenance":"paints",
   "community_matters":"theft",
   "customer_service": "Response Time",
   "other":"Lift issues",
   "proposed_day":"Mon",
   "proposed_time":"8:00 AM - 4:00 PM"
}}

  var ss=SpreadsheetApp.openById(ACT_SS);
  var shData=ss.getSheetByName("Data");
  var shContact=ss.getSheetByName("Contacts");
  var oldData=shData.getDataRange().getValues();
  var shLog=ss.getSheetByName("Log");
  var shWLog=ss.getSheetByName("Whatsapp Log");
  var iDate=new Date();
  var ticketId=shLog.getRange("maxTicketId").getValue();
  var msgText=shContact.getRange("msgText").getValue();
  var numberList=shContact.getDataRange().getValues();
  var tempMsg,response,category=""

  // data=JSON.parse(data)

  if(ticketId=="" || ticketId==0)
    ticketId=10000
  ticketId++

  var key
  var dataKeys ={
    "ticket_id":ticketId,
    "reported_date":iDate,
    "reported_time":iDate,
    "status":"Open",
    "technician_assigned":"",
    "technician_expected_date":"",
    "technician_expected_time":"",
    "category":""
  };

  var headers = shData.getRange(2, 1, 1, shData.getLastColumn()).getValues()[0];

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if(key=="block")
        dataKeys[key.toLowerCase()] = data[key] + "-" + data["block_number"];
      else if(key!="block" && key!="block_number")
        dataKeys[key.toLowerCase()] = data[key];
    }
  }

  tempMsg=msgText
  var rowData = headers.map(function(header) {
    var headerKey = header.toLowerCase();
    
    //replace msg body
    if(dataKeys[headerKey]=="")
      tempMsg=replaceText(tempMsg,"{" + headerKey + "}","NA")
    else if(headerKey=="reported_date" && dataKeys[headerKey]!="")
      tempMsg=replaceText(tempMsg,"{" + headerKey + "}",Utilities.formatDate(dataKeys[headerKey],Session.getScriptTimeZone(),"dd-MM-yy"))
    else if(headerKey=="reported_time" && dataKeys[headerKey]!="")
      tempMsg=replaceText(tempMsg,"{" + headerKey + "}",Utilities.formatDate(dataKeys[headerKey],Session.getScriptTimeZone(),"hh:mm:ss"))
    else
      tempMsg=replaceText(tempMsg,"{" + headerKey + "}",dataKeys[headerKey])

    if(CATEGORY.indexOf(headerKey)>=0)
    {
      if(category=="" && dataKeys[headerKey]!="")
        category=dataKeys[headerKey]
      else if(dataKeys[headerKey]!="")
        category=category + ", " + dataKeys[headerKey]
    }

    return dataKeys[headerKey] || '';
  });
  tempMsg=replaceText(tempMsg,"{category}",category)
  dataKeys["category"]=category
  rowData[0]=new Date()

  shData.appendRow(rowData);
  shData.getRange('Q:Q').setNumberFormat('dd"/"mm"/"yyyy');
  shData.getRange('S:S').setNumberFormat('dd"/"mm"/"yyyy');
  shData.getRange('R:R').setNumberFormat('h":"mm":"ss" "');
  shData.getRange('T:T').setNumberFormat('h":"mm":"ss" "');
  shData.getRange('X:X').setNumberFormat('dd"/"mm"/"yyyy');
  shData.getRange('Y:Y').setNumberFormat('h":"mm":"ss" "');
  shData.getRange('H:I').setNumberFormat('@')

  var numStr=""
  for(var i=2;i<numberList.length;i++)
  {
    if(numberList[i][0]=="")
      break;

    if(numberList[i][0]==dataKeys.estate)
    {
      if(numStr=="")
        numStr=numberList[i][2]
      else
        numStr=numStr + ", " + numberList[i][2]

      response=sendMsgEndUser(numberList[i][2],JSON.parse(tempMsg),"unity_homes_user_issue_notification_em")

      shWLog.appendRow([new Date(),ticketId,numberList[i][2],"Supervisor Message",response])
    }
  }

  shLog.appendRow([new Date(),ticketId,JSON.stringify(data),"success",numStr,"Supervisor Message",tempMsg])

  SpreadsheetApp.flush();
  return {"status":true,"data":JSON.stringify(data),"message":"Data append successfully."}
}

function setRateFeedback(rowObj)
{
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var shWLog=ss.getSheetByName("Whatsapp Log");
  var shData=ss.getSheetByName("Data");
  var extData=shData.getDataRange().getValues();
  var sendTo=""

  var rowData=extData.filter(itm => itm[1]==rowObj.ticket_id)

  for(var i=2;i<extData.length;i++)
  {
    if(extData[i][1]==rowObj.ticket_id)
    {
      sendTo=extData[i][3]

      shData.getRange(i+1,shData.getRange("ursCol").getColumn()).setValue(rowObj.user_resolved_status)
      break;
    }
  }

  if(sendTo!="")
  {
    var obj=[{"id": (rowObj.ticket_id).toString(),"title": (rowObj.ticket_id + " - " + rowObj.description).toString()}]
    msgName="unity_homes_feedback"

    response=sendMsgTicketResolved(sendTo,obj,msgName)
    shWLog.appendRow([new Date(),rowObj.ticket_id,sendTo,"User Feedback Message",response])
    SpreadsheetApp.flush();
  }
}

function arrayToJSON(array) {
    const keys = array[0]; // Extract the first row as keys
    return array.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
            obj[keys[index]] = value; // Map each key to the corresponding value
        });
        return obj;
    });
}

function replaceText(content,searchText,replaceText)
{
  if((searchText.toString()).indexOf("\n")>=0)
  {
    var regex = new RegExp("\n", 'gi')
    content = content.replace(regex, "")
  }

  var regex = new RegExp(searchText, 'gi')
  content = content.replace(regex, replaceText)

  return content
}

function givenRateCall(data)
{
  var ss=SpreadsheetApp.openById(ACT_SS);
  var shData=ss.getSheetByName("Data");
  var headers = shData.getRange(2, 1, 1, shData.getLastColumn()).getValues()[0];
  var extData=shData.getDataRange().getValues();

  var flag=false
  for(var i=2;i<extData.length;i++)
  {
    if(extData[i][1].toString().trim()==(data.ticket_id).toString().trim())
    {
      flag=true
      for(var j=0;j<headers.length;j++)
      {
        if(headers[j]=="rate_your_experience")
          shData.getRange(i+1,j+1).setValue(data.rate_your_experience)
        else if(headers[j]=="feedback_at")
          shData.getRange(i+1,j+1).setValue(new Date())
        else if(headers[j]=="improvement")
          shData.getRange(i+1,j+1).setValue(data.improvement)
      }
    }
  }
  SpreadsheetApp.flush();

  if(flag)
    return {flag:true,msg:"This ticket rated and suggestion save successfully."}
  else
    return {flag:false,msg:"This ticket id is not availabel in data."}

}

function getTicketInfo(data)
{
  // data={"contact_number":"918140120537","technician":false}

  var ss=SpreadsheetApp.openById(ACT_SS);
  var shData=ss.getSheetByName("Data");
  var shContact=ss.getSheetByName("Contacts");
  var headers = shData.getRange(2, 1, 1, shData.getLastColumn()).getValues()[0];
  var extData=shData.getDataRange().getValues();
  var conData=shContact.getDataRange().getValues();
  var techName="",data

  if(data.technician)
  {
    for(i=1;i<conData.length;i++)
    {
      if(conData[i][4]=="")
        break;
      if(conData[i][5].toString()==(data.contact_number).toString())
      {
        techName=conData[i][4]
        break;
      }
    }

    if(techName=="")
      return {flag:false,msg:"This number technician is not available in list."}
    
    data=getAllTicketsByPhone(extData, techName,true)
  }
  else
  {
    data=getAllTicketsByPhone(extData, data.contact_number,false)
  }
  return data
}

function getAllTicketsByPhone(data, valueFind,flagTech)
{
  var indexPhone

  if(flagTech)
  {
    indexPhone=data[1].indexOf("technician_assigned")
    var filteredData=data.filter(itm => itm[indexPhone].toLowerCase().toString().trim()==valueFind.toLowerCase().toString().trim())
  }
  else
  {
    indexPhone=data[1].indexOf("contact_number")
    var filteredData=data.filter(itm => itm[indexPhone].toString().trim()==valueFind.toString().trim())
  }

  if(filteredData.length<1){
    return []
  }
  else
  {
    filteredData=arrayToJSON([data[1],...filteredData])

    for(var i=0;i<filteredData.length;i++)
    {
      filteredData[i].reported_date=Utilities.formatDate(filteredData[i].reported_date,Session.getScriptTimeZone(),"dd-MM-yy")
      filteredData[i].reported_time=Utilities.formatDate(filteredData[i].reported_time,Session.getScriptTimeZone(),"hh:mm:ss")
    }

    return filteredData
  }
}

function setConfirmationStatus(data)
{
  var ss=SpreadsheetApp.openById(ACT_SS);
  var shData=ss.getSheetByName("Data");
  var headers = shData.getRange(2, 1, 1, shData.getLastColumn()).getValues()[0];
  var extData=shData.getDataRange().getValues();

  var flag=false
  for(var i=2;i<extData.length;i++)
  {
    if(extData[i][1].toString().trim()==(data.ticket_id).toString().trim())
    {
      flag=true
      for(var j=0;j<headers.length;j++)
      {
        if(headers[j]=="technician_arrived_or_not_arrived")
        {
          shData.getRange(i+1,j+1).setValue(data.technician_arrived_or_not_arrived)
          shData.getRange(i+1,j+2).setValue(new Date())
          break;
        }
      }
      break;
    }
  }
  SpreadsheetApp.flush();

  if(flag)
    return {flag:true,msg:"This ticket confirmation value save successfully."}
  else
    return {flag:false,msg:"This ticket id is not availabel in data."}
}

function inquiryData(data)
{
  if(!data){
    data={
      "name":"Niyati",
      "contact_number":"7976075183",
      "estate":"Unity West",
      "row_or_phase":"A",
      "block":"5",
      "apartment_or_house_no":"12",
      "description":"ABCD"
    }
  }
  var ss=SpreadsheetApp.openById(ACT_SS);
  var shData=ss.getSheetByName("Enquiry Data");
  var shLog=ss.getSheetByName("Log");
  var shWLog=ss.getSheetByName("Whatsapp Log");
  var shContact=ss.getSheetByName("Contacts");
  var msgText=shContact.getRange("enquiryMsg").getValue();
  var numberList=shContact.getDataRange().getValues();
  var iDate=new Date(),headerKey;

  var key,dataKeys={}

  var headers = shData.getRange(1, 1, 1, shData.getLastColumn()).getValues()[0];

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      dataKeys[key.toLowerCase()] = data[key];
    }
  }

  var tempMsg=msgText

  var rowData = headers.map(function(header) {
    tempMsg=replaceText(tempMsg,"{" + header + "}",dataKeys[header])

    return dataKeys[header] || '';
  });

  rowData[0]=new Date()

  shData.appendRow(rowData);

  var numStr=""
  for(var i=2;i<numberList.length;i++)
  {
    if(numberList[i][0]=="")
      break;

    if(numberList[i][0]==dataKeys.estate)
    {
      if(numStr=="")
        numStr=numberList[i][2]
      else
        numStr=numStr + ", " + numberList[i][2]

      response=sendMsgEndUser(numberList[i][2],JSON.parse(tempMsg),"unity_home_enquiry_form_notification")

      shWLog.appendRow([new Date(),"",numberList[i][2],"Enquiry Supervisor Message",response])
    }
  }

  shLog.appendRow([new Date(),"",JSON.stringify(data),"success",numStr,"Enquiry Form",tempMsg])

  SpreadsheetApp.flush();
  return {"status":true,"data":JSON.stringify(data),"message":"Enquiry data append successfully."}
}

function appendSuggestion(data)
{
  if(!data){
    data={
      "name": "Niyati",
      "contact_number": "918866397097",
      "estate":"Unity East",
      "suggestion": "ABCD"
    }
  }
  var ss=SpreadsheetApp.openById(ACT_SS);
  var shData=ss.getSheetByName("Suggestions");
  var shLog=ss.getSheetByName("Log");
  var shWLog=ss.getSheetByName("Whatsapp Log");
  var shContact=ss.getSheetByName("Contacts");
  var msgText=shContact.getRange("suggestionMsg").getValue();
  var numberList=shContact.getDataRange().getValues();
  var iDate=new Date(),headerKey;

  var key,dataKeys={}

  var headers = shData.getRange(1, 1, 1, shData.getLastColumn()).getValues()[0];

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      dataKeys[key.toLowerCase()] = data[key];
    }
  }

  var tempMsg=msgText

  var rowData = headers.map(function(header) {
    tempMsg=replaceText(tempMsg,"{" + header + "}",dataKeys[header])

    return dataKeys[header] || '';
  });

  rowData[0]=new Date()

  shData.appendRow(rowData);

  var numStr=""
  for(var i=2;i<numberList.length;i++)
  {
    if(numberList[i][0]=="")
      break;

    if(numberList[i][0]==dataKeys.estate)
    {
      if(numStr=="")
        numStr=numberList[i][2]
      else
        numStr=numStr + ", " + numberList[i][2]

      response=sendMsgEndUser(numberList[i][2],JSON.parse(tempMsg),"unity_homes_suggestion_notification")

      shWLog.appendRow([new Date(),"",numberList[i][2],"Suggestion Supervisor Message",response])
    }
  }

  shLog.appendRow([new Date(),"",JSON.stringify(data),"success",numStr,"Suggestion Data",tempMsg])

  SpreadsheetApp.flush();
  return {"status":true,"data":JSON.stringify(data),"message":"Suggestion data append successfully."}
}