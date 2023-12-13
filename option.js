let contents = document.querySelector(`div[id="contents"]`);
chrome.storage.local.get().then((result) => {
    console.log(result);
    contents.innerHTML = data_format(result);
    console.log(JSON.stringify(result, null, "  "))
})

function data_format(result){
    const actions = result.actions;
    const tweets = result.tweets;
    const users = result.users;
    let strs = [`<p>last update: ${result.last_update}</p>`];
    // all actions
    Object.entries(actions).reverse().forEach(([id, action], _)=>{
        const tweet = tweets[action.id];
        const user = users[tweet.screenname];
        strs.push(`<p><span>#${action.tag}</span></p>`)
        strs = strs.concat(tweet_unit(tweet, user));
    })
    // all tweets
    strs.push(`<details><summary>All Tweets</summary>`);
    Object.entries(tweets).forEach(([id, tweet], _)=>{
        const user = users[tweet.screenname];
        strs = strs.concat(tweet_unit(tweet, user));
    })
    strs.push(`</details>`);
    // raw data
    strs.push(`<details><summary>Raw data</summary>`);
    let json = JSON.stringify(result, null, "  ")
    strs.push("<pre><code>" + json + "</code></pre>");
    strs.push(`</details>`);

    return strs.join("\n");
}

function tweet_unit(tweet, user){
    let strs = [];
    strs.push("<dl>")
    strs.push(`<dt>`);
    strs.push(`<span><img src="${user.icon.replace("_normal", "_bigger")}" class="user-icon"></span> `);
    strs.push(`<span>${user.name}</span> `);
    strs.push(`<span><a href="https://twitter.com/${user.screenname}">@${user.screenname}</a></span>`);
    strs.push(`</dt>`);
    let text = `${tweet.text}`
    strs.push(`<dd>${text}</dd>`);
    if("photos" in tweet){
        strs.push("<dd>")
        tweet.photos.forEach((photo_src)=>{
            let photo = `<img src="${photo_src.replace("name=small", "name=orig")}" class="tweet-image">`
            strs.push(photo);
        })
        strs.push("</dd>")
    }
    strs.push(`<dd><a href="https://twitter.com${tweet.url}">${tweet.time}</a></dd>`);
    strs.push("</dl>")
    return strs;
}