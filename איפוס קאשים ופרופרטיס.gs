/**
 * פונקציה לאיפוס כל הקאשים והמשתנים של הסקריפט.
 * כולל מחיקת נתונים ב-CacheService וב-PropertiesService, ואיפוס המונה ל-999.
 */
/**
 * פונקציה לאיפוס כל הקאשים והמשתנים הגלובליים של הסקריפט.
 */
function resetAllCachesAndProperties() {
  try {
    Logger.log("⚡ איפוס כל הקאשים והפרופרטיז של הסקריפט...");

    var cache = CacheService.getScriptCache();
    var scriptProperties = PropertiesService.getScriptProperties();

    // 1️⃣ מחיקת כל הקאשים
    ["customerCounter", "projectCounter", "addonCounter", "activityCounter", "columnIndexMappings", "headerRow"]
      .forEach(key => cache.remove(key));
    Logger.log("✅ כל הקאשים הרלוונטיים נמחקו בהצלחה.");

    // 2️⃣ מחיקת כל המשתנים השמורים בפרופרטיז
    scriptProperties.deleteAllProperties();
    Logger.log("✅ כל המשתנים בפרופרטיז נמחקו בהצלחה.");

    // 3️⃣ אתחול המונים מחדש לערכי ברירת מחדל
    globalCounters = { 
      "customerCounter": 10000, 
      "projectCounter": 20000, 
      "addonCounter": 30000, 
      "activityCounter": 40000 
    };

    Object.keys(globalCounters).forEach(counter => {
      scriptProperties.setProperty(counter, globalCounters[counter]);
      cache.put(counter, globalCounters[counter], 21600);
      Logger.log(`✅ המונה '${counter}' אופס לערך ${globalCounters[counter]}.`);
    });

    Logger.log("🚀 כל הנתונים אופסו בהצלחה!");

  } catch (error) {
    logError("❌ שגיאה באיפוס הקאשים והפרופרטיז: " + error);
  }
}

// /**
//  * פונקציה לרישום שגיאות בלוג.
//  * @param {string} message - הודעת השגיאה.
//  */
// function logError(message) {
//   Logger.log("❌ שגיאה: " + message);
// }
