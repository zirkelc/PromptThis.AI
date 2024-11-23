function closeSidepanel() {
    chrome.runtime.sendMessage({
        action: "resetSidepanel",
    }, () => window.close());
}

export { closeSidepanel as c };
//# sourceMappingURL=sidepanel-58eTr2jr.js.map
