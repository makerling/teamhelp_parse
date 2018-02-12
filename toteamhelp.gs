//This script will process emails in the labelNameToTeamhelp folder in Gmail
//It will process the SG name in the to: field and concatenate the SG and from: email address in the subject
//To test this script edit the following variables:
// labelName: the name of the label in Gmail that catches the Teamhelp requests
// teamhelpTicketingEmailAddress: the email address of the 'final destination' (in production the teamhelp email address)

var labelNameToTeamhelp = 'toteamhelp';
var teamhelpTicketingEmailAddress = 'test@gmail.com';
var teamhelpTicketingEmailAddressReply = 'test+reply@gmail.com';

function sendToTeamhelp() {
  //this is the label that catches tickets sent by Service Groups
  var labelTo = GmailApp.getUserLabelByName(labelNameToTeamhelp);
  var threads = labelTo.getThreads();
  if (threads.length == 0 ) {
    Logger.log('there are no emails')
  } else if (threads.length > 0 ) {
    Logger.log('there are some emails')  
    //iterate through the messages in the label/folder
    for (var i in threads) {
      messages = threads[i].getMessages(); 
      to = messages[0].getTo();
      from = messages[0].getFrom();
      //processes and edit the original sender's email address
      senderEmail = from.match(/<.*?>/);
      senderEmailString = senderEmail.toString();
      senderEmailStripped = senderEmailString.replace(/<|>/g, '');
      //processes the to: address, pulls out the service group ID alias (e.g. name_lastname+ID@org.com)
      serviceGroupID = '[' + to.match(/[A-Za-z0-9]*(?=@)/) + '] ';
      //process and edit the subject to remove SG ID and original sender email address      
      sub = messages[0].getSubject();
      //process and edit the email messages (adds a line to top of body of email so Admin knows original sender)     
      msg = messages[0].getBody();
      joinedMsg = '<a href=\"mailto:' + senderEmailStripped + '\">' + senderEmailStripped + '<\/a>' + ' wrote:\n\n' + msg
      //copy the attachments if they exist (needs to be for loop or will cause null error for no attachments)
      for(var j in messages){
        var attch = messages[j].getAttachments();
      };
      if (attch.length > 0 ) {
        MailApp.sendEmail({
          to: teamhelpTicketingEmailAddress,
          subject: serviceGroupID + ' ' + senderEmail + ' ' + sub,                
          htmlBody: joinedMsg,       
          attachments: attch,
        });
      } else if  (attch.length == 0 ) {
        MailApp.sendEmail({
          to: teamhelpTicketingEmailAddress,
          subject: serviceGroupID + " " + senderEmail + " " + sub,                
          htmlBody: joinedMsg,
        });
      }
      //archives the email to ensure that it doesn't get processed more than once
      threads[i].markRead();
      threads[i].removeLabel(labelTo);
    }
  }
}
