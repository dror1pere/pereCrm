function fetchAndSortGoogleContacts() {
    try {
        Logger.log("📥 שליפת כל אנשי הקשר מ-Google People API...");
        
        var url = "https://people.googleapis.com/v1/people/me/connections" +
                  "?personFields=names,emailAddresses,phoneNumbers,metadata" +
                  "&pageSize=100"; // מגבלת דיפולט היא 100
        
        var options = {
            method: "GET",
            headers: {
                Authorization: "Bearer " + ScriptApp.getOAuthToken()
            },
            muteHttpExceptions: true
        };

        var contacts = [];
        var nextPageToken = null;

        // לולאה לשליפת כל אנשי הקשר (100 בכל עמוד)
        do {
            var response = UrlFetchApp.fetch(url + (nextPageToken ? "&pageToken=" + nextPageToken : ""), options);
            var data = JSON.parse(response.getContentText());

            if (data.connections) {
                data.connections.forEach(contact => {
                    var name = contact.names ? contact.names[0].displayName : "לא ידוע";
                    var email = contact.emailAddresses ? contact.emailAddresses[0].value : "אין דוא״ל";
                    var phone = contact.phoneNumbers ? contact.phoneNumbers[0].value : "אין טלפון";

                    // שליפת תאריכי יצירה ועדכון
                    var createdTime = null;
                    var updatedTime = null;

                    if (contact.metadata && contact.metadata.sources) {
                        contact.metadata.sources.forEach(source => {
                            if (source.type === "CONTACT") {
                                if (source.createTime) createdTime = new Date(source.createTime);
                                if (source.updateTime) updatedTime = new Date(source.updateTime);
                            }
                        });
                    }

                    // אם אין תאריך עדכון, נשתמש בתאריך יצירה
                    if (!updatedTime && createdTime) {
                        updatedTime = createdTime;
                    }

                    contacts.push([name, email, phone, createdTime, updatedTime]);
                });
            }

            // מעבר לעמוד הבא אם קיים
            nextPageToken = data.nextPageToken || null;

        } while (nextPageToken);

        // מיון אנשי קשר לפי **תאריך עדכון** (בסדר יורד - מהחדש לישן)
        contacts.sort((a, b) => new Date(b[4]) - new Date(a[4]));

        // הכנסת הנתונים לגיליון Google Sheets
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("אנשי קשר") || 
                    SpreadsheetApp.getActiveSpreadsheet().insertSheet("אנשי קשר");
        sheet.clear(); // מחיקת נתונים קודמים

        sheet.appendRow(["שם", "דוא״ל", "טלפון", "תאריך יצירה", "תאריך עדכון"]);
        if (contacts.length > 0) {
            sheet.getRange(2, 1, contacts.length, contacts[0].length).setValues(contacts);
        }

        Logger.log(`✅ ${contacts.length} אנשי קשר נטענו ומוינו לפי **תאריך עדכון** בהצלחה!`);

    } catch (error) {
        Logger.log("❌ שגיאה בשליפת אנשי קשר: " + error.message);
    }
}
