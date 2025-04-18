/**
 * פותח טופס להזנת משימה חדשה בתוך Google Sheets.
 * מתבצע בעת לחיצה על כפתור בגליון "פעילות".
 */
function openTaskForm() {
    try {
      updateEndTimeInLastActivityRow()
        Logger.log("📂 פתיחת טופס משימה חדשה");
        var htmlTemplate = HtmlService.createHtmlOutputFromFile("טופס-משימה-חדשה")
            .setWidth(500)
            .setHeight(850);
        SpreadsheetApp.getUi().showModalDialog(htmlTemplate, "📋 פתיחת משימה חדשה");
    } catch (error) {
        Logger.log("❌ שגיאה בפתיחת הטופס: " + error.message);
    }
}

/**
 * מכין נתונים לטופס משימה חדשה.
 * מביא נתונים מחושבים מראש וטעינת רשימת הלקוחות.
 * @return {Object} נתונים מוכנים להצגה בטופס.
 */
function processTaskForm() {
    try {
        Logger.log("🔄 התחלת עיבוד נתוני טופס משימה חדשה");

        // קבלת נתונים מחושבים מראש (כולל מזהה פעילות, תאריכים וכו')
        var generatedFields = getGeneratedFields("task"); 

        // טעינת רשימת לקוחות קיימים
        var existingCustomers = getExistingCustomers();
        Logger.log("existingCustomers  " + existingCustomers)
        return {
            generatedFields: generatedFields,
            existingCustomers: existingCustomers
        };
    } catch (error) {
        Logger.log("❌ שגיאה בעיבוד נתוני הטופס: " + error.message);
        return {};
    }
}

/**
 * 🚀 שמירת נתוני משימה חדשה בטבלת "פעילות".
 * 
 * 📌 תהליך העבודה:
 * 1️⃣ בדיקת תקינות הקלט.
 * 2️⃣ הכנסת הנתונים לטבלת "פעילות".
 * 3️⃣ החזרת "success" אם הכל עבר בהצלחה או "error" במקרה של כשל.
 *
 * @param {Object} formData - נתוני המשימה שנשלחו מהטופס.
 * @param {string} formData.customerName - שם הלקוח הקיים במערכת.
 * @param {string} formData.customerID - מזהה הלקוח הייחודי.
 * @param {string} formData.projectName - שם הפרויקט שאליו משויכת המשימה.
 * @param {string} formData.projectID - מזהה הפרויקט.
 * @param {string} formData.taskDescription - תיאור המשימה.
 * @param {string} formData.taskID - מזהה המשימה.
 * @param {string} formData.startTime - שעת התחלה.
 * @return {string} "success" אם הנתונים נשמרו בהצלחה, אחרת "error".
 */
function saveTaskData(formData) {
    try {
        Logger.log("📂 התחלת שמירת נתוני משימה חדשה: " + JSON.stringify(formData));

        // 🛑 1️⃣ בדיקת תקינות קלט - חיפוש שדות חסרים
        var requiredFields = ["customerName", "customerID", "projectName", "projectID", "contactPerson",
                              "activityLogLink", "taskDescription", "taskID", "creationDate", 
                              "entryDate", "monthEntry", "yearEntry", "startTime"];

        var missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            Logger.log("❌ שגיאה: חסרים נתונים קריטיים: " + missingFields.join(", "));
            return "error";
        }

        // ✍️ 2️⃣ הכנסת הנתונים לטבלת "פעילות"
        var taskDataInserted = insertTaskData(formData);
        if (!taskDataInserted) {
            Logger.log("❌ הכנסת נתוני משימה נכשלה!");
            return "error";
        }

        Logger.log("✅ נתוני המשימה נשמרו בטבלה!");
        Logger.log("🎉 כל נתוני המשימה נשמרו בהצלחה!");
        return "success";

    } catch (error) {
        Logger.log("❌ שגיאה בתהליך שמירת נתוני המשימה: " + error.message);
        return "error";
    }
}
