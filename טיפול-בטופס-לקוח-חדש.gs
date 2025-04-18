/**
 * פותח טופס להזנת לקוח חדש בתוך Google Sheets.
 * מתבצע בעת לחיצה על כפתור בגליון "לקוחות".
 */
function openCustomerForm() {
    try {
        Logger.log("📂 פתיחת טופס לקוח חדש");
        var htmlTemplate = HtmlService.createHtmlOutputFromFile("טופס-לקוח-חדש")
            .setWidth(500)
            .setHeight(850);
        SpreadsheetApp.getUi().showModalDialog(htmlTemplate, "📋 פתיחת לקוח חדש");
    } catch (error) {
        Logger.log("❌ שגיאה בפתיחת הטופס: " + error.message);
    }
}


/**
 * 🚀 processCustomerForm - פונקציה שמכינה את הנתונים הדרושים לטופס פתיחת לקוח חדש.
 *
 * 📌 תהליך העבודה:
 * 1️⃣ שולפת נתונים מחושבים מראש (`getGeneratedFields`), כולל תאריכים ומזהים.
 * 2️⃣ מביאה את רשימת הלקוחות הקיימים במערכת (`getExistingCustomers`) לצורך בדיקת כפילות.
 * 3️⃣ שולפת את רשימת מקבלי העמלות (`getCommissionRecipientsData`) מהטבלה הייעודית.
 * 4️⃣ מחזירה את כל הנתונים יחד כ-Object לשימוש בצד הלקוח.
 *
 * ✅ אם אחת מהפונקציות נכשלת – מוחזר אובייקט ריק ומוצגת שגיאה בלוג.
 *
 * @returns {Object} נתונים לשימוש בטופס: { generatedFields, existingCustomers, commissionRecipients }
 */
function processCustomerForm() {
  try {
    Logger.log("🔄 התחלת עיבוד נתוני טופס לקוח חדש...");

    // 1️⃣ שליפת נתונים מחושבים מראש ללקוח חדש
    const generatedFields = getGeneratedFields("customer");
    if (!generatedFields) {
      throw new Error("❌ לא התקבלו נתונים מחושבים (generatedFields)");
    }
    Logger.log("📌 נתונים מחושבים נטענו בהצלחה.");

    // 2️⃣ קבלת רשימת לקוחות קיימים לבדיקה כפילות
    const existingCustomers = getExistingCustomers();
    Logger.log(`📋 נטענו ${existingCustomers.length} לקוחות קיימים.`);

    // 3️⃣ שליפת טבלת מקבלי העמלות
    const commissionRecipients = getCommissionRecipientsData();
    Logger.log(`💼 נטענו ${commissionRecipients.length} מקבלי עמלות.`);

    // 4️⃣ החזרת כל הנתונים לשימוש בצד הלקוח
    Logger.log("✅ הנתונים הוכנו בהצלחה ונשלחים לצד הלקוח.");
    return {
      generatedFields,
      existingCustomers,
      commissionRecipients
    };

  } catch (error) {
    Logger.log("❌ שגיאה בעיבוד נתוני הטופס processCustomerForm: " + error.message);
    return {}; // מחזירים אובייקט ריק במקרה של כשל
  }
}

/**
 * 🚀 שמירת נתוני לקוח ו/או פרויקט
 *
 * 📌 **תהליך העבודה:**
 * 1️⃣ **שליפת נתונים ראשונית** – בדיקת תקינות הערכים הבסיסיים (שם לקוח, מזהה, תאריכים).
 * 2️⃣ **זיהוי האם מדובר בליד** – קריאה ישירה מתוך `formData.lead` (ולא דרך פרמטר חיצוני).
 * 3️⃣ **הגדרת נתוני עמלה**:
 *      - אם זה ליד → `commission = true`, `commissionRate = 15`.
 *      - אם לא ליד → `commission = false`, `commissionRate = 0`.
 * 4️⃣ **בדיקת תקינות נתונים** – זיהוי ערכים חסרים ומניעת שמירה אם יש נתונים קריטיים חסרים.
 * 5️⃣ **אם הלקוח חדש**:
 *      - יצירת ספריית לקוח ב-Google Drive.
 *      - שמירת איש קשר בגוגל אם נדרש.
 *      - הכנסת הנתונים לטבלת **לקוחות**.
 * 6️⃣ **יצירת פרויקט חדש** (לכל לקוח, בין אם חדש או קיים).
 *      - יצירת ספריית פרויקט.
 *      - העתקת קבצי טמפלטים.
 *      - הכנסת הנתונים לטבלת **פרויקטים**.
 * 7️⃣ **שימוש נכון בלוגים ושגיאות** – כל שלב נבדק ונרשם.
 *
 * @param {Object} formData - הנתונים מהטופס.
 * @param {boolean} customerExists - האם הלקוח כבר קיים? (ברירת מחדל: false).
 * @return {string} "success" אם הכל נשמר תקין, אחרת "error".
 */
function saveCustomerData(formData, customerExists = false) {
    try {
        Logger.log("📂 התחלת שמירת נתונים: " + JSON.stringify(formData));
        Logger.log("🔎 האם הלקוח כבר קיים? " + customerExists);

        // 2️⃣ **זיהוי האם מדובר בליד ישירות מתוך `formData`**
        let isLead = formData.lead === true;
        Logger.log("🔎 האם מדובר בליד? " + isLead);

        // 3️⃣ **הגדרת נתוני עמלה**
        let hasCommissionRecipient = formData.commissionRecipient?.trim() !== "";

        if (isLead) {
            formData.commission = true;
            formData.commissionRate = 0.15;
        } else if (hasCommissionRecipient) {
            formData.commission = true;
            formData.commissionRate = parseFloat(formData.commissionRate)/100 || 0;
        } else {
            formData.commission = false;
            formData.commissionRate = 0;
        }
        Logger.log("📊 ערכי עמלה שהוגדרו: commission = " + formData.commission + ", commissionRate = " + formData.commissionRate);

        // 4️⃣ **שליפת נתונים קריטיים מתוך `formData`**
        const { 
            customerName, customerID, projectName, projectID, 
            creationDate, entryDate, contactName, contactPhone, contactEmail 
        } = formData;

        // 🔍 **בדיקת שדות קריטיים**
        let missingFields = [];
        if (!customerName?.trim()) missingFields.push("customerName (שם לקוח)");
        if (!customerID?.trim()) missingFields.push("customerID (מזהה לקוח)");
        if (!projectName?.trim()) missingFields.push("projectName (שם פרויקט)");
        if (!projectID?.trim()) missingFields.push("projectID (מזהה פרויקט)");
        if (!creationDate?.trim()) missingFields.push("creationDate (תאריך יצירה)");
        if (!entryDate?.trim()) missingFields.push("entryDate (תאריך כניסה)");

        // 🛑 **דרישת חובה: לפחות איש קשר אחד**
        if (!contactName?.trim()) missingFields.push("contactName (שם איש קשר)");
        if (!contactPhone?.trim() && !contactEmail?.trim()) {
            missingFields.push("contactPhone / contactEmail (חייב לפחות טלפון או דוא\"ל)");
        }

        if (missingFields.length > 0) {
            Logger.log(`❌ שגיאה: חסרים נתונים קריטיים - ${missingFields.join(", ")}`);
            return "error";
        }

        let clientFolderData = {}; // 🗂 **משתנה לשמירת פרטי ספריית הלקוח**

        // 5️⃣ **אם הלקוח לא קיים - יוצרים אותו**
        if (!customerExists) {
            Logger.log("🆕 יצירת לקוח חדש...");

            // 📂 **יצירת ספריית לקוח**
            clientFolderData = createClientFolder(customerName);
            if (!clientFolderData.clientFolderId) {
                Logger.log("❌ שגיאה ביצירת ספריית לקוח!");
                return "error";
            }
            Logger.log("📂 ספריית הלקוח נוצרה בהצלחה: " + clientFolderData.clientFolderUrl);

            // 👥 **עדכון אנשי קשר בגוגל**
            if (!createContactWithPeopleAPI({ customerName, contactName, contactPhone, contactEmail })) {
                Logger.log("⚠️ אזהרה: עדכון אנשי קשר נכשל, אך ממשיכים בתהליך.");
            } else {
                Logger.log("✅ אנשי קשר נשמרו בהצלחה בגוגל.");
            }

            // 📊 **הכנסת הנתונים לטבלת לקוחות כולל העמלה**
            if (!insertCustomerData(formData, clientFolderData.clientFolderUrl)) {
                Logger.log("❌ הכנסת נתוני לקוח נכשלה!");
                return "error";
            }
            Logger.log("✅ נתוני הלקוח הוזנו בהצלחה לטבלת לקוחות.");
        }

        // 6️⃣ **יצירת פרויקט חדש (תמיד, גם אם הלקוח קיים)**
        Logger.log("🚀 יצירת פרויקט חדש...");

        // 📂 **יצירת ספריית פרויקט**
        let projectFolderData = createProjectFolder(customerName, projectName);
        if (!projectFolderData.projectFolderId) {
            Logger.log("❌ יצירת ספריית פרויקט נכשלה!");
            return "error";
        }
        Logger.log("📂 ספריית הפרויקט נוצרה בהצלחה: " + JSON.stringify(projectFolderData));

        // ✅ **העתקת קבצי טמפלטים**
        let templates = copyProjectTemplates(customerName, contactName, projectName, projectFolderData.projectFolderId);

        // 📊 **הכנסת נתוני הפרויקט לטבלה**
        if (!insertProjectData(formData, projectFolderData.projectFolderUrl, templates)) {
            Logger.log("❌ הכנסת נתוני פרויקט נכשלה!");
            return "error";
        }
        Logger.log("✅ נתוני הפרויקט נשמרו בטבלת פרויקטים!");

        Logger.log("🎉 כל הנתונים נשמרו בהצלחה!");
        return "success"; // ✅ מחזירים "success" רק אם הכל עבד כראוי

    } catch (error) {
        Logger.log("❌ שגיאה בתהליך שמירת הנתונים: " + error.message);
        return "error"; // 🛑 מחזירים "error" במקרה של כשל
    }
}
