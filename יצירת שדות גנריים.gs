/**
 * 🚀 מחזירה נתונים אוטומטיים עבור תאריך יצירה, מזהה ישות, ותאריך כניסה למערכת בהתאם לסוג הטופס.
 *    - משמשת עבור טפסים: לקוח חדש (customer), פרויקט חדש (project), משימה חדשה (task).
 *    - בטופס "project" הפונקציה מקבלת `customerID` ומעבירה אותו ליצירת מזהה פרויקט ייחודי.
 *
 * @param {string} formType - סוג הטופס (customer, project, task)
 * @param {string|null} [customerID=null] - מזהה הלקוח (משמש רק בטופס פרויקט)
 * @return {Object} אובייקט המכיל את הנתונים שנוצרו
 */
function getGeneratedFields(formType, customerID = null) {
  
    try {
        Logger.log(`🔄 יצירת נתונים אוטומטיים לטופס מסוג: ${formType}, עם customerID: ${customerID || "❌ לא סופק"}`);

        // 🔹 חישוב נתונים כלליים לכל סוגי הטפסים
        let creationDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
        let entryDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

        // ✅ מסלול 1: יצירת לקוח חדש - ללא מזהה לקוח (יוצר גם מזהה פרויקט שיווק חדש)
        if (formType === "customer") {
            Logger.log("📌 יצירת מזהים עבור טופס 'לקוח חדש'...");
            return {
                creationDate,
                customerID: generateUniqueID("לקוחות"), // 🔹 מזהה לקוח חדש
                entryDate,
                projectID: generateUniqueID("פרויקטים") // 🔹 מזהה לפרויקט שיווק חדש
            };
        }

        // ✅ מסלול 2: יצירת פרויקט חדש (דורש מזהה לקוח קיים)
        else if (formType === "project") {
            if (!customerID) {
                Logger.log("⚠️ אזהרה: לא סופק customerID - מחזיר מזהה כללי.");
                return {
                    creationDate,
                    entryDate,
                    projectID: generateUniqueID("פרויקטים") // יוצר מזהה כללי כי חסר מזהה לקוח
                };
            }

            Logger.log(`📌 יצירת מזהה לפרויקט חדש עבור לקוח ID: ${customerID}`);
            return {
                creationDate,
                entryDate,
                projectID: generateUniqueID("פרויקטים", customerID) // מעביר את מזהה הלקוח
            };
        }

        // ✅ מסלול 3: יצירת משימה חדשה
        else if (formType === "task") {
            Logger.log("📌 יצירת מזהים עבור טופס 'משימה חדשה'...");
            return {
                creationDate,
                entryDate,
                taskID: generateUniqueID("פעילות"), // 🔹 מזהה משימה חדש
                monthEntry: new Date().getMonth() + 1,
                yearEntry: new Date().getFullYear(),
                startTime: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm")
            };
        }

        // ❌ סוג טופס לא מוכר - מחזיר אובייקט ריק
        else {
            Logger.log(`❌ שגיאה: סוג טופס לא מוכר '${formType}', מחזיר אובייקט ריק.`);
            return {};
        }

    } catch (error) {
        Logger.log("❌ שגיאה כללית ביצירת נתונים אוטומטיים לטופס: " + error.message);
        return {};
    }
}

