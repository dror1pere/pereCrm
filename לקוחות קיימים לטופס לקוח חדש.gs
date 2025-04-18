/**
 * מחזירה את שמות הלקוחות הפתוחים בלבד (שעמודת "סגור" מכילה false).
 * @return {Array} רשימת שמות הלקוחות הפתוחים.
 */
function getExistingCustomers() {
    try {
        Logger.log("🔍 שליפת רשימת הלקוחות הפתוחים בלבד");

        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("לקוחות");
        var headerRow = getHeaderRow(); // שליפת שורת הכותרת בפועל
        var lastRow = sheet.getLastRow();

        if (lastRow <= headerRow) {
            Logger.log("⚠️ אין לקוחות במערכת, מחזיר מערך ריק.");
            return [];
        }

        // מציאת אינדקסי העמודות "חברה" ו-"סגור"
        var companyColIndex = getColumnIndex("לקוחות", "חברה");
        var closedColIndex = getColumnIndex("לקוחות", "סגור");

        if (!companyColIndex || !closedColIndex) {
            Logger.log("❌ שגיאה: אחת העמודות ('חברה' או 'סגור') לא נמצאה.");
            return [];
        }

        // שליפת כל הנתונים הנדרשים
        var dataRange = sheet.getRange(headerRow + 1, 1, lastRow - headerRow, sheet.getLastColumn()).getValues();

        // סינון לקוחות פתוחים בלבד (כאשר "סגור" = false)
        var openCustomers = dataRange
            .filter(row => !row[closedColIndex - 1]) // בודקים אם עמודת "סגור" היא false
            .map(row => row[companyColIndex - 1]) // מחזירים את שם החברה בלבד
            .filter(name => name); // סינון ערכים ריקים

        Logger.log(`✅ נמצאו ${openCustomers.length} לקוחות פתוחים.`);
        return openCustomers;
        
    } catch (error) {
        Logger.log("❌ שגיאה בשליפת לקוחות פתוחים: " + error.message);
        return [];
    }
}

