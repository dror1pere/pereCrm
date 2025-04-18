/**
 * 🔍 בודק האם עמודות "מקבל_עמלה" ו-"תאריך_סיום_חובת_עמלה" קיימות בגיליון "לקוחות"
 */
function checkCommissionColumnsExist() {
  const sheetName = "לקוחות";
  const requiredColumns = ["מקבל_עמלה", "תאריך_סיום_חובת_עמלה"];
  const columnIndexes = getColumnIndexes(sheetName);

  Logger.log(`📋 בדיקת עמודות בגיליון '${sheetName}':`);

  let allFound = true;

  requiredColumns.forEach(col => {
    if (columnIndexes[col]) {
      Logger.log(`✅ העמודה '${col}' קיימת (אינדקס: ${columnIndexes[col]})`);
    } else {
      Logger.log(`❌ העמודה '${col}' לא נמצאה!`);
      allFound = false;
    }
  });

  if (allFound) {
    Logger.log("🎉 כל העמודות הדרושות קיימות בגיליון.");
  } else {
    Logger.log("⚠️ חלק מהעמודות חסרות. ודא שהשמות תואמים בדיוק לשורת הכותרת.");
  }
}
