function forceAuthRefresh() {
  ScriptApp.invalidateAuth();
  Logger.log("Auth tokens invalidated - run again to reauthorize.");
}
