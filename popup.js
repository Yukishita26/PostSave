window.addEventListener('load', () => {
    console.log('popup:load');
    // background.js へのメッセージ
    //chrome.runtime.sendMessage("Action");
    // content.js へのメッセージ
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var res = chrome.tabs.sendMessage(tabs[0].id, "URL");
        res
            .then((response) => {
                //console.log(`chrome.tabs.query: ${response}`);
            })
            .catch((error) => {
                console.log(`Error in chrome.tabs.query: ${error}`);
            })
    });
    window.close();
})
