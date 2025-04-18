/**
 * מאזין לשינוי בחירת תא בגיליון ושומר את מספר השורה האחרונה שנבחרה.
 * 
 * 🔹 תהליך הפעולה:
 * 1. מזהה כאשר המשתמש משנה את בחירת התא בגיליון.
 * 2. שולף את מספר השורה של התא שנבחר.
 * 3. שומר את השורה האחרונה שנבחרה ב-`PropertiesService` כדי שיהיה ניתן להשתמש בה מאוחר יותר.
 * 4. מוודא שהשורה נשמרה בהצלחה על ידי קריאה חוזרת מה-`PropertiesService`.
 * 5. רושם לוגים לכל שלב כדי לאתר בעיות במהירות.
 * 
 * 🔹 תנאים להפעלה מוצלחת:
 * - הפונקציה חייבת להיות מופעלת כ-`Trigger` מסוג `On selection change`.
 * - הגיליון חייב להיות `SpreadsheetApp` ולא מצב תצוגה בלבד.
 * - חייב להיות תא נבחר, אחרת הפונקציה לא תבצע כל פעולה.
 * 
 * 🔹 שגיאות מטופלות:
 * - אם אין אירוע (`e`), הפונקציה תשתמש בגיליון הפעיל במקום לקרוס.
 * - אם לא נבחר תא, הפונקציה לא תעשה כלום ותירשם הודעה בלוג.
 * - אם יש בעיה בשמירת השורה, הפונקציה תתריע בלוג.
 */
function onSelectionChange(e) {
  try {
    Logger.log("📌 התחלת הפונקציה - onSelectionChange");

    var sheet, range;

    // בדיקה אם האירוע (e) תקף, אם לא - משיגים את הנתונים בצורה ישירה
    if (e && e.getActiveSheet && e.getActiveRange) {
      sheet = e.getActiveSheet();
      range = e.getActiveRange();
    } else {
      Logger.log("⚠️ onSelectionChange: האירוע 'e' לא תקין, משתמשים בגיליון הפעיל במקום.");
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      range = sheet.getActiveRange();
    }

    // אם לא נבחר תא, לא עושים כלום
    if (!range) {
      Logger.log("⚠️ onSelectionChange: לא נבחר תא, אין מה לשמור.");
      return;
    }

    var row = range.getRow();
    Logger.log("📌 onSelectionChange: זוהתה שורה חדשה שנבחרה - " + row);

    // שמירת מספר השורה ב-PropertiesService
    PropertiesService.getScriptProperties().setProperty("lastSelectedRow", row.toString());

    // בדיקת תקינות: לוודא שהשורה נשמרה בהצלחה
    var savedRow = PropertiesService.getScriptProperties().getProperty("lastSelectedRow");

    if (savedRow) {
      Logger.log("✅ onSelectionChange: השורה נשמרה בהצלחה - " + savedRow);
    } else {
      Logger.log("❌ onSelectionChange: שגיאה - השורה לא נשמרה ב-PropertiesService.");
    }

  } catch (err) {
    Logger.log("❌ onSelectionChange - שגיאה בלתי צפויה: " + err.toString());
  }
}
