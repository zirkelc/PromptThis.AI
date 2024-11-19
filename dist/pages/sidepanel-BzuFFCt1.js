function closeSidepanel() {
    chrome.runtime.sendMessage({
        action: "resetSidepanel",
    }, () => window.close());
}

export { closeSidepanel as c };
//# sourceMappingURL=sidepanel-BzuFFCt1.js.map
