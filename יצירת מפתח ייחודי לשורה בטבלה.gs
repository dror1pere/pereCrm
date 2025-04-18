/**
 * 🚀 מייצרת מזהה ייחודי לכל גיליון לפי סוגו.
 *
 * 🔹 שימוש ישיר בפלט של `getNextAvailableCounter`, שתומך במודל החדש של פרויקטים.
 * 
 * @param {string} sheetName - שם הגיליון שבו נוצר המזהה.
 * @param {string|null} customerID - מזהה הלקוח (אם רלוונטי, רק לפרויקטים).
 * @return {string} מזהה ייחודי בפורמט המתאים לגיליון.
 */
function generateUniqueID(sheetName, customerID = null) {
  
    try {
        ensureAllCachesLoaded();

        var idPrefixes = {
            "לקוחות": "CUSTOMER",
            "פרויקטים": "PROJECT",
            "תוספות לפרויקטים": "ADDON",
            "פעילות": "ACTIVITY"
        };

        var prefix = idPrefixes[sheetName] || "GENERIC"; // ברירת מחדל במקרה שאין התאמה
        var date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "ddMMyyyy");

        Logger.log(`🔹 יצירת מזהה חדש עבור '${sheetName}', לקוח: ${customerID || "⚠️ ללא מזהה לקוח"}`);

        // 🔹 קבלת המונה המתאים מהפונקציה
        let uniqueCounter = getNextAvailableCounter(sheetName, customerID);

        if (!uniqueCounter) {
            logError(`❌ שגיאה: המונה שהוחזר ריק או שגוי עבור '${sheetName}'`);
            return null;
        }
        //רק במקרה אחד הפונקציה שמחזירה את המספר הפוני הבא מזחרה מזהה מלא וזה במצב שמדובר בלקוח קיים שיש לו פרויקט שיווק פתוח. אז היא מחזירה את כל המזהה ולכן צריך את השורה הבאה. 
        let  uniqueID = uniqueCounter.includes("PROJECT") ? uniqueCounter :`${prefix}_${date}_${uniqueCounter}`;
        
        Logger.log(`✅ נוצר מזהה ייחודי עבור '${sheetName}': ${uniqueID}`);
        return uniqueID;

    } catch (error) {
        logError(`❌ שגיאה ביצירת מזהה ייחודי ל-'${sheetName}': ${error}`);
        return null;
    }
}
