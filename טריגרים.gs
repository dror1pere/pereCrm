/**
 * מופעל בכל פתיחת חוברת עבודה כדי לוודא שכל הנתונים הקריטיים נטענים מראש.
 */
function onOpen() {
  Logger.log("📂 פתיחת חוברת העבודה - טוען את כל הקאשים.");
  ensureAllCachesLoaded();
}

