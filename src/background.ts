import { Item } from './types';

function setBadge(value: number) {
    if (value === 0) {
        chrome.browserAction.setBadgeText({ text: '' });
    } else {
        chrome.browserAction.setBadgeText({ text: String(value) });
        if (chrome.browserAction.setBadgeTextColor) {
            chrome.browserAction.setBadgeTextColor({ color: '#ffffff' });
        }
        chrome.browserAction.setBadgeBackgroundColor({ color: '#ff0000' });
    }
}

chrome.storage.local.get(['items'], (storedItems) => {
    const safeStoredItems = storedItems.items as Item[];
    const itemsCount = safeStoredItems.filter(item => !item.archived).length - 1;
    setBadge(itemsCount);
});

chrome.storage.onChanged.addListener((event) => {
    const safeStoredItems = event.items.newValue as Item[];
    const itemsCount = safeStoredItems.filter(item => !item.archived).length - 1;
    setBadge(itemsCount);
});
