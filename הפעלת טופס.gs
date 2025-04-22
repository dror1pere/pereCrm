/**
 * פונקציה 001: openFormBySheetName
 * פתיחת טופס דינאמי לפי שם הגיליון הפעיל.
 *
 * 📌 שלבי פעולה:
 * 1️⃣ זיהוי שם הגיליון הפעיל בגוגל שיטס.
 * 2️⃣ מיפוי שם הגיליון לשם קובץ הסכמה.
 * 3️⃣ טעינת תבנית HTML של "טופס כללי".
 * 4️⃣ הצבת שם קובץ הסכמה בפרופרטי dynamicSchema.
 * 5️⃣ רינדור והצגת הטופס כ־Modal.
 * 6️⃣ טיפול בשגיאות ותיעוד בלוגים.
 */
function openFormBySheetName() {
  console.log("📥 [openFormBySheetName] ▶ התחלת פתיחת טופס לפי שם הגיליון");

  try {
    // 1️⃣ שליפת שם הגיליון הפעיל
    const sheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    console.log(`📄 [openFormBySheetName] ▶ שם הגיליון הפעיל: '${sheetName}'`);

    // 2️⃣ מיפוי שמות גיליונות לשמות קבצי סכמות
    const schemaMap = {
      "לקוחות": "סכמה - לקוח חדש",
      "פרויקטים": "סכמה - פרויקט חדש",
      "משימות": "סכמה - משימה חדשה"
    };

    const schemaFileName = schemaMap[sheetName];

    // 3️⃣ בדיקה האם יש סכמה מתאימה לגיליון
    if (!schemaFileName) {
      const message = `❌ לא מוגדרת סכמה לגיליון: '${sheetName}'`;
      console.error(`[openFormBySheetName] ${message}`);
      SpreadsheetApp.getUi().alert(message);
      return;
    }

    // 4️⃣ יצירת תבנית HTML דינאמית
    const template = HtmlService.createTemplateFromFile("טופס כללי");
    template.dynamicSchema = schemaFileName;

    // 5️⃣ רינדור והצגת הדיאלוג
    const html = template.evaluate()
      .setWidth(600)
      .setHeight(700)
      .setTitle("טופס דינאמי");

    SpreadsheetApp.getUi().showModalDialog(html, `📋 פתיחת טופס: ${sheetName}`);
    console.log(`✅ [openFormBySheetName] ▶ טופס עבור '${sheetName}' נפתח בהצלחה`);

  } catch (error) {
    // 6️⃣ טיפול בשגיאות
    console.error("❌ [openFormBySheetName] שגיאה כללית:", error);
    SpreadsheetApp.getUi().alert("❌ שגיאה כללית בפתיחת הטופס. נסה שוב.");
  }
}


/**
 * פונקציה 001: include
 * 🧩 טוענת קובץ HTML מהפרויקט ומחזירה את תוכנו כתוכן גולמי.
 * ➤ מיועדת להכללה בתבניות HTML (`<?!= include(...) ?>`)
 *
 * 📌 שלבי פעולה:
 * 1️⃣ בודקת אם הקובץ קיים בפרויקט
 * 2️⃣ טוענת את תוכן הקובץ באמצעות HtmlService
 * 3️⃣ רושמת לוגים בעת הצלחה או שגיאה
 * 4️⃣ מחזירה את התוכן כ־string
 *
 * @param {string} filename – שם קובץ HTML ללא סיומת
 * @returns {string} תוכן הקובץ או הודעת שגיאה HTML
 */
function include(filename) {
  console.log(`[001/include] ▶ התחלת טעינה עבור: '${filename}'`);

  try {
    // שלב 1️⃣ – יצירת אובייקט HtmlOutput מהקובץ
    const htmlOutput = HtmlService.createHtmlOutputFromFile(filename);

    // שלב 2️⃣ – שליפת תוכן גולמי
    const content = htmlOutput.getContent();

    // שלב 3️⃣ – לוג הצלחה
    console.log(`[001/include] ✅ הקובץ '${filename}' נטען בהצלחה`);
    return content;

  } catch (error) {
    // שלב 4️⃣ – טיפול בשגיאה ולוג מתאים
    console.error(`[001/include] ❌ שגיאה בטעינת קובץ '${filename}':`, error);
    return `<div style="color:red;">שגיאה בטעינת הקובץ: ${filename}</div>`;
  }
}
