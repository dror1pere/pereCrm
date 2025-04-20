/**
 * 📦 סכמה לבדיקה של טופס פתיחת לקוח חדש.
 * ➤ צד שרת בלבד – מכילה כללי חובה, תבניות ואורכים.
 */
const customerSchema = {
  customerName: {
    required: true,
    minLength: 2,
    errorMessage: "יש להזין שם לקוח"
  },
  taxID: {
    required: true,
    pattern: /^\d{8,9}$/,
    errorMessage: "מספר עוסק/ח.פ לא תקין"
  },
  address: {
    required: true,
    minLength: 5,
    errorMessage: "כתובת קצרה מדי"
  },
  email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    errorMessage: "כתובת מייל לא תקינה"
  },
  contactName: {
    required: true,
    minLength: 2,
    errorMessage: "יש להזין שם איש קשר"
  },
  contactPhone: {
    required: true,
    pattern: /^\d{9,10}$/,
    errorMessage: "טלפון איש קשר לא תקין"
  },
  contactEmail: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    errorMessage: "דוא\"ל איש קשר לא תקין"
  }
};

/**
 * 🧪 פונקציה כללית לבדיקת טופס לפי סכמה מוגדרת מראש.
 * 
 * 1️⃣ מקבלת נתוני טופס (formData) וסכמה (schema)
 * 2️⃣ מבצעת בדיקות לפי כללים לכל שדה
 * 3️⃣ רושמת לוגים ובודקת חריגות
 * 4️⃣ מחזירה אובייקט הכולל: { isValid, errors }
 *
 * @param {Object} formData - נתונים שנאספו מהטופס
 * @param {Object} schema - מפת שדות וחוקי ולידציה
 * @returns {{ isValid: boolean, errors: Object }} תוצאה הכוללת סטטוס ושגיאות
 */
function validateBySchema(formData, schema) {
  const errors = {};
  let isValid = true;

  console.log("[validateBySchema] התחלת ולידציה לפי סכמה...");

  try {
    // 🔁 1. מעבר שדה-שדה לפי הסכמה
    for (const field in schema) {
      const rules = schema[field];
      const value = (formData[field] || '').toString().trim();
      console.log(`📌 בדיקת שדה: ${field} | ערך: '${value}'`);

      // ✅ 2. בדיקת חובה
      if (rules.required && value === '') {
        errors[field] = rules.errorMessage || "שדה חובה";
        isValid = false;
        continue;
      }

      // 🔠 3. בדיקת תבנית (regex)
      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors[field] = rules.errorMessage || "ערך לא תקין";
        isValid = false;
      }

      // 📏 4. בדיקת אורך מקסימלי
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = rules.errorMessage || `אורך מקסימלי: ${rules.maxLength}`;
        isValid = false;
      }

      // 📉 5. בדיקת אורך מינימלי
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = rules.errorMessage || `אורך מינימלי: ${rules.minLength}`;
        isValid = false;
      }
    }
  } catch (error) {
    console.error("[validateBySchema] ❌ שגיאה כללית בוולידציה:", error);
    isValid = false;
    errors.general = "שגיאה בלתי צפויה בעת ולידציה";
  }

  console.log("[validateBySchema] תוצאה סופית:", { isValid, errors });
  return { isValid, errors };
}

/**
 * 🧾 ולידציה ממוקדת לנתוני לקוח חדש לפי הסכמה המוגדרת מראש.
 * 
 * 1️⃣ קוראת ל־validateBySchema עם סכמה מקומית
 * 2️⃣ רושמת לוגים לפני ואחרי התהליך
 * 3️⃣ מחזירה אובייקט עם isValid ו־errors
 *
 * @param {Object} formData - אובייקט נתוני טופס לקוח חדש
 * @returns {{ isValid: boolean, errors: Object }} תוצאת בדיקה
 */
function validateCustomerData(formData) {
  console.log("[validateCustomerData] ▶ התחלת ולידציה ללקוח חדש");

  const result = validateBySchema(formData, customerSchema);

  console.log("[validateCustomerData] ✅ תוצאה:", result);
  return result;
}
