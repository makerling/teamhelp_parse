var labelNameFromTeamhelp = 'fromteamhelp';
var teamhelpTicketingEmailAddress = 'test@gmail.com';
var teamhelpTicketingEmailAddressReply = 'test+reply@gmail.com';

function sendToOriginalSender() {
  //this is the label that catches tickets sent by Service Groups
  var labelFrom = GmailApp.getUserLabelByName(labelNameFromTeamhelp);
  var threads = labelFrom.getThreads();
  if (threads.length == 0 ) {
    Logger.log('there are no emails')
  } else if (threads.length > 0 ) {
    Logger.log('there are some emails')
    //iterate through the messages in the label/folder
    for (var i in threads) {
      messages = threads[i].getMessages(); 
      //processes and edit the original sender's email address
      originalSenderEmail = sub.match(/<.*?>/);
      originalSenderemailString = originalSenderEmail.toString();
      originalSenderEmailStripped = originalSenderemailString.replace(/<|>/g, '');  
      //process and edit the subject to remove SG ID and original sender email address
      sub = messages[0].getSubject();
      originalSubject = sub.replace(/\[[A-Za-z0-9]*\] <.*?> /g,'');        
      //process and edit the email messages replaces intermediate gmail address with original sender's address
      //also replaces support@teamhelp.org with the intermediate gmail address otherwise teamhelp gives error
      msg = messages[0].getBody();
      msgEditedSender = msg.replace(/test2@gmail.com \[unknown\] wrote:/g,'');
      msgEditedSenderReplaced = msgEditedSender.replace(/test2@gmail.com/g,originalSenderEmailStripped);
      msgEditedSenderReplacedSupport = msgEditedSenderReplaced.replace(/support@teamhelp.org/g,teamhelpTicketingEmailAddressReply);       
      //copy the attachments if they exist (needs to be for loop or will cause null error for no attachments)
      for(var j in messages){
        var attch = messages[j].getAttachments();
      }    
      if (attch.length > 0 ) {
        MailApp.sendEmail({    
          to: originalSenderEmailStripped,
          replyTo: teamhelpTicketingEmailAddressReply,
          subject: originalSubject,
          htmlBody: msgEditedSenderReplacedSupport,
          attachments: attch,
        });
      } else if  (attch.length == 0 ) {
        MailApp.sendEmail({    
          to: originalSenderEmailStripped,
          replyTo: teamhelpTicketingEmailAddressReply,
          subject: originalSubject,
          htmlBody: msgEditedSenderReplacedSupport,
        });
      }
      //archives the email to ensure that it doesn't get processed more than once
      threads[i].markRead();
      threads[i].removeLabel(labelFrom);
    }
  }
}
