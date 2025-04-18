/**
 * 🚀 הכנסת נתוני משימה לטבלת "פעילות".
 *
 * 📌 תהליך העבודה:
 * 1️⃣ בודקת אם הגיליון "פעילות" קיים.
 * 2️⃣ שולפת את האינדקסים של העמודות בטבלה.
 * 3️⃣ ממלאת את הערכים לפי הנתונים מהטופס.
 * 4️⃣ מעדכנת את הנתונים בשורה חדשה בטבלה.
 *
 * @param {Object} formData - הנתונים מהטופס.
 * @returns {boolean} מחזירה **true** אם הנתונים נשמרו בהצלחה, אחרת **false** במקרה של כשל.
 */
function insertTaskData(formData) {
    try {
        Logger.log("📂 הכנסת נתוני משימה לטבלת פעילות");

        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("פעילות");
        if (!sheet) {
            throw new Error("❌ טבלת 'פעילות' לא נמצאה בגיליון.");
        }

        var lastRow = sheet.getLastRow() + 1;

        // 🔹 מיפוי שמות עמודות בטבלת "פעילות" לשמות השדות בטופס
        var columnMappings = {
            "תאריך_יצירת_שורה": "creationDate",
            "מזהה": "taskID",
            "תאריך_כניסה_למערכת": "entryDate",
            "חודש_כניסה": "monthEntry",
            "שנת_כניסה": "yearEntry",
            "מזהה לקוח": "customerID",
            "לקוח": "customerName",
            "איש קשר": "contactPerson",
            "מזהה פרויקט": "projectID",
            "פרויקט": "projectName",
            "משימה": "taskDescription",
            "משעה": "startTime",
            "לוג_פעילות": "activityLogLink" // ✅ נוסף לטובת לוג הפעילות
        };

        // 🔹 קבלת אינדקסי העמודות בטבלה
        var columnIndexes = getColumnIndexes("פעילות");

        if (Object.keys(columnIndexes).length === 0) {
            throw new Error("❌ לא נמצא מיפוי עמודות לטבלת 'פעילות'.");
        }

        var rowData = new Array(sheet.getLastColumn()); // ברירת מחדל לכל העמודות

        // 🔹 מילוי הנתונים בטבלה בהתאם למיפוי
        Object.keys(columnMappings).forEach(column => {
            let colIndex = columnIndexes[column]; // קבלת האינדקס מתוך המיפוי
            if (colIndex) {
                if (column === "חודש_כניסה") {
                    rowData[colIndex - 1] = new Date().getMonth() + 1;
                } else if (column === "שנת_כניסה") {
                    rowData[colIndex - 1] = new Date().getFullYear();
                } else {
                    rowData[colIndex - 1] = formData[columnMappings[column]] || "❌ חסר";
                }
            } else {
                Logger.log(`⚠️ עמודה '${column}' לא נמצאה בגיליון 'פעילות'.`);
            }
        });

        Logger.log("📊 נתונים לפני שמירה בטבלת פעילות: " + JSON.stringify(rowData));

        // 🔹 עדכון הנתונים בטבלה
        sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
        Logger.log(`✅ נתוני המשימה נשמרו בטבלת פעילות בשורה ${lastRow}`);

        return true;

    } catch (error) {
        Logger.log("❌ שגיאה בהכנסת נתוני משימה: " + error.message);
        return false;
    }
}
