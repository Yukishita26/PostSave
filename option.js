setting_extract();
contents_extract();

console.log(`function addCSS(css, id=""){
var st = document.createElement('style');
if(id!="") st.setAttribute("id", id);
st.appendChild(document.createTextNode(css));
document.getElementsByTagName('head')[0].appendChild(st);
}
addCSS(\`span{border: solid 1px red; position: relative;}
span::after{content: "span:" attr(class); font-size:0.6em; color:gray; padding-left: 1em; position: absolute; top 0; left 0}
div{border: solid 1px red;}
div::after{content: "div:" attr(class); font-size:0.6em; color:gray; padding-left: 1em}\`,
"grouping-style")
`)

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
    chrome.storage.local.get().then(result => {
        let hidden = document.querySelector("#hidden-string");
        hidden.textContent = JSON.stringify(result);
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
        //console.log(result);
        contents.innerHTML = data_format(result);
        //console.log(JSON.stringify(result, null, "  "))
    });
}

function data_format(result){
    const actions = result.actions; // [{datetime: time_str, id: str, tag: str}]
    const tweets = result.tweets;   // {id: {...}}
    const users = result.users;     // {screenname: {...}}
    let entities = {};
    actions.forEach((action, id) => {
        if(action.id in entities){
            entities[action.id].last_update = Math.max(entities[action.id].last_update, Date.parse(action.datetime));
            entities[action.id].tags.push(action);
        }else{
            entities[action.id] = {
                id: action.id,
                last_update: Date.parse(action.datetime),
                tags: [action]
            };
        }
    });
    let o_ent = Object.entries(entities).map(([key, val], _) => val); //[{id:str, last_update:time, tags:[action]}]
    o_ent.sort((a, b) => -(a.last_update - b.last_update)); //降順
    console.log(o_ent);

    let strs = [`<p>last update: ${result.last_update}</p>`];
    // all actions
    o_ent.forEach(entity => {
        const tweet = tweets[entity.id];
        const user = users[tweet.screenname];
        //strs.push(`<p><span>#${action.tag}</span></p>`);
        strs = strs.concat(tweet_unit(tweet, user, entity.tags));
    });
    /*
    Object.entries(actions).reverse().forEach(([id, action], _)=>{
        const tweet = tweets[action.id];
        const user = users[tweet.screenname];
        strs.push(`<p><span>#${action.tag}</span></p>`)
        strs = strs.concat(tweet_unit(tweet, user));
    });
    */
    // all tweets
    strs.push(`<details><summary>All Tweets</summary>`);
    Object.entries(tweets).forEach(([id, tweet], _)=>{
        const user = users[tweet.screenname];
        //strs = strs.concat(tweet_unit(tweet, user));
    })
    strs.push(`</details>`);
    // raw data
    strs.push(`<details><summary>Raw data</summary>`);
    let json = JSON.stringify(result, null, "  ")
    strs.push("<pre><code>" + json + "</code></pre>");
    strs.push(`</details>`);

    return strs.join("\n");
}

/*
function md_link_replace(str){
    str.match(/\[([^\]]+?)\]\(([^)]+?)\)/g).map()
    // gで[...](...)を検索，それぞれgなしでgroupを取って置換後文字列を作成，replaceをそれぞれやる
}
*/

function tweet_unit(tweet, user, tags){
    let strs = [];
    strs.push(`<div class="tweet"><dl>`)
    // user state
    strs.push(`<dt>`);
    const icon_src = user.icon//.replace("_normal", "_bigger");
    strs.push(`<span class="tweet-user-icon"><img src="${icon_src}" class="user-icon"></span> `);
    strs.push(`<span class="tweet-user-name">${user.name}</span> `);
    strs.push(`<span class="tweet-user-screenname"><a href="https://twitter.com/${user.screenname}">@${user.screenname}</a></span>`);
    strs.push(`</dt>`);
    // tags
    strs.push(`<dd><span class="tweet-tags">tags: `);
    tags.forEach(action => {
        strs.push(`<span class="tweet-tag">#${action.tag}</span>`);
    })
    strs.push(`</span></dd>`);
    // tweet text
    let text = `${tweet.text}`.replace("\n", "<br>");
    //const md_link_match = /\[([^\]]+?)\]\(([^)]+?)\)/;
    //let text = `${tweet.text_md}`.replace("\n", "<br>").replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, "");
    strs.push(`<dd><span class="tweet-text">${text}</span></dd>`);
    tweet.card?.forEach((link) => {
        strs.push(`<dd><span class="tweet-card">Card: <a href="https://twitter.com/${link}">${link}</a></span></dd>`);
    });
    if("quote" in tweet){
        strs.push(`<dd><blockquote class="tweet-quote">`);
        strs.push(`<p>${tweet.quote.name} <a href="https://twitter.com/${tweet.quote.screenname}">@${tweet.quote.screenname}</a></p>`);
        strs.push(`<p>${tweet.quote.text.replace("\n", "<br>")}</a></p>`);
        strs.push(`</blockquote></dd>`);
    }
    if("photos" in tweet){
        strs.push(`<dd><div class="tweet-media">`)
        tweet.photos.forEach((photo_src)=>{
            let photo = `<img src="${photo_src.replace("name=small", "name=orig")}" class="tweet-image">`
            strs.push(photo);
        })
        strs.push("</div></dd>")
    }
    strs.push(`<dd><span class="tweet-time"><a href="https://twitter.com${tweet.url}">${tweet.time}</a></span></dd>`);
    strs.push("</div></dl>")
    return strs;
}