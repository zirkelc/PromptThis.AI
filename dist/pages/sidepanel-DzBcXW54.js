function closeSidepanel() {
    console.log('closeSidepanel');
    chrome.runtime.sendMessage({
        action: 'resetSidepanel',
    }, () => window.close());
}

export { closeSidepanel as c };
//# sourceMappingURL=sidepanel-DzBcXW54.js.map
