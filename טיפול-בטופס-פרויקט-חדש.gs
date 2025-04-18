/**
 * פותח טופס להזנת לקוח חדש בתוך Google Sheets.
 * מתבצע בעת לחיצה על כפתור בגליון "לקוחות".
 */
function openProjectForm() {
    try {
        Logger.log("📂 פתיחת טופס לקוח חדש");
        var htmlTemplate = HtmlService.createHtmlOutputFromFile("טופס-פרויקט-חדש")
            .setWidth(500)
            .setHeight(850);
        SpreadsheetApp.getUi().showModalDialog(htmlTemplate, "📋 פתיחת פרויקט חדש");
    } catch (error) {
        Logger.log("❌ שגיאה בפתיחת הטופס: " + error.message);
    }
}

/**
 * פונקציה מרכזית שמבצעת את כל תהליכי עיבוד הנתונים עבור הטופס.
 * מביאה נתונים אוטומטיים, בודקת כפילויות, ושומרת את הנתונים בטבלאות.
 * @return {Object} נתונים מוכנים להצגה בטופס.
 */
function processProjectForm() {
    try {
        Logger.log("🔄 התחלת עיבוד נתוני טופס לקוח חדש");
        
        // קבלת נתונים מחושבים מראש
        var generatedFields = getGeneratedFields("project");
        var existingCustomers = getExistingCustomers();
        
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
 * 🚀 שומר נתוני פרויקט חדש במערכת.
 *
 * 🔹 תהליך העבודה:
 * 1️⃣ בדיקת תקינות קלט.
 * 2️⃣ קביעת ערכי ברירת מחדל עבור שדות עמלה.
 * 3️⃣ יצירת איש קשר חדש אם נדרש.
 * 4️⃣ בדיקה שהלקוח קיים ושליפת ספריית הלקוח.
 * 5️⃣ יצירת ספריית פרויקט חדשה תחת תיקיית הלקוח.
 * 6️⃣ העתקת קבצי טמפלטים לפרויקט.
 * 7️⃣ הכנסת הנתונים לטבלת "פרויקטים".
 * 8️⃣ מחזיר "success" אם הכל נשמר תקין, אחרת "error".
 *
 * @param {Object} formData - נתוני הפרויקט.
 * @param {string} formData.customerName - שם הלקוח הקיים.
 * @param {string} formData.customerID - מזהה הלקוח.
 * @param {string} formData.projectName - שם הפרויקט החדש.
 * @param {string} formData.projectID - מזהה הפרויקט החדש.
 * @param {string} formData.creationDate - תאריך יצירה.
 * @param {string} formData.entryDate - תאריך כניסה.
 * @param {string} formData.contactPerson - שם איש הקשר הנבחר או החדש.
 * @param {boolean} [formData.commission=false] - האם קיימת חובת עמלה.
 * @param {number} [formData.commissionRate=0] - אחוז העמלה (מספר שלם).
 * @param {string} [formData.commissionRecipient=""] - שם מקבל העמלה.
 * @param {string} [formData.commissionEndDate=""] - תאריך סיום חובת עמלה בפורמט dd/mm/yyyy.
 * @param {Object} [formData.newContact] - פרטי איש קשר חדש, אם נבחרה האופציה.
 * @returns {string} - "success" או "error".
 */
function saveProjectData(formData) {
    try {
        Logger.log("📂 התחלת שמירת נתוני פרויקט חדש: " + JSON.stringify(formData));

        // 🛑 1️⃣ בדיקת תקינות קלט
        if (!formData || !formData.customerName || !formData.projectName || !formData.customerID || !formData.projectID) {
            Logger.log("❌ שגיאה: חסרים נתונים קריטיים");
            return "error";
        }

        // ✅ 2️⃣ ערכי ברירת מחדל לשדות עמלה
        formData.commissionRecipient = formData.commissionRecipient || "";
        formData.commissionRate = formData.commissionRate !== undefined ? formData.commissionRate : 0;
        formData.commissionEndDate = formData.commissionEndDate || "";

        // קביעת commission לפי שדות אחרים אם לא סופק
        if (formData.commission === undefined) {
            formData.commission = (
                formData.commissionRecipient !== "" ||
                (typeof formData.commissionRate === "number" && formData.commissionRate > 0) ||
                formData.commissionEndDate !== ""
            );
        }

        Logger.log(`📊 ערכי עמלה לאחר בדיקת ברירת מחדל:
        commission = ${formData.commission},
        commissionRate = ${formData.commissionRate},
        commissionRecipient = ${formData.commissionRecipient},
        commissionEndDate = ${formData.commissionEndDate}`);

        // 🔍 3️⃣ אם יש איש קשר חדש, יוצרים אותו
        if (formData.newContact) {
            Logger.log("📇 יצירת איש קשר חדש: " + JSON.stringify(formData.newContact));

            let contactResponse = createContactWithPeopleAPI({
                contactName: formData.newContact.name,
                contactPhone: formData.newContact.phone,
                contactEmail: formData.newContact.email,
                customerName: formData.customerName
            });

            if (!contactResponse) {
                Logger.log("⚠️ שגיאה בשמירת איש הקשר - ממשיכים ללא איש קשר.");
            } else {
                Logger.log("✅ איש הקשר נשמר בהצלחה.");
            }

            formData.contactPerson = formData.newContact.name;
        }

        // 🔍 4️⃣ חיפוש ספריית הלקוח
        var clientFolderData = createClientFolder(formData.customerName);
        if (!clientFolderData.clientFolderId) {
            Logger.log("❌ שגיאה: לא נמצאה ספריית לקוח קיימת!");
            return "error";
        }
        Logger.log("📂 ספריית הלקוח אותרה בהצלחה.");

        // 📂 5️⃣ יצירת ספריית פרויקט
        var projectFolderData = createProjectFolder(formData.customerName, formData.projectName);
        if (!projectFolderData.projectFolderId) {
            Logger.log("❌ יצירת ספריית פרויקט נכשלה!");
            return "error";
        }
        Logger.log("📂 ספריית הפרויקט נוצרה בהצלחה: " + JSON.stringify(projectFolderData));

        // ✅ 6️⃣ העתקת קבצי טמפלטים
        var templates = copyProjectTemplates(
            formData.customerName,
            formData.contactPerson,
            formData.projectName,
            projectFolderData.projectFolderId
        );

        // ✍️ 7️⃣ הכנסת הנתונים לטבלה
        var projectDataInserted = insertProjectData(
            formData,
            projectFolderData.projectFolderUrl,
            templates
        );
        if (!projectDataInserted) {
            Logger.log("❌ הכנסת נתוני פרויקט נכשלה!");
            return "error";
        }
        Logger.log("✅ נתוני הפרויקט נשמרו בטבלה!");

        // 🎉 8️⃣ הצלחה
        Logger.log("🎉 כל נתוני הפרויקט נשמרו בהצלחה!");
        return "success";

    } catch (error) {
        Logger.log("❌ שגיאה בתהליך שמירת נתוני הפרויקט: " + error.message);
        return "error";
    }
}

