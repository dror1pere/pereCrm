/**
 * יוצר או מעדכן איש קשר באמצעות Google People API
 * @param {Object} formData - נתוני איש הקשר מהטופס
 */
function createContactWithPeopleAPI(formData) {
    try {
        Logger.log("📇 === יצירת/עדכון איש קשר באמצעות People API ===");

        if (!formData.contactName || !formData.customerName || !formData.contactEmail || !formData.contactPhone) {
            throw new Error("❌ חסרים נתונים נדרשים ליצירת איש קשר");
        }

        const contactGivenName = formData.contactName.split(" ")[0] || "";
        const contactFamilyName = formData.contactName.split(" ").slice(1).join(" ") || "";
        const companyName = formData.customerName;
        const contactPhone = formData.contactPhone;
        const contactEmail = formData.contactEmail;

        const resource = {
          names: [{ givenName: contactGivenName, familyName: contactFamilyName }],
          organizations: [{ name: companyName, type: "work" }], // ✅ נשמר רק שם החברה ללא "איש קשר"
          phoneNumbers: [{ value: contactPhone, type: "mobile" }],
          emailAddresses: [{ value: contactEmail, type: "work" }]
        };


        const url = "https://people.googleapis.com/v1/people:createContact";
        const options = {
            method: "POST",
            contentType: "application/json",
            headers: {
                Authorization: `Bearer ${ScriptApp.getOAuthToken()}`
            },
            payload: JSON.stringify(resource),
            muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(url, options);
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();

        Logger.log("📩 תגובת Google People API: " + responseText);

        if (responseCode !== 200) {
            throw new Error(`❌ שגיאה מה-API (סטטוס ${responseCode}): ${responseText}`);
        }

        const contactData = JSON.parse(responseText);
        if (!contactData.resourceName) {
            throw new Error("❌ תגובת ה-API לא כוללת resourceName של איש הקשר.");
        }

        Logger.log(`✅ איש הקשר נוצר בהצלחה עם resourceName: ${contactData.resourceName}`);
        return contactData.resourceName;

    } catch (error) {
        Logger.log(`❌ שגיאה ביצירת/עדכון איש קשר עם People API: ${error.message}`);
        return null; // לא מחזירים שגיאה כדי שהתהליך לא ייפסק
    }
}