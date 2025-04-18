/**
 * 🚀 `processLeadData` - עיבוד נתוני ליד שהתקבל ממייל.
 *
 * 🔹 **תהליך העבודה של הפונקציה**:
 * 1️⃣ שולף את הנתונים מהטבלה במייל (`leadData`).
 * 2️⃣ מבצע **אימות תקינות נתונים**:
 *     - שם לקוח חייב להכיל לפחות 3 אותיות (אחרת: "איש קשר חדש").
 *     - שם חברה חייב להכיל לפחות 3 אותיות (אחרת: "ליד חדש").
 * 3️⃣ בודק האם הלקוח קיים במערכת (`getExistingCustomerID`).
 * 4️⃣ אם הלקוח **כבר קיים** → מבקש מזהה פרויקט חדש (`getGeneratedFields("project")`).
 * 5️⃣ אם הלקוח **לא קיים** → מבקש מזהה לקוח חדש (`getGeneratedFields("customer")`).
 * 6️⃣ **מוסיף את הנתון `isLead=true`**, כדי לסמן שזה ליד ולהעביר ל-`saveCustomerData`.
 * 7️⃣ בונה שם פרויקט **"שיווק YYYY-MM-DD"**.
 * 8️⃣ שולח את הנתונים לפונקציה `saveCustomerData`, **יחד עם `isLead=true`**.
 */
function processLeadData(leadData) {
    try {
        Logger.log("🔄 התחלת עיבוד נתוני הליד...");

        // 1️⃣ **שליפת האינדקסים של השדות מהכותרות**
        let headers = leadData.headers;
        let values = leadData.values;

        let contactNameIndex = headers.indexOf("שם לקוח");
        let customerNameIndex = headers.indexOf("חברה");
        let taxIDIndex = headers.indexOf("ח.פ/מס עוסק");
        let addressIndex = headers.indexOf("כתובת");
        let emailIndex = headers.indexOf("דוא\"ל");
        let contactPhoneIndex = headers.indexOf("טלפון");
        let contactEmailIndex = headers.indexOf("מייל");

        // 2️⃣ **שליפת הנתונים מתוך הטבלה במייל**
        let customerName = customerNameIndex !== -1 ? values[customerNameIndex] : "";
        let taxID = taxIDIndex !== -1 ? values[taxIDIndex] : "";
        let address = addressIndex !== -1 ? values[addressIndex] : "";
        let email = emailIndex !== -1 ? values[emailIndex] : "";
        let contactName = contactNameIndex !== -1 ? values[contactNameIndex] : "";
        let contactPhone = contactPhoneIndex !== -1 ? values[contactPhoneIndex] : "";
        let contactEmail = contactEmailIndex !== -1 ? values[contactEmailIndex] : "";

        // 3️⃣ **בדיקת תקינות נתונים: שם לקוח וחברה**
        if (!isValidName(contactName)) {
            Logger.log(`⚠️ שם לקוח לא תקין ("${contactName}"). מוגדר כ"איש קשר חדש".`);
            contactName = "איש קשר חדש";
        }

        if (!isValidName(customerName)) {
            Logger.log(`⚠️ שם חברה לא תקין ("${customerName}"). מוגדר כ"ליד חדש".`);
            customerName = "ליד חדש";
        }

        // 4️⃣ **בדיקה אם הלקוח כבר קיים במערכת**
        let existingCustomerID = getExistingCustomerID(customerName);
        let customerExists = existingCustomerID !== null;

        Logger.log(`📊 תוצאת בדיקת לקוח קיים: ${customerExists ? `כן (ID: ${existingCustomerID})` : "לא"}`);

        // 5️⃣ **בקשת מזהים מהשרת**
        let generatedFields = customerExists
            ? getGeneratedFields("project", existingCustomerID)  // אם הלקוח קיים → מזהה פרויקט חדש
            : getGeneratedFields("customer"); // אם הלקוח חדש → מזהה לקוח חדש

        if (!generatedFields) {
            Logger.log("❌ שגיאה בקבלת נתונים מהשרת. מפסיקים את התהליך.");
            return;
        }

        // 6️⃣ **בניית שם פרויקט**
        let projectName = `שיווק ${generatedFields.creationDate}`;

        // 7️⃣ **בניית הנתונים לשמירה (הוספנו `isLead: true`)**
        let formData = {
            creationDate: generatedFields.creationDate,
            customerID: customerExists ? existingCustomerID : generatedFields.customerID,
            entryDate: generatedFields.entryDate,
            projectID: generatedFields.projectID,
            customerName: customerName,
            taxID: taxID,
            address: address,
            email: email,
            contactName: contactName,
            contactPhone: contactPhone,
            contactEmail: contactEmail,
            projectName: projectName,
            lead: true // ✅ סימון שהנתונים שייכים לליד
        };

        // 8️⃣ **קריאה לפונקציה `saveCustomerData`**
        let saveResult = saveCustomerData(formData, customerExists);

        if (saveResult === "success") {
            Logger.log("✅ הנתונים הועברו בהצלחה ל-saveCustomerData.");
            return "success";
        } else {
            Logger.log("❌ שגיאה בשמירת הנתונים.");
        }

    } catch (error) {
        Logger.log(`❌ שגיאה בעיבוד נתוני הליד: ${error.message}`);
    }
}


/**
 * 🔍 **בודק האם שם לקוח או חברה מכילים לפחות 3 אותיות עברית/אנגלית**
 * 
 * - אם השם מכיל לפחות 3 אותיות → תקין ✅
 * - אם לא → לא תקין ❌
 * 
 * @param {string} name - השם לבדיקה
 * @returns {boolean} true אם השם תקין, אחרת false
 */
function isValidName(name) {
    if (!name) return false;
    const namePattern = /[a-zA-Zא-ת]{3,}/; // לפחות 3 אותיות בעברית או אנגלית
    return namePattern.test(name);
}
