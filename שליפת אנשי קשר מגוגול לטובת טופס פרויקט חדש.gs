/**
 * שולף את רשימת אנשי הקשר של הלקוח מתוך Google People API.
 * מחזיר גם את איש הקשר ברירת המחדל מתוך טבלת הלקוחות.
 *
 * @param {string} customerName - שם הלקוח כפי שנבחר בטופס.
 * @returns {Object} רשימה של אנשי קשר + איש הקשר ברירת מחדל.
 */
function getCustomerContacts(customerName) {
  
  try {
    Logger.log(`📡 שליפת אנשי קשר מגוגל עבור הלקוח: ${customerName}`);

    if (!customerName) {
      throw new Error("❌ שם הלקוח לא סופק");
    }

    var url = "https://people.googleapis.com/v1/people/me/connections" +
              "?personFields=names,emailAddresses,phoneNumbers,organizations" +
              "&pageSize=200"; // עד 200 אנשי קשר בכל עמוד
    
    var options = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken()
      },
      muteHttpExceptions: true
    };

    var contacts = [];
    var nextPageToken = null;

    // קריאה ללולאה שתשלוף את כל אנשי הקשר הרלוונטיים
    do {
      var response = UrlFetchApp.fetch(url + (nextPageToken ? "&pageToken=" + nextPageToken : ""), options);
      var data = JSON.parse(response.getContentText());

      if (data.connections) {
        data.connections.forEach(contact => {
          var name = contact.names ? contact.names[0].displayName : "לא ידוע";
          var email = contact.emailAddresses ? contact.emailAddresses[0].value : "";
          var phone = contact.phoneNumbers ? contact.phoneNumbers[0].value : "";
          var company = (contact.organizations && contact.organizations[0].name) ? contact.organizations[0].name : "";

          // רק אם שם החברה מתאים ללקוח שנבחר
          if (company === customerName) {
            contacts.push({ name: name, phone: phone, email: email });
          }
        });
      }

      // בדיקה האם יש דף נוסף להמשך שליפה
      nextPageToken = data.nextPageToken || null;

    } while (nextPageToken);

    Logger.log(`✅ נמצאו ${contacts.length} אנשי קשר ללקוח '${customerName}'`);

    // בדיקת איש הקשר הראשי בטבלת הלקוחות
    var mainContact = getMainContactForCustomer(customerName);
    
    return {
      mainContact: mainContact || null, // ברירת מחדל
      contacts: contacts // כל אנשי הקשר הרלוונטיים
    };

  } catch (error) {
    Logger.log("❌ שגיאה בשליפת אנשי קשר: " + error);
    return { mainContact: null, contacts: [] };
  }
}

function getMainContactForCustomer(customerName) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("לקוחות");
    if (!sheet) throw new Error("❌ גיליון 'לקוחות' לא נמצא");

    var headerRow = getHeaderRow();
    var columnIndex = getColumnIndex("לקוחות", "איש קשר");

    if (!columnIndex) throw new Error("❌ לא נמצאה עמודת 'איש קשר' בגיליון 'לקוחות'");

    var data = sheet.getDataRange().getValues();

    for (var i = headerRow; i < data.length; i++) {
      if (data[i][0] === customerName) { // בהנחה שהלקוח נמצא בעמודה הראשונה
        return data[i][columnIndex]; // מחזיר את איש הקשר הראשי
      }
    }

    return null; // אם לא נמצא איש קשר ראשי
  } catch (error) {
    Logger.log("❌ שגיאה בשליפת איש הקשר הראשי: " + error);
    return null;
  }
}

