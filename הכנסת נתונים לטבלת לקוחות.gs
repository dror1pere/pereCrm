/**
 * 🚀 הכנסת נתוני לקוח חדש לטבלת "לקוחות" בגוגל שיטס.
 *
 * 📌 שלבי פעולה:
 * 1️⃣ איתור גיליון "לקוחות"
 * 2️⃣ שליפת שורה ריקה ראשונה
 * 3️⃣ מיפוי שמות שדות בין הטופס לעמודות בגיליון
 * 4️⃣ חישוב ערכים נלווים כמו תאריך סיום עמלה
 * 5️⃣ כתיבת ערכים מסודרת לפי אינדקס עמודות
 * 6️⃣ שמירה בגיליון
 *
 * @param {Object} formData - הנתונים מהטופס
 * @param {string} folderUrl - קישור לספריית הלקוח בדרייב
 * @returns {boolean} true אם הצליח, false אם נכשל
 */
function insertCustomerData(formData, folderUrl) {
  try {
    Logger.log("📂 הכנסת נתוני לקוח לטבלת לקוחות");

    // 1️⃣ איתור גיליון
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("לקוחות");
    if (!sheet) throw new Error("❌ טבלת 'לקוחות' לא נמצאה.");

    // 2️⃣ שורה חדשה
    const lastRow = sheet.getLastRow() + 1;

    // 3️⃣ מיפוי בין שמות עמודות לשדות ב-formData
    const columnMappings = {
      "תאריך_יצירת_שורה": "creationDate",
      "מזהה": "customerID",
      "תאריך_כניסה_למערכת": "entryDate",
      "חודש_כניסה": "monthEntry",
      "שנת_כניסה": "yearEntry",
      "חברה": "customerName",
      "ח.פ/מס עוסק": "taxID",
      "כתובת": "address",
      "דוא\"ל": "email",
      "ספריית_הלקוח": "folderUrl",
      "איש קשר": "contactName",
      "עמלה": "commission",
      "אחוז_עמלה": "commissionRate",
      "מקבל_עמלה": "commissionRecipient",
      "תאריך_סיום_חובת_עמלה": "commissionEndDate"
    };

    // 4️⃣ חישוב ערכים נלווים
    formData.monthEntry = new Date().getMonth() + 1;
    formData.yearEntry = new Date().getFullYear();
    formData.folderUrl = folderUrl || "❌ חסר";

    if (formData.commissionMonths && !isNaN(formData.commissionMonths)) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + formData.commissionMonths);
      formData.commissionEndDate = Utilities.formatDate(endDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else {
      formData.commissionEndDate = "";
    }

    // 5️⃣ שליפת אינדקסים של העמודות
    const columnIndexes = getColumnIndexes("לקוחות");
    if (Object.keys(columnIndexes).length === 0)
      throw new Error("❌ מיפוי עמודות ריק - טבלת 'לקוחות'");

    // 6️⃣ יצירת מערך נתונים לפי מספר העמודות
    const rowData = new Array(sheet.getLastColumn());

    // 7️⃣ מילוי הנתונים לפי המיפוי
    Object.keys(columnMappings).forEach(column => {
      const colIndex = columnIndexes[column];
      const fieldKey = columnMappings[column];

      if (colIndex) {
        rowData[colIndex - 1] = formData[fieldKey] ?? "❌ חסר";
      } else {
        Logger.log(`⚠️ עמודה '${column}' לא נמצאה בגיליון 'לקוחות'.`);
      }
    });

    Logger.log("📊 נתונים לפני שמירה: " + JSON.stringify(rowData));

    // 8️⃣ שמירה
    sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
    Logger.log(`✅ שורה ${lastRow} נשמרה בהצלחה בטבלת 'לקוחות'`);

    return true;

  } catch (error) {
    Logger.log("❌ שגיאה ב־insertCustomerData: " + error.message);
    return false;
  }
}
