/**
 * 🚀 getCommissionRecipientsData - מחזירה את רשימת מקבלי העמלה מהטבלה "מקבלי עמלה".
 *
 * 📌 תהליך הפעולה:
 * 1️⃣ מאתרת את שורת הכותרת בגיליון באמצעות `getHeaderRow()`.
 * 2️⃣ שולפת את אינדקסי העמודות הרלוונטיות: "שם", "אחוז_עמלה", "חודשי_עמלה" בעזרת `getColumnIndex`.
 * 3️⃣ מחשבת את מספר השורות לאחר הכותרת.
 * 4️⃣ שולפת את כל השורות אך מתמקדת רק בעמודות הדרושות.
 * 5️⃣ בונה מערך של אובייקטים לפי העמודות שביקשנו.
 * 
 * 📎 החזרה: מערך של אובייקטים במבנה:
 * [
 *   { name: "יעל כהן", rate: 12, months: 6 },
 *   { name: "דני לוי", rate: 15, months: 12 },
 *   ...
 * ]
 *
 * @returns {Array<Object>} רשימת מקבלי העמלה, או [] אם יש שגיאה או שהטבלה ריקה.
 */
function getCommissionRecipientsData() {
  const sheetName = "מקבלי עמלה";

  try {
    Logger.log("📥 התחלת שליפת מקבלי העמלה מהטבלה '%s'", sheetName);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`❌ הגיליון '${sheetName}' לא נמצא.`);
    }

    // 1️⃣ קבלת שורת כותרת
    const headerRow = getHeaderRow(); // מחזיר מספר שורה (לדוגמה: 2)
    if (!headerRow) {
      throw new Error(`❌ לא נמצאה שורת כותרת לגיליון '${sheetName}'.`);
    }

    // 2️⃣ שליפת אינדקסי עמודות
    const nameCol = getColumnIndex(sheetName, "שם");
    const rateCol = getColumnIndex(sheetName, "אחוז_עמלה");
    const monthsCol = getColumnIndex(sheetName, "חודשי_עמלה");

    if (!nameCol || !rateCol || !monthsCol) {
      throw new Error(`❌ אחת מהעמודות 'שם', 'אחוז_עמלה', 'חודשי_עמלה' לא נמצאה.`);
    }

    // 3️⃣ חישוב מספר השורות
    const lastRow = sheet.getLastRow();
    const numRows = lastRow - headerRow;
    if (numRows <= 0) {
      Logger.log("⚠️ אין נתונים בטבלת מקבלי העמלה.");
      return [];
    }

    // 4️⃣ שליפת כל השורות הדרושות
    const dataRange = sheet.getRange(headerRow + 1, 1, numRows, sheet.getLastColumn());
    const allData = dataRange.getValues();

    // 5️⃣ מיפוי רק של העמודות הרצויות
    const results = allData.map(row => ({
      name: row[nameCol - 1],
      rate: row[rateCol - 1],
      months: row[monthsCol - 1]
    }));

    Logger.log(`✅ נמצאו ${results.length} מקבלי עמלה תקפים.`);
    return results;

  } catch (error) {
    Logger.log("❌ שגיאה בפונקציה getCommissionRecipientsData: " + error.message);
    return [];
  }
}
