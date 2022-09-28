if (location.search.includes("welcome=1")) {
  document.getElementById("body_welcome").hidden = false;
  document.getElementById("body_title").hidden = true;
}

[
  "head_title",
  "body_welcome",
  "body_title",
  "body_text_p1",
  "body_text_p2",
  "body_farewell",
].map((id) => {
  document.getElementById(id).innerText = chrome.i18n.getMessage(id);
});
