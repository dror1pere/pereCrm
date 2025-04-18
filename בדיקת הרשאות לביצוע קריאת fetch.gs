function testExternalRequest() {
  try {
    var response = UrlFetchApp.fetch("https://www.google.com");
    Logger.log("Success: " + response.getResponseCode());
  } catch (error) {
    Logger.log("Error: " + error.message);
  }
}