/**
 * מחזירה רשימת לקוחות קיימים עם שם ומזהה ייחודי לטופס פתיחת פרויקט.
 * @return {Array} רשימת לקוחות כ-Objects [{ name: "שם הלקוח", id: "מזהה" }]
 */
function getCustomersForProjectsForm() {
    try {
        Logger.log("📌 התחלת שליפת לקוחות לטופס פתיחת פרויקט");

        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("לקוחות");
        var headerRow = getHeaderRow(); // קבלת מספר שורת הכותרות
        var lastRow = sheet.getLastRow();

        if (lastRow <= headerRow) {
            Logger.log("⚠️ אין נתונים בטבלת לקוחות, מחזיר רשימה ריקה.");
            return [];
        }

        var companyIndex = getColumnIndex("לקוחות", "חברה");
        var idIndex = getColumnIndex("לקוחות", "מזהה");

        if (!companyIndex || !idIndex) {
            Logger.log("❌ שגיאה: אחת מהעמודות ('חברה' או 'מזהה') לא נמצאה בגיליון.");
            return [];
        }

        var data = sheet.getRange(headerRow + 1, 1, lastRow - headerRow, sheet.getLastColumn()).getValues();
        var customers = data.map(row => ({
            name: row[companyIndex - 1].toString().trim(),
            id: row[idIndex - 1].toString().trim()
        })).filter(customer => customer.name && customer.id); // מסנן רשומות ריקות

        Logger.log(`✅ נמצאו ${customers.length} לקוחות`);
        return customers;

    } catch (error) {
        Logger.log("❌ שגיאה בשליפת לקוחות לטופס פתיחת פרויקט: " + error.message);
        return [];
    }
}
