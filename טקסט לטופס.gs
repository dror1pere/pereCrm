function הצג_טופס_בדיקה_לקוח_חדש() {
  const html = HtmlService.createHtmlOutputFromFile("טופס-לקוח-חדש-גרסה-חדשה")
    .setTitle("בדיקת טופס לקוח חדש")
    .setWidth(700)
    .setHeight(600);
    
  SpreadsheetApp.getUi().showModalDialog(html, "בדיקת טופס לקוח חדש");
}
