//This script will process emails in the labelName folder in Gmail
//It will process the SG name in the to: field and concatenate the SG and from: email address in the subject
//To test this script edit the following variables:
// labelName: the name of the label in Gmail that catches the Teamhelp requests
// teamhelpTicketingEmailAddress: the email address of the 'final destination' (in production the teamhelp email address)

var labelName = '1Teamhelpscript';
var teamhelpTicketingEmailAddress = 'test@something.com';

function editSubject() {
  //this is the label that catches tickets sent by Service Groups
  var label = GmailApp.getUserLabelByName(labelName);
  var threads = label.getThreads();
  //iterate through the messages in the label/folder
  for (var i in threads) {
    messages = threads[i].getMessages(); 
    to = messages[0].getTo();
    from = messages[0].getFrom();
    //matches the email address only so when Teamhelp sends out replies
    //the address can be parsed from the subject line and routed to the original sender
    senderEmail = from.match(/<.*?>/);
    //processes the to: address, pulls out the service group ID alias (e.g. name_lastname+ID@org.com)
    serviceGroupID = '[' + to.match(/[A-Za-z0-9]*(?=@)/) + '] ';
    sub = messages[0].getSubject();
    msg = messages[0].getBody();
    attch = messages[1].getAttachments(); 
    //archives the email to ensure that it doesn't get processed more than once
    threads[i].markRead();
    threads[i].removeLabel(label);
    threads[i].moveToArchive();
     MailApp.sendEmail({
       to: teamhelpTicketingEmailAddress,
       //replyTo address so that Teamhelp's responses can be sent directly to the user - doesn't seem to work
       //Teamhelp doesn't honor the reply-to field, only sends responses using from address
       replyTo: from,
       //the magic line that concatenates the Service Group ID with the sender's email address and original subject
       subject: serviceGroupID + senderEmail + " " + sub,
       htmlBody: msg,
       attachments: attch
   });
  }
}
