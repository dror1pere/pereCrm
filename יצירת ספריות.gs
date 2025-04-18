/**
 * 🚀 יוצר או מחפש תיקיית לקוח בתוך ספריית "לקוחות" שב-CRM.
 * @param {string} customerName - שם הלקוח.
 * @return {Object} אובייקט עם מזהה וכתובת הספרייה.
 */
function createClientFolder(customerName) {
    try {
        Logger.log(`📁 יצירת / חיפוש ספריית לקוח: '${customerName}'`);

        if (!customerName) {
            throw new Error("❌ שם הלקוח חסר. לא ניתן ליצור ספרייה.");
        }

        // מזהה ספריית השורש (CRM)
        var rootFolder = DriveApp.getFolderById("1okwQ9JKb-HrxD_GSTWpPYmJRzZzgZO9j");

        // חיפוש או יצירת ספריית "לקוחות" בתוך CRM
        var clientsFolder = findOrCreateFolder(rootFolder, "לקוחות");

        // חיפוש או יצירת תיקיית לקוח
        var clientFolder = findOrCreateFolder(clientsFolder, customerName);

        Logger.log(`✅ ספריית הלקוח '${customerName}' נוצרה או נמצאה בהצלחה!`);
        return {
            clientFolderId: clientFolder.getId(),
            clientFolderUrl: clientFolder.getUrl()
        };
    } catch (error) {
        Logger.log(`❌ שגיאה ביצירת ספריית לקוח '${customerName}': ${error.message}`);
        return {};
    }
}

/**
 * 🚀 יוצר או מחפש תיקיית פרויקט בתוך ספריית לקוח קיימת.
 * @param {string} customerName - שם הלקוח.
 * @param {string} projectName - שם הפרויקט.
 * @return {Object} אובייקט עם מזהה וכתובת הספרייה.
 */
function createProjectFolder(customerName, projectName) {
    try {
        Logger.log(`📂 יצירת / חיפוש ספריית פרויקט: '${projectName}' תחת הלקוח: '${customerName}'`);

        if (!customerName || !projectName) {
            throw new Error("❌ שם הלקוח או שם הפרויקט חסרים. לא ניתן ליצור ספריות.");
        }

        // חיפוש תיקיית הלקוח, אך **לא יוצרים אותה מחדש אם היא חסרה**
        var clientFolderData = createClientFolder(customerName);
        if (!clientFolderData.clientFolderId) {
            throw new Error(`❌ לא נמצאה ספריית לקוח '${customerName}', לא ניתן להמשיך.`);
        }

        var clientFolder = DriveApp.getFolderById(clientFolderData.clientFolderId);

        // חיפוש או יצירת תיקיית פרויקט
        var projectFolder = findOrCreateFolder(clientFolder, projectName);

        Logger.log(`✅ ספריית הפרויקט '${projectName}' נוצרה או נמצאה בהצלחה!`);
        return {
            projectFolderId: projectFolder.getId(),
            projectFolderUrl: projectFolder.getUrl()
        };
    } catch (error) {
        Logger.log(`❌ שגיאה ביצירת ספריית פרויקט '${projectName}' תחת '${customerName}': ${error.message}`);
        return {};
    }
}

/**
 * 🔍 פונקציה לחיפוש או יצירת תיקייה לפי שם בתוך תיקיית אב.
 * @param {Folder} parentFolder - תיקיית האב.
 * @param {string} folderName - שם התיקייה לחיפוש או יצירה.
 * @return {Folder} התיקייה שנמצאה או נוצרה.
 */
function findOrCreateFolder(parentFolder, folderName) {
    try {
        Logger.log(`🔍 מחפש תיקייה '${folderName}' בתוך '${parentFolder.getName()}'`);
        var folders = parentFolder.getFoldersByName(folderName);

        if (folders.hasNext()) {
            Logger.log(`✅ נמצאה תיקייה קיימת: '${folderName}'`);
            return folders.next();
        }

        Logger.log(`📁 לא נמצאה תיקייה, יוצרים חדשה: '${folderName}'`);
        return parentFolder.createFolder(folderName);
    } catch (error) {
        Logger.log(`❌ שגיאה בחיפוש / יצירת תיקייה '${folderName}': ${error.message}`);
        throw new Error(`❌ לא ניתן למצוא או ליצור את התיקייה '${folderName}'`);
    }
}
