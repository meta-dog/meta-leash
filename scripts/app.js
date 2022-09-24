let retriesLeft = 100;

const API_BASE_URL = "https://meta-bones.herokuapp.com/api/app";

function getIdFromUrl() {
  const url = location.pathname;
  const appId = url.match(/\/(?:rift|quest)\/(?<id>[0-9]+)/);
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
  const text = clone.firstChild.lastChild;
  text.innerText = "Get 25% Discount!";
  const setBaseColor = () => (text.style = "color: #0880fa;");
  const setHoverColor = () => (text.style = "color: #fff;");
  setBaseColor();
  text.addEventListener("mouseover", setHoverColor);
  text.addEventListener("mouseout", setBaseColor);
  const container = clone.firstChild;
  container.addEventListener("mouseover", setHoverColor);
  container.addEventListener("mouseout", setBaseColor);
}

function appendDiscountChildToMenu(purchaseContextMenu, referralUrl) {
  const contextMenuItemClone = purchaseContextMenu.firstChild.cloneNode(true);
  purchaseContextMenu.appendChild(contextMenuItemClone);

  addClickEventToClone(contextMenuItemClone, referralUrl);
  addStylesToClone(contextMenuItemClone);
}

function getPurchaseMenus() {
  return document.getElementsByClassName(
    "app-purchase__detail app-purchase__context-menu"
  );
}

function getOwnsApp() {
  return document.getElementsByClassName("app-purchase-button").length === 0;
}

function retryAppendDiscounts(referralUrl) {
  const purchaseContextMenus = getPurchaseMenus();
  if (purchaseContextMenus.length > 0) {
    if (getOwnsApp()) return;

    [...purchaseContextMenus].forEach((menu) =>
      appendDiscountChildToMenu(menu, referralUrl)
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
