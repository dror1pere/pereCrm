/**
 * 🏷️ מחזירה את מספר שורת הכותרות מגיליון "טבלאות".
 * 
 * 🔹 תהליך העבודה:
 * 1️⃣ בודקת אם הגיליון "טבלאות" קיים - אם לא, מחזירה ברירת מחדל 6.
 * 2️⃣ מאחזרת את הערך מתא B1 וממירה למספר.
 * 3️⃣ אם הערך אינו תקין (`NaN` או ריק) → מחזירה 6 כברירת מחדל.
 * 
 * @return {number} מספר שורת הכותרות.
 */
function getHeaderRow() {
    try {
        Logger.log("📂 התחלת שליפת מספר שורת הכותרות מגיליון 'טבלאות'.");

        var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("טבלאות");
        if (!settingsSheet) {
            Logger.log("❌ שגיאה: גיליון 'טבלאות' לא נמצא! שימוש בברירת מחדל 6.");
            return 6;
        }

        var headerRow = settingsSheet.getRange("B1").getValue();
        var parsedRow = parseInt(headerRow, 10);

        if (isNaN(parsedRow) || parsedRow < 1) {
            Logger.log("⚠️ הערך שנמצא ב-B1 אינו מספר תקין. שימוש בברירת מחדל 6.");
            return 6;
        }

        Logger.log("✅ מספר שורת הכותרות בגיליון 'טבלאות': " + parsedRow);
        return parsedRow;

    } catch (error) {
        Logger.log("❌ שגיאה בשליפת מספר שורת הכותרות: " + error.message);
        return 6;
    }
}
