var columnIndexCache = null; // משתנה גלובלי לשמירת מיפוי הכותרות והעמודות
var headerRowCache = null;  // משתנה גלובלי לשמירת שורת הכותרות

/**
 * פונקציה שמכינה מיפוי כותרות ומספרי עמודות עבור כל הגיליונות (למעט "טבלאות").
 * הנתונים נשמרים במשתנה גלובלי, ב-CacheService וב-PropertiesService.
 */
function initializeColumnMappings() {
  try {
    Logger.log("⚡ אתחול מיפוי כותרות ועמודות עבור כל הגיליונות...");

    // 1️⃣ בדיקה אם הנתונים קיימים כבר במשתנה גלובלי
    if (columnIndexCache !== null) {
      Logger.log("✅ מיפוי עמודות נטען מהמשתנה הגלובלי.");
      return columnIndexCache;
    }

    var cache = CacheService.getScriptCache();
    var cachedMappings = cache.get("columnIndexMappings");

    // 2️⃣ אם הנתונים נמצאים ב-Cache, נטען אותם ונשמור במשתנה הגלובלי
    if (cachedMappings) {
      columnIndexCache = JSON.parse(cachedMappings);
      Logger.log("✅ מיפוי עמודות נטען מה-Cache.");
      return columnIndexCache;
    }

    var scriptProperties = PropertiesService.getScriptProperties();
    var storedMappings = scriptProperties.getProperty("columnIndexMappings");

    // 3️⃣ אם הנתונים נשמרו בפרופרטיז, נטען אותם ונשמור במשתנה הגלובלי וב-Cache
    if (storedMappings) {
      columnIndexCache = JSON.parse(storedMappings);
      cache.put("columnIndexMappings", storedMappings, 21600); // שומרים ב-Cache ל-6 שעות
      Logger.log("✅ מיפוי עמודות נטען מ-PropertiesService.");
      return columnIndexCache;
    }

    // 4️⃣ אם אין נתונים שמורים, נוצרים מחדש ע"י סריקת הגיליונות
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var columnMappings = {};

    sheets.forEach(function (sheet) {
      var sheetName = sheet.getName();
      if (sheetName === "טבלאות"  || sheetName==="דוח נוכחות" || sheetName === "אנשי קשר" ) return; // מדלגים על גיליון "טבלאות"

      var headerRow = getHeaderRow(); // קבלת שורת הכותרות
      var lastColumn = sheet.getLastColumn();
      var headers = sheet.getRange(headerRow, 1, 1, lastColumn).getValues()[0];

      columnMappings[sheetName] = {};
      headers.forEach(function (header, index) {
        if (header) columnMappings[sheetName][header] = index + 1; // עמודות ב-Google Sheets מתחילות מ-1
      });
    });

    // 5️⃣ שמירת הנתונים בכל הרמות (גלובלי, Cache, Properties)
    var mappingsJson = JSON.stringify(columnMappings);
    columnIndexCache = columnMappings;
    cache.put("columnIndexMappings", mappingsJson, 21600); // שמירת נתונים ב-Cache ל-6 שעות
    scriptProperties.setProperty("columnIndexMappings", mappingsJson); // שמירת נתונים בפרופרטיז

    Logger.log("🚀 מיפוי העמודות הושלם ונשמר בהצלחה!");
    return columnMappings;

  } catch (error) {
    logError("❌ שגיאה באתחול מיפוי הכותרות: " + error);
    return null;
  }
}

/**
 * פונקציה שמחזירה את מספר העמודה לפי כותרת עבור גיליון מסוים.
 * @param {string} sheetName - שם הגיליון.
 * @param {string} columnTitle - הכותרת של העמודה.
 * @return {number|null} מספר העמודה או null אם לא נמצא.
 */
function getColumnIndex(sheetName, columnTitle) {
  try {
    var columnMappings = initializeColumnMappings();
    if (!columnMappings || !columnMappings[sheetName]) {
      Logger.log("⚠️ לא נמצא מיפוי עבור הגיליון '" + sheetName + "'.");
      return null;
    }

    var columnIndex = columnMappings[sheetName][columnTitle] || null;
    if (columnIndex) {
      Logger.log("✅ מספר העמודה עבור '" + columnTitle + "' בגיליון '" + sheetName + "': " + columnIndex);
    } else {
      Logger.log("⚠️ לא נמצא מספר עמודה עבור הכותרת '" + columnTitle + "' בגיליון '" + sheetName + "'.");
    }
    return columnIndex;

  } catch (error) {
    logError("❌ שגיאה בקבלת מספר עמודה: " + error);
    return null;
  }
}

/**
 * מחזירה אובייקט עם מיפוי כותרות לעמודות עבור גיליון נתון.
 * @param {string} sheetName - שם הגיליון.
 * @return {object} אובייקט עם כותרות כמפתחות ומספרי עמודות כערכים.
 */
function getColumnIndexes(sheetName) {

    try {
        if (!columnIndexCache) {
            Logger.log(`⚠️ מיפוי כותרות לעמודות לא נמצא בזיכרון. טוען מחדש...`);
            columnIndexCache = initializeColumnMappings();
        }
        Logger.log(columnIndexCache[sheetName]) 
        return columnIndexCache[sheetName] || {}; // מחזיר את המיפוי אם קיים, אחרת אובייקט ריק
    } catch (error) {
        Logger.log(`❌ שגיאה בשליפת מיפוי עמודות לגיליון '${sheetName}': ${error.message}`);
        return {};
    }
}

