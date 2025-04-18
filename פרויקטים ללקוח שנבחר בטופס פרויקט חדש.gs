/**
 * מחזירה רשימה של פרויקטים ואנשי הקשר המשויכים ללקוח מסוים.
 *
 * 🔹 הפונקציה מבצעת שליפה מתוך גיליון "פרויקטים".
 * 🔹 מאחזרת את כל הפרויקטים הפתוחים המשויכים למזהה הלקוח.
 * 🔹 לכל פרויקט מוחזר גם איש הקשר המשויך אליו.
 *
 * 📌 שלבי העבודה:
 * 1️⃣ איתור גיליון "פרויקטים" ושליפת מספר השורה האחרונה.
 * 2️⃣ זיהוי עמודות: מזהה לקוח, שם הפרויקט, איש קשר.
 * 3️⃣ שליפת כל הנתונים מהגיליון וסינון הפרויקטים לפי מזהה הלקוח.
 * 4️⃣ יצירת מערך של אובייקטים, כאשר כל אובייקט מכיל:
 *     - `projectName` → שם הפרויקט.
 *     - `contactPerson` → שם איש הקשר המשויך לפרויקט.
 * 5️⃣ החזרת המידע למשתמש.
 *
 * 🛑 טיפול בשגיאות:
 * - אם אין נתונים בגליון → מחזירה מערך ריק.
 * - אם חסרות עמודות קריטיות → נרשם לוג שגיאה ומוחזר מערך ריק.
 * - אם מתרחשת שגיאה בלתי צפויה → נכתב לוג שגיאה ומוחזר מערך ריק.
 *
 * @param {string} customerID - מזהה הלקוח שלפיו יש לסנן את הנתונים.
 * @return {Array<Object>} מערך של אובייקטים, כאשר כל אובייקט מכיל:
 *     - `projectID` (string) - מזהה הפרויקט.
 *     - `projectName` (string) - שם הפרויקט.
 *     - `contactPerson` (string) - שם איש הקשר של הפרויקט.
 *  *  - `activityLogLink` (string) - קישור ללוג פעילות.
 */

function getProjectsForCustomer(customerID) {
 
    try {
        Logger.log("📌 שליפת פרויקטים ואנשי קשר עבור לקוח עם מזהה: " + customerID);
        
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("פרויקטים");
        var headerRow = getHeaderRow(); // זיהוי שורת הכותרת
        var lastRow = sheet.getLastRow();

        // בדיקה אם הגיליון ריק
        if (lastRow <= headerRow) {
            Logger.log("⚠️ אין פרויקטים במערכת, מחזיר מערך ריק.");
            return [];
        }

        // שליפת אינדקסי העמודות הרלוונטיות
        var customerColumnIndex = getColumnIndex("פרויקטים", "מזהה לקוח");
        var projectIDColumnIndex = getColumnIndex("פרויקטים", "מזהה"); // מזהה הפרויקט
        var projectColumnIndex = getColumnIndex("פרויקטים", "שם_הפרויקט");
        var contactColumnIndex = getColumnIndex("פרויקטים", "איש קשר"); // עמודת איש קשר
        var activityLogColumnIndex = getColumnIndex("פרויקטים", "לוג_פעילות"); // לינק לקובץ DOCS

        // בדיקה אם כל העמודות נמצאו
        if (!customerColumnIndex || !projectIDColumnIndex || !projectColumnIndex || !contactColumnIndex || !activityLogColumnIndex) {
            Logger.log("❌ שגיאה: אחת העמודות ('מזהה לקוח', 'מזהה פרויקט', 'שם_הפרויקט', 'איש קשר' או 'לוג_פעילות') לא נמצאה.");
            return [];
        }

        // שליפת הנתונים מהגיליון
        var data = sheet.getRange(headerRow + 1, 1, lastRow - headerRow, sheet.getLastColumn()).getValues();
        var projects = data
            .filter(row => row[customerColumnIndex - 1] == customerID) // סינון לפי מזהה הלקוח
            .map(row => ({
                projectID: row[projectIDColumnIndex - 1] || "", // מזהה הפרויקט
                projectName: row[projectColumnIndex - 1] || "", // שם הפרויקט
                contactPerson: row[contactColumnIndex - 1] || "", // איש קשר
                activityLogLink: row[activityLogColumnIndex - 1] || "" // לינק לקובץ DOCS (רישום הפעילות)
            }))
            .filter(project => project.projectName); // סינון פרויקטים ללא שם

        Logger.log("✅ נמצאו " + projects.length + " פרויקטים עבור הלקוח.");
        return projects;
        
    } catch (error) {
        Logger.log("❌ שגיאה בשליפת פרויקטים: " + error.message);
        return [];
    }
}

