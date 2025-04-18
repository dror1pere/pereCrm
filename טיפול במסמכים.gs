/**
 * מעתיק את קבצי ה-Template לספריית הפרויקט ומעדכן את הטבלה
 * @param {string} customerName - שם הלקוח
 * @param {string} projectName - שם הפרויקט
 * @param {string} projectFolderId - מזהה ספריית הפרויקט
 * @return {Object} אובייקט עם כתובות הקבצים שהועתקו
 */
function copyProjectTemplates(customerName, contactName, projectName, projectFolderId) {
    try {
        Logger.log("📄 התחלת העתקת קבצי הטמפלט לפרויקט: " + projectName);

        var templateFolderId = "1FcnETqViyTHbHAxZU4LNYdbGnU9gjwUR"; // מזהה ספריית ה-TEMPLATES
        var templateFolder = DriveApp.getFolderById(templateFolderId);
        var projectFolder = DriveApp.getFolderById(projectFolderId);

        // ✅ העתקת "הצעת מחיר" **עם עדכון שדות**
        var proposalUrl = copyAndProcessTemplate("הצעת מחיר", customerName, contactName, projectName, projectFolder, true);

        // ✅ העתקת "לוג פעילות" **ללא עדכון שדות**
        var logUrl = copyAndProcessTemplate("לוג פעילות", customerName, contactName, projectName, projectFolder, false);

        return { proposalUrl, logUrl };

    } catch (error) {
        Logger.log("❌ שגיאה בהעתקת קבצים לפרויקט: " + error.message);
        return { proposalUrl: null, logUrl: null };
    }
}

/**
 * מעתיק קובץ טמפלט לספריית הפרויקט ומבצע עדכון שדות אם נדרש
 * @param {string} templateName - שם קובץ הטמפלט להעתקה
 * @param {string} customerName - שם הלקוח
 * @param {string} projectName - שם הפרויקט
 * @param {Folder} projectFolder - תיקיית היעד
 * @param {boolean} updateFields - האם לעדכן שדות דינמיים
 * @return {string|null} כתובת הקובץ שהועתק או null אם נכשל
 */
function copyAndProcessTemplate(templateName, customerName, contactName, projectName, projectFolder, updateFields) {
    try {
        Logger.log(`📄 מחפש את קובץ ה-TEMPLATE '${templateName}'`);
        
        var templateFolderId = "1FcnETqViyTHbHAxZU4LNYdbGnU9gjwUR"; // מזהה ספריית הטמפלטים
        var templateFolder = DriveApp.getFolderById(templateFolderId);
        var files = templateFolder.getFilesByName(templateName);

        if (!files.hasNext()) {
            Logger.log(`❌ שגיאה: לא נמצא קובץ בשם '${templateName}'`);
            return null;
        }
        var templateFile = files.next();

        var newFileName = `${templateName} - ${customerName} - ${projectName}`;
        var copiedFile = templateFile.makeCopy(newFileName, projectFolder);
        var copiedFileId = copiedFile.getId();
        var copiedFileUrl = copiedFile.getUrl();

        Logger.log(`✅ '${newFileName}' הועתק בהצלחה לספריית הפרויקט`);

        // אם צריך לעדכן שדות דינמיים במסמך
        if (updateFields) {
            updateDocumentFields(copiedFileId, customerName,contactName, projectName);
        }

        return copiedFileUrl;
    } catch (error) {
        Logger.log(`❌ שגיאה בהעתקת '${templateName}': ${error.message}`);
        return null;
    }
}

/**
 * מעדכן שדות דינמיים במסמך Google Docs
 * @param {string} fileId - מזהה הקובץ לעדכון
 * @param {string} customerName - שם הלקוח
 * @param {string} projectName - שם הפרויקט
 */
function updateDocumentFields(fileId, customerName, contactName, projectName) {
 
    try {
        Logger.log(`✏️ מתחיל עדכון שדות דינמיים במסמך ${fileId}`);
        
        // ניסיון לפתוח את המסמך
        var doc;
        try {
            Logger.log("🔍 מנסה לפתוח את המסמך...");
            doc = DocumentApp.openById(fileId);
            Logger.log("✅ המסמך נפתח בהצלחה.");
        } catch (permError) {
            Logger.log("❌ אין הרשאות לפתיחת המסמך: " + permError.message);
            return false; // מחזירים false כדי לציין שהעדכון נכשל
        }

        var body = doc.getBody();
        Logger.log("📝 גישה לגוף המסמך התקבלה.");
        
        var todayDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
        body.replaceText("{{date}}", todayDate);
        body.replaceText("{{clientName}}", contactName);
        body.replaceText("{{companyName}}", customerName);
        body.replaceText("{{subject}}", projectName);
        Logger.log("✅ השדות עודכנו במסמך.");

        // ניסיון לשמור ולסגור
        try {
            Logger.log("💾 מנסה לשמור ולסגור את המסמך...");
            doc.saveAndClose();
            Logger.log("✅ המסמך נשמר ונסגר בהצלחה.");
        } catch (saveError) {
            Logger.log("⚠️ שגיאה בשמירת המסמך: " + saveError.message);
        }

        return true; // מחזירים true אם הכול עבר בהצלחה
    } catch (error) {
        Logger.log("❌ שגיאה כללית בעדכון שדות דינמיים: " + error.message);
        return false; // מחזירים false כדי שהתהליך יוכל להמשיך
    }
}