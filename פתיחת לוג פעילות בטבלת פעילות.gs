/**
 * 🚀 פותח ומעדכן מסמך Google Docs הקשור לשורה האחרונה שנבחרה בגיליון "פעילות".
 *
 * 🔹 **תהליך הפעולה**:
 * 1. מקבל את הגיליון "פעילות" ובודק שהוא קיים.
 * 2. שולף את אינדקסי העמודות "לוג_פעילות" ו-"תאריך_יצירת_שורה".
 * 3. מקבל את השורה האחרונה שנבחרה ובודק שהיא קיימת.
 * 4. קורא את הקישור למסמך ואת התאריך מהשורה שנבחרה.
 * 5. מאמת שהקישור למסמך תקין ומפיק את מזהה המסמך.
 * 6. פותח את המסמך ומוודא אם הוא ריק או מכיל טקסט.
 * 7. אם המסמך אינו ריק, מוסיף שתי שורות רווח.
 * 8. מוסיף שורה חדשה עם תאריך יצירת הפעילות, מיושר לימין.
 * 9. מוסיף **שתי שורות רווח אחרי הטקסט שהוכנס**.
 * 10. שומר את המסמך.
 * 11. מציג **קישור לחיץ** לפתיחת המסמך, וכאשר המשתמש לוחץ עליו – תיבת הדו-שיח נסגרת.
 */
function openAndUpdateLogFile() {
  Logger.log("📌 התחלת הפונקציה - openAndUpdateLogFile");

  var sheetName = "פעילות"; 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log("❌ שגיאה: לא נמצא גיליון בשם " + sheetName);
    showError("❌ שגיאה: לא נמצא גיליון בשם " + sheetName);
    return;
  }

  Logger.log("✅ נמצא גיליון: " + sheetName);

  var logColumn = getColumnIndex(sheetName, "לוג_פעילות"); 
  var dateColumn = getColumnIndex(sheetName, "תאריך_יצירת_שורה");

  if (logColumn === -1 || dateColumn === -1) {
    Logger.log("❌ שגיאה: לא נמצאו עמודות נדרשות.");
    showError("❌ שגיאה: לא נמצאו עמודות 'לוג_פעילות' או 'תאריך_יצירת_שורה' בגיליון.");
    return;
  }

  Logger.log("✅ עמודות נמצאו - לוג_פעילות באינדקס: " + logColumn + ", תאריך_יצירת_שורה באינדקס: " + dateColumn);

  var row = PropertiesService.getScriptProperties().getProperty("lastSelectedRow");

  if (!row || row.trim() === "") {
    Logger.log("❌ שגיאה: לא נמצאה שורה נבחרת.");
    showError("❌ לא נמצאה שורה שנבחרה. יש לבחור שורה לפני לחיצה על הכפתור.");
    return;
  }

  row = parseInt(row, 10);
  Logger.log("✅ שימוש בשורה האחרונה שנבחרה - " + row);

  var docLink = sheet.getRange(row, logColumn).getValue();
  var dateCreated = sheet.getRange(row, dateColumn).getValue();

  Logger.log("🔗 לינק למסמך שנמצא - " + docLink);
  Logger.log("📅 תאריך יצירת פעילות שנמצא - " + dateCreated);

  if (!docLink || docLink.trim() === "") {
    Logger.log("❌ שגיאה: אין מסמך מקושר בשורה זו.");
    showError("❌ אין מסמך מקושר בשורה זו.");
    return;
  }

  try {
    var fileId = docLink.match(/[-\w]{25,}/);
    if (!fileId) {
      Logger.log("❌ שגיאה: לא ניתן לחלץ את מזהה המסמך מהלינק.");
      showError("❌ שגיאה בזיהוי המסמך.");
      return;
    }

    fileId = fileId[0];
    Logger.log("📁 מזהה המסמך שחולץ - " + fileId);

    var doc = DocumentApp.openById(fileId);
    var body = doc.getBody();
    var isEmpty = body.getText().trim() === "";

    Logger.log("✅ המסמך נפתח בהצלחה. האם המסמך ריק? " + isEmpty);

    if (!isEmpty) {
      body.appendParagraph(""); 
      body.appendParagraph("");
      Logger.log("✅ נוספו שתי שורות רווח בסוף המסמך.");
    } else {
      Logger.log("✅ המסמך ריק - דילגנו על הוספת שורות רווח.");
    }

    var newParagraph = body.appendParagraph("📅 תאריך יצירת פעילות: " + dateCreated);
    newParagraph.setBold(true).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    Logger.log("✅ נוסף תאריך יצירת הפעילות - " + dateCreated + " (מיושר לימין)");

    body.appendParagraph(""); 
    body.appendParagraph("");
    Logger.log("✅ נוספו שתי שורות רווח אחרי הטקסט שהוזן.");

    doc.saveAndClose();
    Logger.log("✅ המסמך נשמר ונסגר.");

    var url = "https://docs.google.com/document/d/" + fileId;

    showLink("✅ המסמך עודכן בהצלחה!", url);
    Logger.log("✅ הקישור למסמך הוצג למשתמש.");

  } catch (err) {
    Logger.log("❌ שגיאה בלתי צפויה - " + err.toString());
    showError("❌ שגיאה: " + err.toString());
  }
}

/**
 * 🔗 מציג תיבת דו-שיח עם קישור לחיץ למסמך.
 *    🔹 כאשר המשתמש לוחץ על הקישור – תיבת הדו-שיח תיסגר אוטומטית.
 *
 * @param {string} title - כותרת ההודעה.
 * @param {string} url - כתובת המסמך שנפתח.
 */
function showLink(title, url) {
  try {
    var htmlOutput = HtmlService.createHtmlOutput(
      '<p style="font-size:14px;">' + title + '</p>' +
      '<p><a href="' + url + '" target="_blank" style="font-size:16px; font-weight:bold; color:blue;" onclick="google.script.host.close();">📂 לחץ כאן לפתוח את המסמך</a></p>'
    ).setWidth(400).setHeight(200);

    SpreadsheetApp.getUi().showModalDialog(htmlOutput, "📂 קישור למסמך");
    Logger.log("✅ תיבת דו-שיח עם קישור נפתחה בהצלחה.");
  } catch (err) {
    Logger.log("⚠️ לא ניתן להציג קישור למשתמש, נרשם רק לוג. הודעה: " + url);
  }
}



/**
 * 🛑 מציג הודעת שגיאה למשתמש או כותב ללוג אם לא ניתן להציג UI.
 *
 * 🔹 **תהליך הפעולה**:
 * 1. מנסה להציג הודעה עם `SpreadsheetApp.getUi().alert()`.
 * 2. אם הקוד רץ מסביבה ללא UI (כגון טריגר), רושם את ההודעה ללוג בלבד.
 *
 * @param {string} message - הודעת השגיאה להצגה.
 */
function showError(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
    Logger.log("⚠️ הודעת שגיאה הוצגה למשתמש: " + message);
  } catch (err) {
    Logger.log("⚠️ לא ניתן להציג הודעה למשתמש, נרשם רק לוג. הודעה: " + message);
  }
}

/**
 * 🔗 מציג תיבת דו-שיח עם קישור לחיץ למסמך.
 *
 * 🔹 **תהליך הפעולה**:
 * 1. יוצר חלון HTML עם קישור פתיחה.
 * 2. מציג את תיבת הדו-שיח באמצעות `SpreadsheetApp.getUi().showModalDialog()`.
 * 3. אם לא ניתן להציג UI, רושם את הקישור ללוג בלבד.
 *
 * @param {string} title - כותרת ההודעה.
 * @param {string} url - כתובת המסמך שנפתח.
 */

/**
 * 🔗 מציג תיבת דו-שיח עם קישור לחיץ למסמך.
 *    🔹 כאשר המשתמש לוחץ על הקישור – תיבת הדו-שיח תיסגר אוטומטית.
 *
 * @param {string} title - כותרת ההודעה.
 * @param {string} url - כתובת המסמך שנפתח.
 */
function showLink(title, url) {
  try {
    var html = `
      <html>
        <head>
          <script>
            function openDoc() {
              window.open("${url}", "_blank");
              google.script.host.close();
            }
          </script>
        </head>
        <body>
          <p style="font-size:14px;">${title}</p>
          <p><a href="javascript:void(0);" onclick="openDoc()" style="font-size:16px; font-weight:bold; color:blue;">📂 לחץ כאן לפתוח את המסמך</a></p>
        </body>
      </html>
    `;

    var htmlOutput = HtmlService.createHtmlOutput(html).setWidth(400).setHeight(200);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, "📂 קישור למסמך");

    Logger.log("✅ תיבת דו-שיח עם קישור נפתחה בהצלחה.");
  } catch (err) {
    Logger.log("⚠️ לא ניתן להציג קישור למשתמש, נרשם רק לוג. הודעה: " + url);
  }
}

