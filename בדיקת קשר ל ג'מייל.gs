function testGmailPermission() {
  var threads = GmailApp.search('is:unread');
  Logger.log('נמצאו ' + threads.length + ' שרשורים לא נקראים.');
}