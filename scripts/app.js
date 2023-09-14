let retriesLeft = 100;

const API_BASE_URL = "https://meta-dog.onrender.com/api/app";

function getIdFromUrl() {
  const url = location.pathname;
  const appId = url.match(
    /\/(?:rift|quest|experiences\/pcvr|experiences)\/(?<id>[0-9]+)/
  );
  return appId ? parseInt(appId.groups.id, 10) : -1;
}

async function getReferralUsernameFromId(id) {
  const apiUrl = `${API_BASE_URL}/${id}/referral`;
  try {
    const baseResponse = await fetch(apiUrl);
    const { advocate_id } = await baseResponse.json();
    if (advocate_id === undefined) throw new Error("Referral not found");
    return advocate_id;
  } catch (error) {
    throw error;
  }
}

const REFERRAL_BASE_URL = "https://www.oculus.com/appreferrals";

async function getReferralUrl() {
  const id = getIdFromUrl();
  if (id === -1) throw new Error("Not a valid store App page");
  try {
    const username = await getReferralUsernameFromId(id);
    return `${REFERRAL_BASE_URL}/${username}/${id}`;
  } catch (error) {
    throw error;
  }
}

function addClickEventToClone(clone, url) {
  clone.onclick = () => window.open(url, "_blank", "noreferrer");
}

function addStylesToClone(clone) {
  const text = clone;
  text.innerText = chrome.i18n.getMessage("discount_text");
  const setBaseColor = () => (text.style = "color: #0880fa; cursor: pointer;");
  const setHoverColor = () => (text.style = "color: #fff; cursor: pointer;");
  setBaseColor();
  text.addEventListener("mouseover", setHoverColor);
  text.addEventListener("mouseout", setBaseColor);
  const container = clone.firstChild;
  container.addEventListener("mouseover", setHoverColor);
  container.addEventListener("mouseout", setBaseColor);
}

function appendDiscountChildToPurchasePrice(
  purchasePriceContextMenu,
  referralUrl
) {
  const contextMenuItemClone =
    purchasePriceContextMenu.firstChild.cloneNode(true);
  purchasePriceContextMenu.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.lastChild.appendChild(
    contextMenuItemClone
  );

  addClickEventToClone(contextMenuItemClone, referralUrl);
  addStylesToClone(contextMenuItemClone);
}

function getPurchaseMenus() {
  return document.getElementsByClassName(
    "app-purchase__detail app-purchase__context-menu"
  );
}

function getAppPurchasePrice() {
  return [...document.getElementsByClassName("app-purchase-price")];
}

function appIsOwned() {
  return getAppPurchasePrice().every(
    (item) => item.innerText.match(/^\w+$/) !== null
  );
}

function retryAppendDiscounts(referralUrl) {
  if (!appIsOwned()) {
    getAppPurchasePrice().map((purchasePriceContextMenu) =>
      appendDiscountChildToPurchasePrice(purchasePriceContextMenu, referralUrl)
    );
    return;
  }

  if (retriesLeft === 1) return;

  retriesLeft -= 1;
  setTimeout(() => retryAppendDiscounts(referralUrl), 1000);
}

async function addDiscountIfAvailable() {
  try {
    const url = await getReferralUrl();
    setTimeout(() => retryAppendDiscounts(url), 1000);
  } catch (_) {}
}

(async () => addDiscountIfAvailable())();
