function הצג_טופס_בדיקה_לקוח_חדש() {
  const html = HtmlService.createHtmlOutputFromFile("טופס-לקוח-חדש-גרסה-חדשה")
    .setTitle("בדיקת טופס לקוח חדש")
    .setWidth(700)
    .setHeight(600);
    
  SpreadsheetApp.getUi().showModalDialog(html, "בדיקת טופס לקוח חדש");
}

/**
 * פונקציה 001: include
 * מטרת הפונקציה: טעינת תוכן HTML מקובץ בפרויקט Apps Script והחזרתו כתוכן גולמי לשימוש בתוך תבנית HTML.
 * שימוש טיפוסי: <?= include('שם קובץ') ?>
 *
 * פרמטרים:
 * @param {string} filename – שם הקובץ (ללא סיומת) שיש לטעון מתוך פרויקט הסקריפט.
 *
 * מחזירה:
 * @return {string} תוכן HTML גולמי מתוך הקובץ שנטען. במקרה של שגיאה – מחזירה מחרוזת ריקה ורושמת שגיאה בלוג.
 */
function include(filename) {
  // שלב 1: בדיקה שהפרמטר שהועבר תקין (מחרוזת שאינה ריקה)
  if (!filename || typeof filename !== "string") {
    console.error("🛑 include - שם הקובץ לא תקין או ריק:", filename);
    return "";
  }

  try {
    // שלב 2: ניסיון לקרוא את תוכן הקובץ HTML מתוך הפרויקט
    console.log(`📄 include - מנסה לטעון את הקובץ: ${filename}`);
    const content = HtmlService.createHtmlOutputFromFile(filename).getContent();

    // שלב 3: החזרת התוכן שנמצא
    console.log(`✅ include - הקובץ נטען בהצלחה: ${filename}`);
    return content;

  } catch (error) {
    // שלב 4: טיפול בשגיאה בעת טעינת הקובץ
    console.error(`❌ include - שגיאה בטעינת הקובץ: ${filename}`, error);
    return "";
  }
}
