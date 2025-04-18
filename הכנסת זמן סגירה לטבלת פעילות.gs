/**
 * 🚀 **updateEndTimeInLastActivityRow - מעדכן "עד שעה" והפרש עשרוני אם "עד שעה" ריק**
 *
 * 📌 **תהליך העבודה של הפונקציה:**
 * 1️⃣ **שליפת הגיליון "פעילות"** – וידוא שהוא קיים.
 * 2️⃣ **זיהוי השורה האחרונה עם נתונים** – אם אין שורות נתונים, הפונקציה תצא.
 * 3️⃣ **מציאת אינדקסי העמודות הרלוונטיות** – כולל "משעה", "עד שעה", "הפרש עשרוני" ו"תאריך_יצירת_שורה".
 * 4️⃣ **שליפת הנתונים מהשורה האחרונה**.
 * 5️⃣ **אם "עד שעה" ריק - נעדכן אותו בזמן הנוכחי ("HH:mm")**.
 * 6️⃣ **חישוב הפרש הזמן העשרוני**.
 * 7️⃣ **אם הפעילות חצתה חצות - השורה תיסגר עם `"00:00"`, ותיווצר שורה חדשה עם `"00:00"` כזמן התחלה**.
 * 8️⃣ **שמירה על פורמט תקין של כל השדות**.
 * 9️⃣ **רישום לוגים מפורטים** לכל הפעולות לצורכי מעקב.
 */
function updateEndTimeInLastActivityRow() {
    try {
        Logger.log("📌 התחלת עדכון 'עד שעה' בטבלת 'פעילות'.");

        // 🟢 1️⃣ שליפת הגיליון
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("פעילות");
        if (!sheet) throw new Error("❌ טבלת 'פעילות' לא נמצאה בגיליון.");

        // 🟢 2️⃣ איתור השורה האחרונה עם נתונים
        var lastRow = sheet.getLastRow();
        var headerRow = getHeaderRow();
        if (lastRow <= headerRow) {
            Logger.log("⚠️ אין שורות נתונים בטבלת 'פעילות'.");
            return;
        }

        // 🟢 3️⃣ קבלת אינדקסי העמודות
        var startTimeCol = getColumnIndex("פעילות", "משעה");
        var endTimeCol = getColumnIndex("פעילות", "עד שעה");
        var decimalDiffCol = getColumnIndex("פעילות", "הפרש עשרוני");
        var dateCol = getColumnIndex("פעילות", "תאריך_יצירת_שורה");

        if (!startTimeCol || !endTimeCol || !decimalDiffCol || !dateCol) {
            throw new Error("❌ אחת מהעמודות הנדרשות לא נמצאה.");
        }

        Logger.log(`📊 עמודות - משעה: ${startTimeCol}, עד שעה: ${endTimeCol}, הפרש עשרוני: ${decimalDiffCol}, תאריך: ${dateCol}`);

        // 🟢 4️⃣ קריאת הנתונים מהשורה האחרונה
        var lastRowValues = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
        var startTime = formatToHHMM(lastRowValues[startTimeCol - 1]); // "משעה"
        var endTime = lastRowValues[endTimeCol - 1]; // "עד שעה"

        Logger.log(`⏳ ערכים קיימים: משעה = ${startTime}, עד שעה = ${endTime}`);

        // 🔹 **אם "עד שעה" כבר מעודכן - הפונקציה תצא מייד!**
        if (endTime && endTime.toString().trim() !== "") {
            Logger.log("✅ 'עד שעה' כבר מעודכן, לא מבצעים שינוי.");
            return;
        }

        // 🟢 5️⃣ הכנסת שעת סיום נוכחית
        var currentTime = formatToHHMM(new Date());
        Logger.log(`⏳ עדכון 'עד שעה' לשעה: ${currentTime}`);

        // 🟢 6️⃣ יצירת התאריך הנוכחי בפורמט `dd/MM/yyyy HH:mm:ss`
        var currentDateString = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
        Logger.log(`📅 'תאריך_יצירת_שורה' נקבע לערך: ${currentDateString}`);

        // 🟢 7️⃣ בדיקה אם חצה חצות
        var decimalStart = calculateDecimalTime(startTime);
        var decimalEnd = calculateDecimalTime(currentTime);

        if (decimalEnd < decimalStart) {
            Logger.log("⚠️ חציית חצות זוהתה! מפצלים את המשימה לשתי שורות.");

            // 🔹 7.1 עדכון השורה הקיימת כך ש-"עד שעה" יהיה 00:00
            sheet.getRange(lastRow, endTimeCol).setValue("00:00");
            var firstPeriodDifference = calculateDecimalTimeDifference(startTime, "00:00");
            sheet.getRange(lastRow, decimalDiffCol).setValue(firstPeriodDifference);
            Logger.log(`✅ שורה קיימת עודכנה: 'עד שעה' = 00:00, 'הפרש עשרוני' = ${firstPeriodDifference}`);

            // 🔹 7.2 יצירת שורה חדשה להמשך המשימה
            var newRowValues = [...lastRowValues];
            newRowValues[startTimeCol - 1] = "00:00"; // התחלה של יום חדש
            newRowValues[endTimeCol - 1] = currentTime; // עדכון שעה נוכחית
            newRowValues[decimalDiffCol - 1] = calculateDecimalTimeDifference("00:00", currentTime); // חישוב הפרש
            newRowValues[dateCol - 1] = currentDateString; // תאריך חדש

            sheet.appendRow(newRowValues);
            Logger.log("✅ נוספה שורה חדשה לפעילות.");
        } else {
            // 🔹 8️⃣ עדכון רגיל אם הפעילות לא חצתה חצות
            sheet.getRange(lastRow, endTimeCol).setValue(currentTime);
            var decimalDifference = calculateDecimalTimeDifference(startTime, currentTime);
            sheet.getRange(lastRow, decimalDiffCol).setValue(decimalDifference);
            sheet.getRange(lastRow, dateCol).setValue(currentDateString);
            Logger.log(`✅ עדכון רגיל: 'עד שעה' = ${currentTime}, 'הפרש עשרוני' = ${decimalDifference}, 'תאריך_יצירת_שורה' = ${currentDateString}`);
        }
    } catch (error) {
        Logger.log("❌ שגיאה בעדכון 'עד שעה': " + error.message);
    }
}


/**
 * 📌 פונקציה זו מקבלת ערך שעה (בפורמט Date או מחרוזת "HH:mm") וממירה אותו לזמן עשרוני.
 * 
 * 🔹 אם הערך הוא `Date`, הוא יומר תחילה למחרוזת בפורמט `"HH:mm"`.
 * 🔹 אם הערך הוא מחרוזת חוקית (`"HH:mm"`), הוא יפוצל לשעות ודקות.
 * 🔹 מבצעת חישוב זמן עשרוני: `שעות + (דקות / 60)`.
 * 🔹 מטפלת בכל השגיאות האפשריות ומחזירה `0` אם יש בעיה.
 * 
 * @param {Date|string} timeValue - ערך השעה (Date או String בפורמט "HH:mm")
 * @returns {number} זמן עשרוני (למשל: "14:30" → `14.5`)
 */
function calculateDecimalTime(timeValue) {
    try {
        // 🛠️ בדיקה אם הערך ריק או לא הוזן
        if (!timeValue) {
            throw new Error("⚠️ ערך השעה ריק או לא תקף.");
        }

        var timeString; // משתנה לאחסון המחרוזת בפורמט "HH:mm"

        // 📌 אם הערך הוא אובייקט Date, נמיר אותו לפורמט HH:mm
        if (Object.prototype.toString.call(timeValue) === "[object Date]") {
            timeString = Utilities.formatDate(timeValue, Session.getScriptTimeZone(), "HH:mm");
        } 
        // 📌 אם הערך כבר מחרוזת בפורמט "HH:mm", נשתמש בו ישירות
        else if (typeof timeValue === "string") {
            timeString = timeValue;
        } 
        // 📌 אם זה לא Date ולא String, זורקים שגיאה
        else {
            throw new Error("⚠️ סוג נתון לא צפוי: " + typeof timeValue);
        }

        Logger.log("📌 ערך השעה שהתקבל לאחר עיבוד: " + timeString);

        // 📌 פיצול השעה והדקות לפי סימן נקודתיים `:`
        var parts = timeString.split(":");
        if (parts.length !== 2) {
            throw new Error("❌ פורמט שעה שגוי: " + timeString);
        }

        // 📌 המרה למספרים שלמים (parseInt) עבור שעות ודקות
        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);

        // 📌 בדיקה שהערכים הם מספרים תקינים
        if (isNaN(hours) || isNaN(minutes)) {
            throw new Error("❌ ערכי השעה או הדקות אינם מספריים: " + timeString);
        }

        // 📌 חישוב הזמן העשרוני (למשל: 14:30 → 14.5)
        var decimalTime = hours + (minutes / 60);
        Logger.log(`✅ חישוב זמן עשרוני עבור '${timeString}': ${decimalTime}`);

        return decimalTime;
    } catch (error) {
        Logger.log("❌ שגיאה בהמרת שעה לזמן עשרוני: " + error.message);
        return 0; // ברירת מחדל במקרה של שגיאה
    }
}

/**
 * 🚀 **calculateDecimalTimeDifference - מחשבת את הפרש הזמן בין "משעה" ל"עד שעה" בפורמט עשרוני**
 *
 * 📌 **תהליך העבודה של הפונקציה:**
 * 1️⃣ **וידוא שהערכים אינם ריקים** – אם `startTime` או `endTime` ריקים → הפונקציה מחזירה `0`.
 * 2️⃣ **אם הערכים הם `Date`** – נמיר אותם למחרוזת בפורמט `HH:mm:ss`, ואז נקצר ל-`HH:mm`.
 * 3️⃣ **נחתוך `HH:mm:ss` ל- `HH:mm`** כדי לוודא פורמט נכון.
 * 4️⃣ **בדיקה שהערכים הם בפורמט `"HH:mm"`** – אם לא, נחזיר `0`.
 * 5️⃣ **פיצול שעות ודקות** – המרת `"HH:mm"` למספרים.
 * 6️⃣ **המרה לשעות עשרוניות** – `שעות + (דקות / 60)`.
 * 7️⃣ **חישוב ההפרש העשרוני**.
 * 8️⃣ **אם `endTime` קטן מ-`startTime`, נוסיף 24 שעות להפרש** (חציית חצות).
 * 9️⃣ **נחזיר את התוצאה בפורמט עשרוני עם 2 ספרות אחרי הנקודה**.
 *
 * @param {string|Date} startTime - שעת התחלה בפורמט HH:mm או HH:mm:ss או כערך תאריך.
 * @param {string|Date} endTime - שעת סיום בפורמט HH:mm או HH:mm:ss או כערך תאריך.
 * @returns {number} ההפרש העשרוני (למשל: 14:30 → 14.5).
 */
function calculateDecimalTimeDifference(startTime, endTime) {
    try {
        Logger.log("📌 חישוב הפרש זמן עשרוני:");
        Logger.log(`⏳ משעה: ${startTime}`);
        Logger.log(`⏳ עד שעה: ${endTime}`);

        // 🛠️ 1️⃣ בדיקה שהערכים קיימים
        if (!startTime || !endTime) {
            Logger.log("⚠️ חסר ערך לשעה התחלתית או סופית. מחזיר 0.");
            return 0;
        }

        // 🟢 2️⃣ המרת ערכים מסוג Date לפורמט HH:mm:ss ואז קיצור ל-HH:mm
        if (startTime instanceof Date) {
            startTime = Utilities.formatDate(startTime, Session.getScriptTimeZone(), "HH:mm:ss");
        }
        if (endTime instanceof Date) {
            endTime = Utilities.formatDate(endTime, Session.getScriptTimeZone(), "HH:mm:ss");
        }

        // 🟢 3️⃣ קיצור ערכי השעה לפורמט `HH:mm`
        startTime = formatToHHMM(startTime);
        endTime = formatToHHMM(endTime);

        // 🟢 4️⃣ בדיקה שהערכים הם מחרוזות בפורמט HH:mm
        if (typeof startTime !== "string" || typeof endTime !== "string" || !startTime.includes(":") || !endTime.includes(":")) {
            Logger.log("❌ שגיאה: הערכים אינם במבנה 'HH:mm'. מחזיר 0.");
            return 0;
        }

        // 🔹 5️⃣ חלוקה לשעות ודקות
        let startParts = startTime.split(":").map(Number);
        let endParts = endTime.split(":").map(Number);

        // 🔹 6️⃣ בדיקת תקינות השעות והדקות
        if (startParts.length !== 2 || endParts.length !== 2 || isNaN(startParts[0]) || isNaN(startParts[1]) || isNaN(endParts[0]) || isNaN(endParts[1])) {
            Logger.log("❌ שגיאה: אחד מהערכים אינו תקין. מחזיר 0.");
            return 0;
        }

        // 🟢 7️⃣ המרת שעות עשרוניות
        let startDecimal = startParts[0] + (startParts[1] / 60);
        let endDecimal = endParts[0] + (endParts[1] / 60);
        
        // 🟢 8️⃣ חישוב ההפרש
        let difference = endDecimal - startDecimal;

        // 🟢 9️⃣ אם "עד שעה" קטן מ"משעה", משמע שחצינו חצות - נוסיף 24 שעות
        if (difference < 0) {
            Logger.log("⚠️ חישוב מחדש: הזמן חצה חצות. מוסיפים 24 שעות.");
            difference += 24;
        }

        // 🟢 🔟 עיגול התוצאה לשתי ספרות עשרוניות
        let roundedDifference = parseFloat(difference.toFixed(2));
        Logger.log(`✅ ההפרש העשרוני המחושב: ${roundedDifference}`);
        
        return roundedDifference;
    } catch (error) {
        Logger.log("❌ שגיאה בחישוב הפרש זמן: " + error.message);
        return 0;
    }
}

/**
 * 🚀 **formatToHHMM - מקבלת זמן ומחזירה רק HH:mm**
 *
 * 📌 **תהליך העבודה:**
 * 1️⃣ אם הזמן הוא אובייקט `Date` → נמיר אותו למחרוזת בפורמט `HH:mm`.
 * 2️⃣ אם הזמן הוא מחרוזת חוקית `HH:mm:ss` → נחתוך רק את שני החלקים הראשונים (`HH:mm`).
 * 3️⃣ אם הזמן הוא מחרוזת חוקית `HH:mm` → נחזיר אותו כמו שהוא.
 * 4️⃣ אם הזמן לא חוקי → נחזיר `00:00` כדי למנוע קריסת חישובים.
 *
 * @param {Date|string} timeValue - שעה בפורמט `HH:mm:ss`, `HH:mm` או אובייקט `Date`
 * @returns {string} שעה בפורמט `HH:mm`
 */
function formatToHHMM(timeValue) {
    try {
        if (!timeValue) {
            Logger.log("⚠️ ערך הזמן ריק, מחזיר 00:00");
            return "00:00";
        }

        // 🟢 1️⃣ אם זה אובייקט Date, נמיר אותו לפורמט "HH:mm"
        if (Object.prototype.toString.call(timeValue) === "[object Date]") {
            let formattedTime = Utilities.formatDate(timeValue, Session.getScriptTimeZone(), "HH:mm");
            Logger.log(`✅ המרה מ-Date ל-HH:mm: ${formattedTime}`);
            return formattedTime;
        }

        // 🟢 2️⃣ אם זו כבר מחרוזת בפורמט "HH:mm:ss" או "HH:mm"
        if (typeof timeValue === "string") {
            let parts = timeValue.split(":");

            // אם יש בדיוק 3 חלקים (HH:mm:ss) → ניקח רק את השעתיים הראשונות
            if (parts.length === 3) {
                let formattedTime = parts.slice(0, 2).join(":");
                Logger.log(`✅ קיצוץ מ-HH:mm:ss ל-HH:mm: ${formattedTime}`);
                return formattedTime;
            }

            // אם זה כבר בפורמט "HH:mm" → נחזיר אותו
            if (parts.length === 2) {
                Logger.log(`✅ המחרוזת תקינה בפורמט HH:mm: ${timeValue}`);
                return timeValue;
            }
        }

        // אם שום דבר לא עבד → שגיאה, נחזיר 00:00
        Logger.log(`⚠️ פורמט שגוי (${timeValue}), מחזיר 00:00`);
        return "00:00";

    } catch (error) {
        Logger.log("❌ שגיאה בהמרת שעה ל-HH:mm: " + error.message);
        return "00:00";
    }
}

