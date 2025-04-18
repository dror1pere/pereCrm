/**
 * 🔍 מחפש את מזהה הלקוח בטבלת "לקוחות" על פי שם הלקוח.
 *
 * 🚀 **תהליך העבודה:**
 * 1️⃣ **שליפת שורת הכותרת** → שימוש ב-`getHeaderRow()` כדי לקבוע את נקודת ההתחלה לשליפת נתונים.
 * 2️⃣ **קבלת אינדקסי העמודות** → `מזהה` ו-`חברה`, באמצעות `getColumnIndex("לקוחות", columnTitle)`.
 * 3️⃣ **שליפת טווח הנתונים הרלוונטי בלבד**:
 *     - **נשלוף רק את השורות שמתחת לכותרת**.
 *     - **נטען רק את שתי העמודות הנדרשות (`מזהה`, `חברה`)** כדי לשפר ביצועים.
 * 4️⃣ **איתור שם הלקוח בטבלה**:
 *     - אם נמצא → מחזירה את מזהה הלקוח.
 *     - אם לא נמצא → מחזירה `null`.
 *
 * 📌 **שיפורים:**
 * ✅ שימוש ב-`getHeaderRow()` **ללא פרמטרים** כדי להבטיח שהנתונים נשלפים נכון.
 * ✅ שימוש ב-`getColumnIndex("לקוחות", columnTitle)` כדי לקבל את אינדקסי העמודות.
 * ✅ טעינת מינימום נתונים כדי לייעל את הביצועים.
 *
 * @param {string} customerName - שם הלקוח לחיפוש בטבלת "לקוחות".
 * @return {string|null} - מזהה הלקוח אם נמצא, אחרת `null`.
 */
function getExistingCustomerID(customerName) {
    try {
      
        Logger.log(`🔍 חיפוש מזהה לקוח לפי שם: "${customerName}"`);

        // 1️⃣ **בדיקת תקינות הקלט**
        if (!customerName || typeof customerName !== "string" || customerName.trim() === "") {
            Logger.log("❌ שגיאה: שם הלקוח אינו תקין או ריק.");
            return null;
        }

        // 2️⃣ **קבלת הגיליון 'לקוחות'**
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = spreadsheet.getSheetByName("לקוחות");
        if (!sheet) {
            Logger.log("❌ שגיאה: הגיליון 'לקוחות' לא נמצא.");
            return null;
        }

        // 3️⃣ **שליפת שורת הכותרת (ללא פרמטרים)**
        const headerRow = getHeaderRow();
        if (!headerRow || headerRow < 1) {
            Logger.log("❌ שגיאה: שורת הכותרת לא נמצאה או אינה תקינה.");
            return null;
        }

        // 4️⃣ **איתור אינדקסי העמודות באמצעות `getColumnIndex("לקוחות", columnTitle)`**
        const customerIDIndex = getColumnIndex("לקוחות", "מזהה");  // עמודת מזהה לקוח
        const customerNameIndex = getColumnIndex("לקוחות", "חברה"); // עמודת שם לקוח

        if (customerIDIndex === -1 || customerNameIndex === -1) {
            Logger.log("❌ שגיאה: לא נמצאו עמודות 'מזהה' או 'חברה' בגיליון.");
            return null;
        }

        // 5️⃣ **שליפת טווח הנתונים הרלוונטי בלבד (ללא הכותרת)**
        const lastRow = sheet.getLastRow();
        if (lastRow <= headerRow) {
            Logger.log("⚠️ אין נתונים מספיקים בגיליון 'לקוחות'.");
            return null;
        }

        const numRows = lastRow - headerRow;
        const customerNamesRange = sheet.getRange(headerRow + 1, customerNameIndex, numRows, 1).getValues();
        const customerIDsRange = sheet.getRange(headerRow + 1, customerIDIndex, numRows, 1).getValues();

        // 6️⃣ **חיפוש שם הלקוח בטבלה**
        for (let i = 0; i < customerNamesRange.length; i++) {
            if (customerNamesRange[i][0].trim() === customerName.trim()) {
                Logger.log(`✅ נמצא מזהה לקוח: ${customerIDsRange[i][0]}`);
                return customerIDsRange[i][0]; // מחזיר את מזהה הלקוח המתאים
            }
        }

        Logger.log("⚠️ הלקוח לא נמצא בטבלת 'לקוחות'. מחזיר null.");
        return null;

    } catch (error) {
        Logger.log(`❌ שגיאה בפונקציה getExistingCustomerID: ${error.message}`);
        return null;
    }
}
