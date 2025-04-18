/**
 * 🚀 שליפת נתוני לקוח כולל רשימת פרויקטים ואנשי קשר מגוגל.
 *
 * 📋 שלבי העבודה:
 * 1️⃣ שליפת פרטי הלקוח מטבלת "לקוחות".
 * 2️⃣ איתור שם החברה ואיש הקשר ברירת מחדל.
 * 3️⃣ שליפת אנשי הקשר מתוך אנשי הקשר של Google לפי שם החברה.
 * 4️⃣ שליפת רשימת הפרויקטים של הלקוח.
 * 5️⃣ שליפת פרטי עמלה מהשורה.
 * 6️⃣ הדפסת לוגים עם כל ערך שהתקבל.
 * 7️⃣ החזרת הנתונים כמבנה JSON מסודר.
 *
 * @param {string} customerID - מזהה הלקוח.
 * @returns {Object|null} - אובייקט עם נתוני הלקוח, אנשי הקשר והפרויקטים או null במקרה של שגיאה.
 */
function getCustomerData(customerID) {
  
  try {
    Logger.log(`📡 [1] התחלת שליפת נתוני לקוח (מזהה: ${customerID})`);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("לקוחות");
    if (!sheet) {
      Logger.log("❌ [2] גיליון 'לקוחות' לא נמצא");
      return null;
    }

    const headerRow = getHeaderRow();
    const lastRow = sheet.getLastRow();

    if (lastRow <= headerRow) {
      Logger.log("❌ [3] אין נתונים בגיליון 'לקוחות' אחרי שורת הכותרת.");
      return null;
    }

    // 🔍 [4] שליפת אינדקסים
    const idIndex = getColumnIndex("לקוחות", "מזהה") - 1;
    const contactPersonIndex = getColumnIndex("לקוחות", "איש קשר") - 1;
    const companyNameIndex = getColumnIndex("לקוחות", "חברה") - 1;
    const commissionIndex = getColumnIndex("לקוחות", "עמלה") - 1;
    const commissionRecipientIndex = getColumnIndex("לקוחות", "מקבל_עמלה") - 1;
    const commissionRateIndex = getColumnIndex("לקוחות", "אחוז_עמלה") - 1;
    const commissionEndDateIndex = getColumnIndex("לקוחות", "תאריך_סיום_חובת_עמלה") - 1;

    if (idIndex < 0 || contactPersonIndex < 0 || companyNameIndex < 0) {
      Logger.log("❌ [5] שגיאה: אינדקסים קריטיים חסרים ('מזהה', 'איש קשר', 'חברה')");
      return null;
    }

    const dataRange = sheet.getRange(headerRow + 1, 1, lastRow - headerRow, sheet.getLastColumn());
    const data = dataRange.getValues();

    const customerRow = data.find(row => String(row[idIndex]).trim() === String(customerID).trim());
    if (!customerRow) {
      Logger.log(`⚠️ [6] לקוח עם מזהה '${customerID}' לא נמצא בגיליון.`);
      return null;
    }

    // 🧩 [7] שליפת ערכי שדות
    const companyName = customerRow[companyNameIndex] || "";
    const defaultContact = customerRow[contactPersonIndex] || null;
    const commission = customerRow[commissionIndex] === true || customerRow[commissionIndex] === "TRUE";
    const commissionRecipient = customerRow[commissionRecipientIndex] || "";
    const commissionRate = Number(customerRow[commissionRateIndex]) || 0;
    const commissionEndDate = customerRow[commissionEndDateIndex] || null;

    Logger.log(`📌 [8] companyName: ${companyName}`);
    Logger.log(`📌 [9] defaultContact: ${defaultContact}`);
    Logger.log(`📌 [10] commission: ${commission}`);
    Logger.log(`📌 [11] commissionRecipient: ${commissionRecipient}`);
    Logger.log(`📌 [12] commissionRate: ${commissionRate}`);
    Logger.log(`📌 [13] commissionEndDate: ${commissionEndDate}`);

    // 📦 [14] שליפת אנשי קשר ופרויקטים
    const contacts = companyName ? getCustomerContacts(companyName) : [];
    const projects = getProjectsForCustomer(customerID);

    Logger.log("✅ [15] שליפת נתוני לקוח הסתיימה בהצלחה");

    // 📤 [16] החזרת אובייקט הנתונים
    const result = {
      customerID: customerID,
      companyName: companyName,
      defaultContact: defaultContact,
      contacts: contacts,
      projects: projects,
      commission: commission,
      commissionRecipient: commissionRecipient,
      commissionRate: commissionRate*100,
      commissionEndDate: customerRow[commissionEndDateIndex]
    ? formatDateDDMMYYYY(new Date(customerRow[commissionEndDateIndex]))
    : null

    };

    Logger.log("📤 [17] נתונים שיוחזרו ל-Client:");
    Logger.log(JSON.stringify(result, null, 2)); // הדפסת האובייקט בצורה קריאה

    return result;

  } catch (error) {
    Logger.log("❌ [99] שגיאה בשליפת נתוני לקוח: " + error.message);
    return null;
  }
}

/**
 * פורמט תאריך לפורמט dd/mm/yyyy
 * @param {Date} date - אובייקט תאריך
 * @returns {string} - מחרוזת תאריך בפורמט dd/mm/yyyy
 */
function formatDateDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // חודשים מתחילים מ-0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
