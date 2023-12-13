let contents = document.querySelector(`div[id="contents"]`);
chrome.storage.local.get().then((result) => {
    console.log(result);
    contents.innerHTML = data_format(result);
    console.log(JSON.stringify(result, null, "  "))
})

function data_format(result){
    const tweets = result.tweets;
    const users = result.users;
    let str = [`last update: ${result.last_update}`];
    Object.entries(tweets).forEach(([id, tweet_stat], _)=>{
        str.push("<h2>@"+users[tweet_stat.screenname].name+"</h2>");
        str.push(("<p>" + tweet_stat.text + "</p>").replace("\n", "<br>"));
    })
    let json = JSON.stringify(result, null, "  ")
    str.push("<pre><code>" + json + "</code></pre>");
    return str.join("\n");
}