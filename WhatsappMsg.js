const CATEGORY=["amenities_maintenance","apartment_maintenance","billing","common_area_maintenance","community_matters","customer_service","other"]

function sendMsgEndUser(sendNo,data,name,additionalData)
{
  var url = 'https://graph.facebook.com/v19.0/686448584542854/messages';
  
  var payload = {
    "messaging_product": "whatsapp",
    "to": sendNo,  // The recipient's WhatsApp number
    "type": "template",
    "template": {
      "name": name,
      "language": {
        "code": "EN"
      },
      "components": [
        {
          "type": "body",
          "parameters": data
        }
      ]
    }
  };
  if(additionalData){
    payload.template.components = [...payload.template.components,...additionalData]
  }
  console.log(JSON.stringify(payload));

  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer EAAPNseuBhAkBO5doZCovALFBtCZArx8GFRVGBWsTOEi8TWfoeZCfRsVHLBd4UU4O4EAdftnfzfpKmfrZAQjtGGTr942ZBLsUx4miYBXKEFY5YOAqZCBxWXiimHzvFJRlGGQM6FclUA6x6Jf6tfTzS0bWjqwqBeqlC3poG4D76v3YCCqpHGdEZANAp0ISIr9NNARmEufWvHUuB6ZBwFtFPWRVea4mN3xyMC9taPvx6XcAUuaLGBWXrLgRqgYYLBr4n779SrNGMdp4vAZDZD',
    'Cookie': 'ps_l=0; ps_n=0; ps_l=1; ps_n=1; ps_l=1; ps_n=1'  // Optional: include if needed
  };

  var options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true  // Optional: to avoid script failure on non-200 responses
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());
    
    return JSON.stringify(jsonResponse)
  } catch (error) {
    return JSON.stringify(jsonResponse)
  }
}

function sendMsgByPopup(rowObj)
{
  if(!rowObj)
  {
    rowObj={
        "Time_Stamp": "2025-07-02T17:12:14.203Z",
        "ticket_id": 10202,
        "name": "Prudence",
        "contact_number": 254797257042,
        "estate": "Unity East",
        "block": "A6",
        "phase": "",
        "apartment_no": "09",
        "house_no": "",
        "amenities_maintenance": "",
        "apartment_maintenance": "Heater not working - urgent fix needed due to weather.\n\nPlus faulty DP switch.",
        "billing": "",
        "common_area_maintenance": "",
        "community_matters": "",
        "customer_service": "",
        "other": "",
        "proposed_date": "03/07/2025",
        "proposed_time": "09:45:00",
        "reported_date": "02/07/2025",
        "reported_time": "08:12:13",
        "status": "Assign",
        "user_status_confirmation": "",
        "technician_assigned": "Nitin",
        "technician_expected_date": "2025-07-10",
        "technician_expected_time": "10:00",
        "resolved_at": "",
        "rate_your_experience": "",
        "improvement": "",
        "feedback_at": "",
        "": "",
        "category": "Heater not working - urgent fix needed due to weather.\n\nPlus faulty DP switch.",
        "technician_no": "918866397097"
    }
  }

  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var shWLog=ss.getSheetByName("Whatsapp Log");
  var shContact=ss.getSheetByName("Contacts");
  var shData=ss.getSheetByName("Data");
  var numberList=shContact.getDataRange().getValues();
  var extData=shData.getDataRange().getValues();
  var headers = shData.getRange(2, 1, 1, shData.getLastColumn()).getValues()[0];
  var msgText=shContact.getRange("msgText").getValue();   //supervisor msg
  var techMsg=shContact.getRange("techMsg").getValue();   //techMsg
  var userMsg=shContact.getRange("userMsg").getValue();   //userMsg
  var ATBMsg=shContact.getRange("msgATB_resolved").getValue();   //userMsg
  var resolveMsg=shContact.getRange("resolvedMsg").getValue();   //
  var sendTo,msgName,logArr=[],flag,tempMsg

  var keys=Object.keys(rowObj)
  
  if(rowObj.status=="Open")
  {
    tempMsg=msgText
    for(var i=0;i<keys.length;i++)
    {
      if(rowObj[keys[i]]=="")
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}","NA")
      else
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}",rowObj[keys[i]])
    }

    tempMsg=replaceText(tempMsg,"\n","\\n")

    var numStr=""
    for(var i=2;i<numberList.length;i++)
    {
      if(numberList[i][0]=="")
        break;

      if(numberList[i][0]==rowObj.estate)
      {
        if(numStr=="")
          numStr=numberList[i][2]
        else
          numStr=numStr + ", " + numberList[i][2]

        sendTo=numberList[i][2]
        msgName="unity_homes_user_issue_notification_em"

        response=sendMsgEndUser(sendTo,JSON.parse(tempMsg),msgName)

        shWLog.appendRow([new Date(),ticketId,numberList[i][2],"Supervisor Message",response])
      }
    }
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("techAssCol").getColumn()-2).setValue(rowObj.status)
  }
  else if(rowObj.status=="Assign")
  {
    //send technician Msg
    tempMsg=techMsg
    for(var i=0;i<keys.length;i++)
    {
      if(rowObj[keys[i]]=="")
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}","NA")
      else
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}",rowObj[keys[i]])
    }

    tempMsg=replaceText(tempMsg,"\n","\\n")

    sendTo=rowObj.technician_no
    msgName="unity_homes_issue_notification_technician"
    
    const addAdditionalButton =  {
                "type": "button",
                "sub_type": "quick_reply",
                "index": "0",
                "parameters": [
                  {
                    "type": "payload",
                    "payload": "I have reached to resolve this issue ticketID: "+rowObj.ticket_id
                  }
                ]
            }
    

    response=sendMsgEndUser(sendTo,JSON.parse(tempMsg),msgName,[addAdditionalButton])

    shWLog.appendRow([new Date(),rowObj.ticket_id,sendTo,"Technician Assign Message",response])

    //send end user Msg
    tempMsg=userMsg
    for(var i=0;i<keys.length;i++)
    {
      if(rowObj[keys[i]]=="")
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}","NA")
      else
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}",rowObj[keys[i]])
    }

    tempMsg=replaceText(tempMsg,"\n","\\n")

    sendTo=rowObj.contact_number
    msgName="unity_homes_issue_notification_user"
    
    response=sendMsgEndUser(rowObj.contact_number,JSON.parse(tempMsg),msgName)

    shWLog.appendRow([new Date(),rowObj.ticket_id,rowObj.contact_number,"Technician Assign End User Message",response])
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("techAssCol").getColumn()-2).setValue(rowObj.status)
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("techAssCol").getColumn()).setValue(rowObj.technician_assigned)
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("techAssCol").getColumn()+1).setValue(rowObj.technician_expected_date)
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("techAssCol").getColumn()+2).setValue(rowObj.technician_expected_time)

    return "Technician Assign Successfully."
  }
  else if(rowObj.status=="About to be resolved")
  {
    sendNo=rowObj.contact_number
    msgName="unity_homes_technician_arrival_message"

    tempMsg=ATBMsg
    for(var i=0;i<keys.length;i++)
    {
      if(rowObj[keys[i]]=="")
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}","NA")
      else
        tempMsg=replaceText(tempMsg,"{" + keys[i] + "}",rowObj[keys[i]])
    }
    tempMsg=replaceText(tempMsg,"\n","\\n")

    var buttonPayload='[{\n  "type": "button",\n  "sub_type": "quick_reply",\n  "index": 0,\n  "parameters": [\n    {\n      "type": "payload",\n      "payload": "Technician is Arrived for ticket ticket_id: {ticket_id}"\n    }\n  ]\n},\n{\n  "type": "button",\n  "sub_type": "quick_reply",\n  "index": 1,\n  "parameters": [\n    {\n      "type": "payload",\n      "payload": "Technician is Not Arrived for ticket ticket_id: {ticket_id}"\n    }\n  ]\n}\n]'

    for(var i=0;i<keys.length;i++)
    {
      buttonPayload=replaceText(buttonPayload,"{" + keys[i] + "}",rowObj[keys[i]])
    }
    buttonPayload=JSON.parse(buttonPayload)

    response=sendMsgEndUser(sendNo,JSON.parse(tempMsg),msgName, buttonPayload)
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("techAssCol").getColumn()-2).setValue(rowObj.status)
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("atbResolvedCol").getColumn()).setValue(new Date())

    shWLog.appendRow([new Date(),rowObj.ticket_id,rowObj.contact_number,"ATB Resolved User Message",response])

    return "This ticket status changed to About to be resolved successfully."
  }
  else if(rowObj.status=="Resolved")
  {
    tempMsg=resolveMsg

    for(var i=0;i<keys.length;i++)
    {
      tempMsg=replaceText(tempMsg,"{" + keys[i] + "}",rowObj[keys[i]])
    }

    tempMsg=replaceText(tempMsg,"\n","\\n")
    
    sendTo=rowObj.contact_number
    msgName="unity_homes_issue_resolved_message"

    var buttonPayload='[{\n  "type": "button",\n  "sub_type": "quick_reply",\n  "index": 0,\n  "parameters": [\n    {\n      "type": "payload",\n      "payload": "Issue is Resolved for ticket ticket_id: {ticket_id} and call unity_homes_issue_resolved_message2 function to save logs"\n    }\n  ]\n},\n{\n  "type": "button",\n  "sub_type": "quick_reply",\n  "index": 1,\n  "parameters": [\n    {\n      "type": "payload",\n      "payload": "Issue is Not Resolved for ticket ticket_id: {ticket_id} and call unity_homes_issue_resolved_message2 function to save logs"\n    }\n  ]\n}\n]'
    for(var i=0;i<keys.length;i++)
    {
      buttonPayload=replaceText(buttonPayload,"{" + keys[i] + "}",rowObj[keys[i]])
    }
    buttonPayload=JSON.parse(buttonPayload)

    response=sendMsgEndUser(sendTo,JSON.parse(tempMsg),msgName,buttonPayload)

    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("techAssCol").getColumn()-2).setValue(rowObj.status)
    shData.getRange(shData.getActiveCell().getRow(),shData.getRange("atbResolvedCol").getColumn()+3).setValue(new Date()) 
    shWLog.appendRow([new Date(),rowObj.ticket_id,sendTo,"Ticket Resolved Message",response])

    return "This ticket resolved successfully."
  }
}

function sendMsgTicketResolved(sendNo,data,name)
{
  var url = 'https://graph.facebook.com/v19.0/686448584542854/messages';
  
  var payload = {
    "messaging_product": "whatsapp",
    "to": sendNo,  // The recipient's WhatsApp number
    "type": "template",
    "template": {
      "name": name,
      "language": {
        "code": "EN"
      },
      "components": [
        {
          "type": "BUTTON",
          "sub_type": "FLOW",
          "index": "2",
          "parameters": [
              {
                  "type": "action",
                  "action": {
                      "flow_token": "CUSTOMER FEEDBACK DATA",
                      "flow_action_data": {
                          "TicketID": data,
                          "Rate_your_experience": [
                              {
                                  "id": "★★★★★ • Excellent (5/5)",
                                  "title": "★★★★★ • Excellent (5/5)"
                              },
                              {
                                  "id": "★★★★☆ • Good (4/5)",
                                  "title": "★★★★☆ • Good (4/5)"
                              },
                              {
                                  "id": "★★★☆☆ • Average (3/5)",
                                  "title": "★★★☆☆ • Average (3/5)"
                              },
                              {
                                  "id": "★★☆☆☆ • Poor (2/5)",
                                  "title": "★★☆☆☆ • Poor (2/5)"
                              },
                              {
                                  "id": "★☆☆☆☆ • Very Poor (1/5)",
                                  "title": "★☆☆☆☆ • Very Poor (1/5)"
                              }
                          ],
                          "improvement": ""
                      }
                  }
              }
          ]
        }
      ]
    }
  };
  
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer EAAPNseuBhAkBO5doZCovALFBtCZArx8GFRVGBWsTOEi8TWfoeZCfRsVHLBd4UU4O4EAdftnfzfpKmfrZAQjtGGTr942ZBLsUx4miYBXKEFY5YOAqZCBxWXiimHzvFJRlGGQM6FclUA6x6Jf6tfTzS0bWjqwqBeqlC3poG4D76v3YCCqpHGdEZANAp0ISIr9NNARmEufWvHUuB6ZBwFtFPWRVea4mN3xyMC9taPvx6XcAUuaLGBWXrLgRqgYYLBr4n779SrNGMdp4vAZDZD',
    'Cookie': 'ps_l=0; ps_n=0; ps_l=1; ps_n=1; ps_l=1; ps_n=1'  // Optional: include if needed
  };

  var options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true  // Optional: to avoid script failure on non-200 responses
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());
    
    return JSON.stringify(jsonResponse)
  } catch (error) {
    return JSON.stringify(jsonResponse)
  }
}