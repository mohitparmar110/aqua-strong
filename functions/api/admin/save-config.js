async function saveConfig() {
    if (!getToken()) {
        document.getElementById('token-modal').classList.remove('hidden');
        return;
    }

    collectAll(); // ✅ THIS WAS BROKEN

    document.getElementById('loading-overlay').style.display = 'flex';

    try {
        const res = await fetch("/api/admin/save-config", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + getToken(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cfg)
        });

        if (!res.ok) throw new Error();
        markDirty(false);
        showToast("PUBLISHED LIVE");

    } catch (e) {
        showToast("SYNC FAILED", true);
    } finally {
        document.getElementById('loading-overlay').style.display = 'none';
    }
}
