/**
 * 🚀 מחזירה את המספר הזמין הבא ליצירת מזהה חדש בגיליון המתאים.
 *
 * 📌 **כללים:**
 * 1️⃣ **אם מדובר בטבלת "פרויקטים"**:
 *    - אם הטבלה ריקה → מחזירה `1-1` (פרויקט שיווק ראשון).
 *    - אם *לא* נשלח מזהה לקוח → מחזירה מספר חדש **לפרויקט שיווק (`-1`)**.
 *    - אם נשלח מזהה לקוח:
 *        ✅ אם ללקוח יש **פרויקט שיווק (`-1`) שאין לו פרויקט ראשי (`-2`) תואם** → מחזירה את **המזהה המשלים (`-2`)**.
 *        ✅ אם לכל `-1` כבר יש `-2` → מחזירה **מזהה חדש לפרויקט שיווק (`-1`)**.
 * 2️⃣ **עבור כל טבלה אחרת**:
 *    - אם הטבלה ריקה → מחזירה `1`.
 *    - אם יש נתונים → מחזירה את המונה הרגיל.
 *
 * @param {string} sheetName - שם הגיליון
 * @param {string|null} customerID - מזהה הלקוח (אם מדובר בפרויקט חדש של לקוח קיים)
 * @return {string} המזהה הבא המתאים לפי הכללים
 */
function getNextAvailableCounter(sheetName, customerID = null) {
  
    try {
        Logger.log(`🔍 התחלת חישוב המונה הבא לגיליון '${sheetName}' עבור לקוח: ${customerID || "לקוח חדש"}`);

        // 🟢 שלב 1: קבלת הגיליון
        let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            Logger.log(`❌ שגיאה: הגיליון '${sheetName}' לא נמצא.`);
            return "1"; 
        }

        // 🟢 שלב 2: איתור עמודות "מזהה" ו-"מזהה לקוח"
        let headerRow = getHeaderRow();
        let idColumnIndex = getColumnIndex(sheetName, "מזהה");
        let customerColumnIndex = getColumnIndex(sheetName, "מזהה לקוח");

        if (idColumnIndex === null || (sheetName === "פרויקטים" && customerColumnIndex === null)) {
            Logger.log(`❌ שגיאה: עמודת "מזהה" או "מזהה לקוח" לא נמצאו בגיליון '${sheetName}'.`);
            return "1";
        }

        // 🟢 שלב 3: בדיקה אם הטבלה ריקה
        let lastRow = sheet.getLastRow();
        if (lastRow <= headerRow) {
            Logger.log(`⚠️ הטבלה '${sheetName}' ריקה. מחזירים ערך ברירת מחדל.`);
            return (sheetName === "פרויקטים") ? "1-1" : "1"; 
        }

        // 🟢 שלב 4: שליפת נתוני הטבלה
        let dataRange = sheet.getRange(headerRow + 1, 1, lastRow - headerRow, sheet.getLastColumn());
        let data = dataRange.getValues();

        // 🟢 שלב 5: טיפול בטבלת "פרויקטים"
        if (sheetName === "פרויקטים") {
            if (!customerID) {
                // 🔹 לקוח חדש → פרויקט שיווק חדש עם מזהה חדש
                let nextID = getMaxBaseProjectID(data, idColumnIndex) + 1;
                Logger.log(`✅ יצירת פרויקט שיווק חדש (לקוח חדש): ${nextID}-1`);
                return `${nextID}-1`;
            }

            // 🔹 שליפת כל הפרויקטים של הלקוח
            let projectsForCustomer = data.filter(row => row[customerColumnIndex - 1] == customerID);

            // 🔍 שלב 6: איתור פרויקט שיווק (`-1`) שאין לו פרויקט ראשי (`-2`) תואם
            let marketingProjects = projectsForCustomer
                .map(row => row[idColumnIndex - 1])
                .filter(id => /-1$/.test(id))
                .map(id => id.split("-")[0]);

            let mainProjects = projectsForCustomer
                .map(row => row[idColumnIndex - 1])
                .filter(id => /-2$/.test(id))
                .map(id => id.split("-")[0]);

            // 🔹 מציאת פרויקט `-1` שאין לו `-2`
            let orphanMarketingProject = marketingProjects.find(id => !mainProjects.includes(id));

            if (orphanMarketingProject) {
                Logger.log(`✅ נמצא פרויקט שיווק (${orphanMarketingProject}-1) שאין לו פרויקט ראשי. יוצרים את (${orphanMarketingProject}-2).`);
                return `${orphanMarketingProject}-2`;
            }

            // 🔍 שלב 7: אם לכל `-1` כבר יש `-2`, יוצרים מזהה חדש עם `-1`
            let nextID = getMaxBaseProjectID(data, idColumnIndex) + 1;
            Logger.log(`✅ לכל פרויקט שיווק יש פרויקט ראשי. יוצרים פרויקט שיווק חדש: ${nextID}-1`);
            return `${nextID}-1`;
        }

        // 🟢 שלב 8: טיפול בטבלאות אחרות
        let maxID = data
            .map(row => {
                let match = row[idColumnIndex - 1].toString().match(/\d+$/);
                return match ? parseInt(match[0], 10) : 0;
            })
            .filter(num => !isNaN(num))
            .reduce((max, num) => Math.max(max, num), 0);

        Logger.log(`✅ מספר מזהה הבא ל-${sheetName}: ${maxID + 1}`);
        return (maxID + 1).toString();

    } catch (error) {
        Logger.log(`❌ שגיאה בשליפת המונה עבור '${sheetName}': ${error}`);
        return "1";
    }
}


/**
 * 🚀 מזהה את המספר הבסיסי הגבוה ביותר של פרויקטים בטבלת הפרויקטים.
 *    - מתעלם מהתוספות (`-1` או `-2`) ומחזיר רק את המספר הבסיסי הגבוה ביותר.
 *
 * @param {Array} data - מערך נתונים מטבלת הפרויקטים
 * @param {number} idColumnIndex - אינדקס של עמודת המזהה (1 מבוסס, לא 0 מבוסס)
 * @return {number} המספר הבסיסי הגבוה ביותר שנמצא
 */
function getMaxBaseProjectID(data, idColumnIndex) {
    try {
        Logger.log("📌 התחלת `getMaxBaseProjectID`");
        Logger.log(`📊 מספר שורות בטבלה: ${data.length}, אינדקס עמודת מזהה: ${idColumnIndex}`);

        if (!data || data.length === 0) {
            Logger.log("⚠️ הנתונים ריקים – מחזיר 1.");
            return 1; // עכשיו מתחילים מ-1 במקום 0
        }

        let baseIDs = [];

        // 🔄 מעבר על כל השורות כדי לאתר את המזהים
        data.forEach((row, rowIndex) => {
            let cellValue = row[idColumnIndex - 1];

            if (!cellValue) {
                Logger.log(`⚠️ שורה ${rowIndex + 1}: שדה ריק`);
                return; // דילוג על שורות ריקות
            }

            let cellText = cellValue.toString().trim();
            Logger.log(`🔎 שורה ${rowIndex + 1}: מזהה נמצא '${cellText}'`);

            let match = cellText.match(/(\d+)-?\d?$/);

            if (match) {
                let baseID = parseInt(match[1], 10); // לוקח את המספר `XXXXX`
                if (!isNaN(baseID)) {
                    baseIDs.push(baseID);
                    Logger.log(`✅ מזהה תקין נמצא: ${baseID}`);
                } else {
                    Logger.log(`⚠️ מזהה לא חוקי בשורה ${rowIndex + 1}: '${cellText}'`);
                }
            } else {
                Logger.log(`⚠️ המזהה לא תואם תבנית בשורה ${rowIndex + 1}: '${cellText}'`);
            }
        });

        if (baseIDs.length === 0) {
            Logger.log("⚠️ לא נמצאו מזהים חוקיים – מחזיר 1.");
            return 1;
        }

        let maxBaseID = Math.max(...baseIDs);
        Logger.log(`🏆 המזהה הבסיסי הגבוה ביותר שנמצא: ${maxBaseID}`);
        return maxBaseID;

    } catch (error) {
        Logger.log(`❌ שגיאה ב- getMaxBaseProjectID: ${error.message}`);
        return 1;
    }
}

