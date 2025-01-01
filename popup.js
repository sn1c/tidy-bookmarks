document.addEventListener("DOMContentLoaded", async () => {
    const daysInput = document.getElementById("days");
    const statusText = document.getElementById("status");

    const storage = await browser.storage.local.get("intervalDays");
    if (storage.intervalDays) {
        daysInput.value = storage.intervalDays;
    }

    document.getElementById("save-button").addEventListener("click", async () => {
        const days = parseInt(daysInput.value, 10);

        if (!isNaN(days) && days > 0) {
            await browser.storage.local.set({ intervalDays: days });
            statusText.textContent = `Settings saved! Deleting bookmarks older than ${days} days.`;
        } else {
            statusText.textContent = "Please enter a valid number of days.";
        }
    });
});
