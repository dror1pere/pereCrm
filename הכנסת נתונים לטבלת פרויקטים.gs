/**
 * 🚀 הכנסת נתוני פרויקט חדש לטבלת "פרויקטים" בגוגל שיטס.
 * 
 * 📌 **תהליך הפעולה:**
 * 1️⃣ מאתרים את הגיליון "פרויקטים" ובודקים שהוא קיים.
 * 2️⃣ מוצאים את השורה הריקה הראשונה בגיליון.
 * 3️⃣ מגדירים מיפוי בין שמות השדות בגיליון לבין השדות שהתקבלו מהטופס.
 * 4️⃣ שולפים את אינדקסי העמודות מתוך הגיליון.
 * 5️⃣ יוצרים מערך נתונים חדש ומכניסים לתוכו את הנתונים המתאימים.
 * 6️⃣ מטפלים בערכים מיוחדים: תאריכים, עמלות, ספריות וכו'.
 * 7️⃣ שומרים את הנתונים בגיליון בשורה המתאימה.
 * 8️⃣ מחזירים `true` במקרה של הצלחה, או `false` אם הייתה שגיאה.
 * 
 * @param {Object} formData - הנתונים שהוזנו בטופס (כולל שם הפרויקט, מזהה, מזהה לקוח וכו').
 * @param {string} folderUrl - כתובת ספריית הפרויקט בדרייב.
 * @param {Object} templates - כתובות הקבצים שנוצרו (הצעת מחיר, לוג פעילות).
 * @returns {boolean} מחזירה **true** אם הנתונים נשמרו בהצלחה, אחרת **false** במקרה של כשל.
 */
function insertProjectData(formData, folderUrl, templates) {
    try {
        Logger.log("📂 הכנסת נתוני פרויקט לטבלת פרויקטים");

        // 1️⃣ בדיקת קיום הגיליון
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("פרויקטים");
        if (!sheet) throw new Error("❌ טבלת 'פרויקטים' לא נמצאה בגיליון.");

        // 2️⃣ שליפת השורה האחרונה הפנויה
        var lastRow = sheet.getLastRow() + 1;

        // 3️⃣ מיפוי שמות שדות -> עמודות בגיליון
        var columnMappings = {
            "תאריך_יצירת_שורה": "creationDate",
            "מזהה": "projectID",
            "תאריך_כניסה_למערכת": "entryDate",
            "חודש_כניסה": "monthEntry",
            "שנת_כניסה": "yearEntry",
            "מזהה לקוח": "customerID",
            "לקוח": "customerName",
            "איש קשר": "contactPerson",
            "שם_הפרויקט": "projectName",
            "ספריית_הפרויקט": "folderUrl",
            "הצעת_מחיר": "proposalUrl",
            "לוג_פעילות": "logUrl",
            "עמלה": "commission",
            "אחוז_עמלה": "commissionRate",
            "מקבל_עמלה": "commissionRecipient",       // ✅ חדש
            "תאריך_סיום_חובת_עמלה": "commissionEndDate" // ✅ חדש
        };

        // 4️⃣ אינדקסים מהגיליון
        var columnIndexes = getColumnIndexes("פרויקטים");
        if (Object.keys(columnIndexes).length === 0) throw new Error("❌ לא נמצא מיפוי עמודות לטבלת 'פרויקטים'.");

        // 5️⃣ יצירת מערך בגודל העמודות
        var rowData = new Array(sheet.getLastColumn());

        // 6️⃣ מילוי הנתונים
        Object.keys(columnMappings).forEach(column => {
            let colIndex = columnIndexes[column];
            if (colIndex) {
                switch (column) {
                    case "חודש_כניסה":
                        rowData[colIndex - 1] = new Date().getMonth() + 1;
                        break;
                    case "שנת_כניסה":
                        rowData[colIndex - 1] = new Date().getFullYear();
                        break;
                    case "ספריית_הפרויקט":
                        rowData[colIndex - 1] = folderUrl || "❌ חסר";
                        break;
                    case "הצעת_מחיר":
                        rowData[colIndex - 1] = templates?.proposalUrl || "❌ הצעה חסרה";
                        break;
                    case "לוג_פעילות":
                        rowData[colIndex - 1] = templates?.logUrl || "❌ לוג חסר";
                        break;
                    case "אחוז_עמלה":
                        rowData[colIndex - 1] = parseFloat(formData[columnMappings[column]]) / 100 || "❌ אחוז עמלה חסר";
                        break;    
                    default:
                        rowData[colIndex - 1] = formData[columnMappings[column]] ?? "❌ חסר";
                        break;
                }
            } else {
                Logger.log(`⚠️ העמודה '${column}' לא נמצאה בגיליון.`);
            }
        });

        Logger.log("📊 נתונים לפני שמירה בטבלה: " + JSON.stringify(rowData));

        // 7️⃣ כתיבה לשורה החדשה
        sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
        Logger.log(`✅ נתוני הפרויקט נשמרו בהצלחה בשורה ${lastRow}`);

        return true;

    } catch (error) {
        Logger.log("❌ שגיאה בהכנסת נתוני פרויקט: " + error.message);
        return false;
    }
}

