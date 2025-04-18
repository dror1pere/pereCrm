/**
 * 🚀 סורק מיילים נכנסים, מזהה לידים חדשים, ומעביר אותם לעיבוד.
 * 
 * 🔹 **שלבי התהליך:**
 * 1️⃣ **חיפוש מיילים חדשים שלא נקראו** – לפי כתובת השולח ונושא המייל.
 * 2️⃣ **שליפת תוכן המייל** – חילוץ גוף המייל וניסיון לפענח את הטבלה שבתוכו.
 * 3️⃣ **בדיקה אם הליד מכיל נתונים תקפים**:
 *    - אם חסרים נתונים → דילוג על המייל.
 * 4️⃣ **עיבוד נתוני הליד** באמצעות `processLeadData`.
 * 5️⃣ **במידה והתהליך הצליח**:
 *    - תיוג המייל תחת "לידים אקסלנטי".
 *    - סימון המייל כנקרא כדי למנוע טיפול חוזר בו.
 * 6️⃣ **תיעוד תהליך מלא בלוגים** לטובת מעקב ובדיקת שגיאות.
 */
function extractNewLeadsFromGmail() {
    try {
        Logger.log("📥 התחלת סריקת מיילים לזיהוי לידים חדשים...");

        // 1️⃣ **הגדרת פרמטרים לסינון המיילים**
        const senderEmail = "excelanti10@gmail.com";
        const subjectOptions = ["הפנייה חדשה", "ליד חדש", "מייל עם טבלה וטקסט"];
        const queryBase = `from:${senderEmail} is:unread`;

        let threads = [];
        subjectOptions.forEach(subjectText => {
            const query = `${queryBase} subject:${subjectText}`;
            Logger.log(`🔍 מחפש מיילים עם השאילתה: ${query}`);
            threads.push(...GmailApp.search(query));
        });

        // 2️⃣ **אם אין מיילים חדשים, סיום הפונקציה**
        if (threads.length === 0) {
            Logger.log("📭 לא נמצאו מיילים חדשים לעיבוד.");
            return;
        }

        // 3️⃣ **יצירת או שליפת תגית 'לידים אקסלנטי'**
        const labelName = "לידים אקסלנטי";
        let label = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

        // 4️⃣ **מעבר על כל המיילים החדשים**
        threads.forEach(thread => {
            const messages = thread.getMessages();
            messages.forEach(message => {
                if (!message.isUnread()) return; // דילוג על מיילים שכבר נקראו

                try {
                    Logger.log(`📩 מייל חדש נמצא עם נושא: ${message.getSubject()}`);

                    // 5️⃣ **שליפת תוכן המייל וניסיון לפרק טבלה**
                    const body = message.getBody();
                    const leadData = parseHtmlTable(body);

                    // 6️⃣ **בדיקה אם הטבלה מכילה נתונים תקפים**
                    if (leadData.headers.length === 0 || leadData.values.length === 0) {
                        Logger.log("⚠️ לא נמצאו נתונים בטבלה או פירוק הטבלה נכשל. מדלגים על המייל.");
                        return;
                    }

                    Logger.log("✅ טבלה נמצאה ופורקה בהצלחה. מעביר לעיבוד הנתונים...");

                    // 7️⃣ **שליחת הנתונים לעיבוד**
                    let success = processLeadData(leadData);

                    // 8️⃣ **אם העיבוד הצליח, סימון המייל כנקרא ותיוגו**
                    if (success) {
                          // תיוג וסימון המייל כנקרא
                          thread.addLabel(label);
                          message.markRead();
                        Logger.log("📌 המייל סומן כנקרא ותויג בהצלחה.");
                    } else {
                        Logger.log("⚠️ עיבוד הנתונים נכשל. המייל לא סומן כנקרא.");
                    }

                } catch (messageError) {
                    Logger.log(`❌ שגיאה בטיפול במייל ספציפי: ${messageError.message}`);
                }
            });
        });

        Logger.log("✅ סיום עיבוד המיילים.");
    } catch (error) {
        Logger.log(`❌ שגיאה כללית בעיבוד המיילים: ${error.message}`);
    }
}

/**
 * 🔍 מחלץ נתונים מטבלת HTML בגוף המייל ומחזיר אותם בפורמט מובנה.
 *
 * 🚀 **תהליך העבודה:**
 * 1️⃣ **בודקת אם קיימת טבלה בגוף המייל** – מחפשת תגית `<table>...<table/>`.
 * 2️⃣ **מפרקת את תוכן הטבלה לשורות `<tr>` ולתאים `<td>`**.
 * 3️⃣ **מבצעת ניקוי והמרת נתונים עם `cleanText` ו-`htmlDecode`**.
 * 4️⃣ **מתחילה לקרוא נתונים רק מהשורה שבה מופיעה הכותרת "תאריך הפנייה"**.
 * 5️⃣ **יוצרת מערכים של `headers` (כותרות עמודות) ו- `values` (ערכי נתונים)**.
 * 6️⃣ **אם נמצאה טבלה תקינה – מחזירה את הנתונים בפורמט מוכן לעיבוד נוסף**.
 *
 * 📌 **שיפור הדיוק בקריאת הנתונים מהמיילים ושמירה על תקינות המבנה**.
 *
 * @param {string} html - גוף המייל בפורמט HTML.
 * @return {Object} אובייקט עם כותרות (`headers`) ונתונים (`values`).
 */
function parseHtmlTable(html) {
    Logger.log("📩 התחלת ניתוח טבלה בגוף המייל...");

    // 🔹 שליפת טבלת HTML מתוך גוף המייל
    const tableMatch = html.match(/<table.*?>([\s\S]*?)<\/table>/);
    if (!tableMatch) {
        Logger.log("⚠️ לא נמצאה טבלה בגוף המייל.");
        return { headers: [], values: [] };
    }

    Logger.log("✅ נמצאה טבלה במייל, מתחילים פירוק...");

    const tableHtml = tableMatch[0];
    try {
        // 🔹 שליפת כל השורות בטבלה
        const rows = tableHtml.match(/<tr.*?>([\s\S]*?)<\/tr>/g);
        if (!rows) {
            Logger.log("⚠️ לא נמצאו שורות בטבלה.");
            return { headers: [], values: [] };
        }

        let headers = [];
        let values = [];
        let startReading = false; // ✅ מתחילים לקרוא רק אחרי שמוצאים "תאריך הפנייה"

        rows.forEach((rowHtml, rowIndex) => {
            // 🔹 שליפת כל התאים `<td>` בתוך השורה
            const cells = rowHtml.match(/<td.*?>([\s\S]*?)<\/td>/g);
            if (!cells || cells.length < 2) {
                Logger.log(`⚠️ שורה ${rowIndex + 1} אינה מכילה מספיק תאים, מדלגים.`);
                return;
            }

            // 🔹 ניקוי הנתונים מהתאים באמצעות cleanText ו- htmlDecode
            const headerText = cleanText(htmlDecode(cells[0].replace(/<.*?>/g, "").trim()));
            const valueText = cleanText(htmlDecode(cells[1].replace(/<.*?>/g, "").trim()));

            // 🔹 מחכים עד שנגיע לשורת "תאריך הפנייה"
            if (!startReading && headerText === "תאריך הפנייה") {
                Logger.log("🔹 זוהתה שורת 'תאריך הפנייה' - מתחילים לקרוא נתונים.");
                startReading = true;
            }

            // ✅ אם מצאנו את "תאריך הפנייה", נכניס נתונים למערכים
            if (startReading) {
                headers.push(headerText);
                values.push(valueText);
            }
        });

        // 🔹 אם לא נמצאו נתונים, מחזירים אובייקט ריק
        if (headers.length === 0 || values.length === 0) {
            Logger.log("⚠️ לאחר שורת 'תאריך הפנייה' לא נמצאו נתונים.");
            return { headers: [], values: [] };
        }

        Logger.log("✅ הטבלה פורקה בהצלחה!");
        return { headers, values };

    } catch (error) {
        Logger.log(`❌ שגיאה בפירוק הטבלה: ${error.message}`);
        return { headers: [], values: [] };
    }
}


/**
 * 🔍 מנקה טקסט שהתקבל ממיילים על ידי הסרת רווחים מיותרים ותווים מיוחדים.
 *
 * 🚀 **תהליך העבודה:**
 * 1️⃣ **מסיר רווחים מיותרים בתחילת ובסוף המחרוזת**.
 * 2️⃣ **הסרת רצפים של רווחים כפולים בתוך הטקסט**.
 * 3️⃣ **המרת ישויות HTML (כגון `&nbsp;` או `&amp;`) לתווים רגילים**.
 * 4️⃣ **שימוש ב-`htmlDecode` להמרת תווים מקודדים**.
 * 
 * 📌 **שיפור הדיוק בקריאת הנתונים ממיילים, תוך שמירה על מבנה הנתונים הנכון**.
 *
 * @param {string} text - הטקסט לניקוי.
 * @return {string} הטקסט הנקי.
 */
function cleanText(text) {
    if (!text || typeof text !== "string") return "";

    return htmlDecode(text) // ממיר ישויות HTML
        .replace(/\s+/g, " ") // מחליף רצפי רווחים ברווח בודד
        .trim(); // מסיר רווחים מיותרים מסביב למחרוזת
}


/**
 * 🔄 ממיר ישויות HTML לטקסט רגיל.
 *
 * 🚀 **תהליך העבודה:**
 * 1️⃣ **ממיר תווים מיוחדים מקודדים (כגון `&amp;`, `&lt;`, `&gt;`) לתווים רגילים**.
 * 2️⃣ **מאפשר קריאה ברורה של טקסט HTML שהגיע מהמייל**.
 *
 * 📌 **חיוני לפענוח נתונים שנשלפים מטבלאות HTML בגוף המייל**.
 *
 * @param {string} input - הטקסט המקודד.
 * @return {string} הטקסט לאחר פענוח.
 */
function htmlDecode(input) {
    if (!input || typeof input !== "string") return "";

    const tempElement = HtmlService.createHtmlOutput(input).getContent();
    return tempElement
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

