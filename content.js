/* TODO
* 動画はGIFなど埋め込まれないものしかできない
* 画像のセンシティブ判定の有無
* 絵文字の取得
* リンクカードの内容データ取得
* エラーハンドリングを丁寧に
*/

function get_set(key, v){
    chrome.storage.local.get(key).then((result) => {
        let val = result[key] ?? 0;
        console.log("Value currently is " + val);
        val += v;
        let obj = {};
        obj[key] = val;
        chrome.storage.local.set(obj).then(()=>{
            console.log("Value is set to " + val);
        });
    })
}

function update_tweet_list(data){
    // storageにデータ保存
    chrome.storage.local.get(["tweets", "users", "last_update", "actions"]).then((result) => {
        let tw_dict = result.tweets ?? {};
        let usr_dict = result.users ?? {};
        data.tweets.forEach((tweet) => {
            if(tweet.tweet.id in tw_dict){
                // update
            }else{
                tw_dict[tweet.tweet.id] = tweet.tweet;
            }
            if(tweet.user.screenname in usr_dict){
                // update
            }else{
                usr_dict[tweet.user.screenname] = tweet.user;
            }
        })

        let obj = {
            tweets: tw_dict,
            users: usr_dict,
            last_update: data.access_date,
            actions: (result.actions ?? []).concat(data.actions ?? [])
        };
        chrome.storage.local.set(obj).then(()=>{
            console.log("Values:");
            console.log(obj);
        });
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 拡張ボタンをクリックしたときの動作
    if (request !== 'URL') return;
    console.log("content-script:URL");
    var url = document.location.href;    
    var data = {
        actions: [],
        url: url,
        url_id: get_url_id(),
        access_date: new Date().toISOString(),
        tweets: getAllTweets(),
    }
    update_tweet_list(data);
    var jsonString = JSON.stringify(data);
    console.log(`donload: ${jsonString}`);
    download_text(jsonString, `tweet_${data["url_id"]}.json`);
});

window.addEventListener("load", setOnLoad, false);

let onLoadIntervalId = undefined;
function setOnLoad(){
    console.log("onload start");
    onLoadIntervalId = setInterval(waching_articles, 1000);
};

let article_length = undefined;
let article_last_id = undefined;
function waching_articles(){
    //console.log("watching...", article_length, article_last_id);
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    //console.log(tweets);
    if(tweets.length === article_length) return;
    article_length = tweets.length;
    if(get_tweet_id(tweets[tweets.length - 1]) === article_last_id) return;
    article_last_id = get_tweet_id(tweets[tweets.length - 1]);
    [...tweets].forEach((tweet) => {
        if(tweet.querySelector(`input[class="save-button"]`) === null){
            const tweet_id = get_tweet_id(tweet);
            console.log(tweet_id + " button added.");
            addButotns(tweet, tweet_id);
        }
    });
}


function download_text(text, file_name){
    var blob = new Blob([text], { type: 'text/plain' });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file_name;
    link.click();
}

function get_url_id(){
    const url = location.href;
    const url_id = url.split("/").slice(-1)[0];
    return url_id;
}

function get_parent_element(elem, targetTag){
    while(elem){
        if(elem.tagName === targetTag)
            break;
        elem = elem.parentElement;
    }
    if(elem.tagName != targetTag) return undefined;
    return elem;
}

/*
const get_names = (tweet) => {
    var names = tweet.querySelector('div[data-testid="User-Name"]')?.textContent.split("·")[0].split("@");
    switch(names?.length){
        case 2: return names;
        case 1: return [names[0], undefined];
        default: return [undefined, undefined]
    }
}
const get_text = (tweet) => tweet.querySelector('div[data-testid="tweetText"]')?.textContent;
const get_photos = (tweet) => Array.from(tweet.querySelectorAll('div[data-testid="tweetPhoto"]')).map((photo)=>photo?.querySelector('img,video')?.getAttribute("src"));
const get_card = (tweet) => unique(Array.from(tweet.querySelector('div[data-testid="card.wrapper"]')?.querySelectorAll("a") ?? []).map((a)=>a?.getAttribute("href"))).join(", ");
const get_time = (tweet) => tweet.querySelector('time')?.getAttribute("datetime");
const get_id = (tweet) => tweet.querySelector('time')?.parentElement.getAttribute("href")?.split("/").slice(-1)[0];
const get_ids = (tweet) => {
    const url = tweet.querySelector('time')?.parentElement.getAttribute("href");
    return [url, url?.split("/".slice(-1)[0])];
};
const get_icon = (tweet) => tweet.querySelector('div[data-testid="Tweet-User-Avatar"]')?.querySelector('img')?.getAttribute("src");
const get_reply = (tweet) => parseInt(tweet.querySelector('[data-testid="reply"]')?.getAttribute("aria-label").split(" ")[0]);
const get_retweet = (tweet) => parseInt(tweet.querySelector('[data-testid="retweet"]')?.getAttribute("aria-label").split(" ")[0]);
const get_like = (tweet) => parseInt(tweet.querySelector('[data-testid="like"]')?.getAttribute("aria-label").split(" ")[0]);
const get_bookmark = (tweet) => parseInt(tweet.querySelector('[data-testid="bookmark"]')?.getAttribute("aria-label").split(" ")[0]);

const get_quote = (tweet) => {
    const quote = tweet.querySelectorAll(`div[role="link"]`);
    if(quote.length==0) return {};
    const sub_tweet = quote[0].firstChild;
    const [sub_name, sub_screenname] = get_names(sub_tweet);
    return {
        "icon": get_icon(sub_tweet),
        "screenname": sub_screenname,
        "name": sub_name,
        "text": get_text(sub_tweet),
        "time": get_time(sub_tweet),
    }
}

function getTweetStats(tweet){
    try{
        const [name, screenname] = get_names(tweet);
        const [url, id] = get_ids(tweet);
        const card = get_card(tweet);
        const text = (card=="")? get_text(tweet): `${get_text(tweet)} ${card}`;
        return {
            "url": url,
            "id": id,
            "icon": get_icon(tweet),
            "screenname": screenname,
            "name": name,
            "text": text,
            "photo": get_photos(tweet),
            "quote": get_quote(tweet),
            "time": get_time(tweet),
            "reply": get_reply(tweet),
            "retweet": get_retweet(tweet),
            "like": get_like(tweet),
            "bookmark": get_bookmark(tweet)};
    } catch(err){
        return {
            "error": err.toString()
        };
    }
}

function unique(arr){
    if(!arr) return []
    return [...(new Set(arr))]
}
*/

function getAllTweets(){
    let result = [];
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    const url_id = get_url_id();
    Array.from(tweets).forEach((tweet)=>{
        const tweet_stat = getTweetStats(tweet);
        console.log(tweet_stat.tweet.id, url_id);
        result.push(tweet_stat);
    })
    return result;
}

let tags = [
    {key:"test", value:"T"},
    {key:"usefull", value:"🎓"},
    {key:"book", value:"📚"},
    {key:"like", value:"❤"},
    {key:"warning", value:"⚠"},
    {key:"r18", value:"🔞"}
]
function addButotns(article, id){
    const group = article.querySelector('[data-testid="retweet"]')?.parentElement?.parentElement?.parentElement?.parentElement
    let div = document.createElement("div")
    div.setAttribute("class", "test-input-area");
    let buttons = []
    tags.forEach((tag)=>{
        buttons.push(`<span class="save-button-span"><input type="button" class="save-button" value="${tag.value}" tagKey="${tag.key}" id="test-btn-${tag.key}"></span>`)
    })
    div.innerHTML = buttons.join("");
    [...div.querySelectorAll("input")].forEach((input)=>{
        input.addEventListener('click', eachButtonClicked);
    });
    group.after(div);
}

function eachButtonClicked(event){
    const btn = event.target;
    const tweet = get_parent_element(btn, 'ARTICLE');
    const tweet_stat = getTweetStats(tweet);
    console.log(tweet_stat);
    
    const url = document.location.href;    
    const datetime = new Date().toISOString();
    const data = {
        actions: [{
            tag: btn.getAttribute("tagKey"),
            datetime: datetime,
            id: tweet_stat.tweet.id
        }],
        url: url,
        url_id: get_url_id(),
        access_date: datetime,
        tweets: [tweet_stat],
    }
    update_tweet_list(data);
}

function get_unknown_div(tweet){
    return Array.from(tweet.querySelectorAll('div[data-testid]')).map((div)=>div.getAttribute("data-testid"))
        .filter((testid)=>
            !(["User-Name", "caret", "tweetText", "tweetPhoto", "Tweet-User-Avatar",
                "reply", "retweet", "like", "bookmark"].includes(testid) ||
                testid.includes("card") ||
                testid.includes("UserAvatar-Container"))
        );
}
