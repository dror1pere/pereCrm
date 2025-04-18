
/**
 * טוענת את כל הקאשים והמשתנים של הסקריפט, ואם נתון חסר - יוצרת אותו מחדש.
 */
/**
 * טוענת את כל הקאשים והמשתנים של הסקריפט, ללא ניהול מונה.
 */
function ensureAllCachesLoaded() {
  try {
    var cache = CacheService.getScriptCache();
    var scriptProperties = PropertiesService.getScriptProperties();

    // 📌 1️⃣ טעינת שורת הכותרות
    if (headerRowCache === null) {
      var cachedHeader = cache.get("headerRow");
      if (cachedHeader) {
        headerRowCache = parseInt(cachedHeader, 10);
      } else {
        var storedHeader = scriptProperties.getProperty("headerRow");
        if (storedHeader) {
          headerRowCache = parseInt(storedHeader, 10);
          cache.put("headerRow", headerRowCache, 21600);
        } else {
          headerRowCache = getHeaderRow(); // שליפה מגיליון
          scriptProperties.setProperty("headerRow", headerRowCache);
          cache.put("headerRow", headerRowCache, 21600);
        }
      }
    }

    // 🔄 2️⃣ טעינת מיפוי הכותרות
    if (columnIndexCache === null) {
      var cachedMappings = cache.get("columnIndexMappings");
      if (cachedMappings) {
        columnIndexCache = JSON.parse(cachedMappings);
      } else {
        var storedMappings = scriptProperties.getProperty("columnIndexMappings");
        if (storedMappings) {
          columnIndexCache = JSON.parse(storedMappings);
          cache.put("columnIndexMappings", storedMappings, 21600);
        } else {
          columnIndexCache = initializeColumnMappings(); // שליפה מגיליון
          scriptProperties.setProperty("columnIndexMappings", JSON.stringify(columnIndexCache));
          cache.put("columnIndexMappings", JSON.stringify(columnIndexCache), 21600);
        }
      }
    }

    Logger.log("✅ כל הנתונים הקריטיים נטענו בהצלחה (ללא ניהול מונה).");

  } catch (error) {
    logError("❌ שגיאה בטעינת הנתונים הקריטיים: " + error);
  }
}

