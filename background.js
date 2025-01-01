async function getUnnestedBookmarks(bookmarks) {
    const bookmarkIds = ['unfiled_____', 'mobile______'];

    let unnestedBookmarks = [];
    for (const bookmark of bookmarks) {
        if (bookmark.parentId == 'root________' && !bookmarkIds.includes(bookmark.id)) {
            continue;
        }

        if (bookmark.children) {
            const childBookmarks = await getUnnestedBookmarks(bookmark.children);
            unnestedBookmarks = unnestedBookmarks.concat(childBookmarks);
        } else {
            unnestedBookmarks.push(bookmark);
        }
    }
    return unnestedBookmarks;
}

async function deleteOldBookmarks(days) {
    const now = Date.now();
    const cutoffTime = now - days * 24 * 60 * 60 * 1000;

    const root = await browser.bookmarks.getTree();
    const unnestedBookmarks = await getUnnestedBookmarks(root);

    for (const bookmark of unnestedBookmarks) {
        if (bookmark.dateAdded && bookmark.dateAdded < cutoffTime) {
            await browser.bookmarks.remove(bookmark.id);
            console.log(`Deleted old bookmark: ${bookmark.title}`);
        }
    }
}

const DEFAULT_INTERVAL_DAYS = 30;

browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "deleteOldBookmarks") {
        const storage = await browser.storage.local.get("intervalDays");
        const days = storage.intervalDays || DEFAULT_INTERVAL_DAYS;

        deleteOldBookmarks(days);
    }
});

browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed. Setting up periodic alarm.");

    browser.alarms.create("deleteOldBookmarks", {
        delayInMinutes: 1,
        periodInMinutes: 60,
    });

    browser.storage.local.set({ intervalDays: DEFAULT_INTERVAL_DAYS });
});