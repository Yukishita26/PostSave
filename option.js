setting_extract();
contents_extract();

/*
tags = {
    tag: "tag-text",
    default?: true,
    short?: "T",
    alias?: null
}
*/

function setting_extract(){
    document.querySelector("#tag-update").addEventListener("click", update_tag_settings);
    show_tag_settings();
}

function show_tag_settings(){
    let tag_table = document.querySelector("#tag-table");
    chrome.storage.local.get(["tags"]).then((result) => {
        tags = (result.tags ?? []).sort((a, b) => {
            let ad = a.default ?? false;
            let bd = b.default ?? false;
            if (ad !== bd) {
                return bd- ad;
            }
            return a.tag.localeCompare(b.tag);
        });
        let strs = [`<tbody><tr><th>Tag</th><th>default</th><th>short</th><th>alias</th></tr>`]
        tags.forEach(tag=>{
            let name = tag.tag;
            strs.push(`<tr>
    <td id="tag-text-${name}"><input type="text" size="8" value="${name}"></td>
    <td id="tag-default-${name}"><input type="button" class="tag-def-check-btn-${(tag.default)? "true": "false"}" value="${(tag.default)? "v": "^"}" id="tag-def-check-${name}"></td>
    <td id="tag-short-${name}"><input type="text" size="8" value="${tag.short ?? ""}"></td>
    <td id="tag-alias-${name}"><input type="text" size="8" value="${tag.alias ?? ""}"></td>
</tr>`);
        });
        strs.push(`<tr>
    <td id="tag-text-new"><input type="text" size="8" value=""></td>
    <td id="tag-default-new"><input type="button" class="tag-def-check-btn-false" value="^" id="tag-def-check-new"></td>
    <td id="tag-short-new"><input type="text" size="8" value=""></td>
    <td id="tag-alias-new"><input type="text" size="8" value=""></td>
</tr>`);
        strs.push("</tbody>");
        tag_table.innerHTML = strs.join("\n");
        [...tag_table.querySelectorAll(`input[type="button"]`)].forEach(btn=>btn.addEventListener("click", toggle_button));
    });
}

function toggle_button(event){
    let btn = event.target;
    if(btn.className==="tag-def-check-btn-true"){
        btn.value = "^";
        btn.className = "tag-def-check-btn-false";
    }else if(btn.className==="tag-def-check-btn-false"){
        btn.value = "v";
        btn.className = "tag-def-check-btn-false";
    }
}

function update_tag_settings(){
    let tag_table = document.querySelector("#tag-table");
    let tags = [];
    [...tag_table.querySelectorAll("tr")].forEach(row => {
        let cols = row.querySelectorAll("td");
        if(cols.length===4){
            console.log(cols);
            let tag = {tag: cols[0].firstChild.value};
            if(cols[1].firstChild.className==="tag-def-check-btn-true")
                tag.default = true;
            if(cols[2].firstChild.value!="")
                tag.short = cols[2].firstChild.value;
            if(cols[3].firstChild.value!="")
                tag.alias = cols[3].firstChild.value;
            if(tag.tag!="")
                tags.push(tag);
        }else if(cols.length!=0){
            console.log("Warning: unexpected table");
        }
    });
    console.log(tags);
    let tt = {"tags": tags};
    chrome.storage.local.set(tt);
}

function contents_extract(){
    let contents = document.querySelector("#contents");
    chrome.storage.local.get().then((result) => {
        console.log(result);
        contents.innerHTML = data_format(result);
        console.log(JSON.stringify(result, null, "  "))
    });
}

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