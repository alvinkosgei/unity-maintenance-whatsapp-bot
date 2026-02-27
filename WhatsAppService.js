/**
 * Sends a WhatsApp template message and logs the delivery in "Whatsapp Log" sheet
 * @param {string} to - Recipient phone number in international format
 * @param {string} templateName - Name of the approved WhatsApp template
 * @param {string} languageCode - Language code (e.g., "EN")
 * @param {Array<string>} bodyParams - Dynamic text values for template body placeholders
 * @param {Array<string>} buttonParams - Optional quick reply button parameters
 * @param {string} ticketId - (Optional) Ticket ID for logging
 * @param {string} description - Description of the message (e.g., "Reminder", "Ticket Resolved")
 */
function sendWhatsAppTemplateMessage(to, templateName, languageCode, bodyParams = [], buttonParams = [], ticketId = "", description = "") {
  const url = "https://graph.facebook.com/v19.0/686448584542854/messages";
  const token = "EAAPNseuBhAkBO7O09cZAw3JZABtbZBoq3WTUZBZCO9xgDqjjBIQ9PPFe6jXMVPUszvMHFI8MpsPDxWkx4lzBLEfgMlQkVnPZCYXkoIAwBCTnd2XpmPZCbZBvpwtl2pElZCqJrP9bEVglfgZCj1Rze4KtGkpRVFeyg23Is0zi2dLUEJXSZBEMEI5aar9fF2lpwv6usEuEzlk0PX0bGJhqsCxHG2Rfzf6z1BSFsOMXv3Bp6eeDd38nBUuFAyfEtu44Huc97ZBAiddws0TXewZDZD";

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode || "EN"
      },
      components: []
    }
  };

  if (bodyParams.length > 0) {
    payload.template.components.push({
      type: "body",
      parameters: bodyParams.map(param => ({
        type: "text",
        text: param
      }))
    });
  }

  if(templateName=="unity_homes_feedback")
  {
    for (i=0; i<buttonParams.length;i++) {
      payload.template.components.push({
        type: "button",
        sub_type: "flow",
        index: i,
        parameters: [{
          type: "action",
          action:{
            flow_token:"FEEDBACK",
            flow_action_data:{
              "TicketID":buttonParams[i]
            }
          }
          // payload: buttonParams[i]
        }]
      })
    };
  }
  else
  {
    for (i=0; i<buttonParams.length;i++) {
      payload.template.components.push({
        type: "button",
        sub_type: "quick_reply",
        index: i,
        parameters: [{
          type: "payload",
          payload: buttonParams[i]
        }]
      })
    };
  }

  console.log(JSON.stringify(payload))
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  let responseText = "";
  try {
    const response = UrlFetchApp.fetch(url, options);
    responseText = response.getContentText();
    Logger.log(`✅ WhatsApp message sent to ${to}: ${responseText}`);
  } catch (e) {
    responseText = `❌ Error: ${e.message}`;
    Logger.log(`❌ Failed to send WhatsApp message to ${to}: ${e.message}`);
  }

  // Log the message
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shWLog = ss.getSheetByName("Whatsapp Log") || ss.insertSheet("Whatsapp Log");
    shWLog.appendRow([
      new Date(),
      ticketId || "N/A",
      to,
      description || templateName,
      responseText
    ]);
  } catch (logError) {
    Logger.log(`⚠️ Failed to write to WhatsApp log: ${logError.message}`);
  }

  return responseText;
}
