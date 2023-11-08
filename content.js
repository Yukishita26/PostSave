/* TODO
* 動画はGIFなど埋め込まれないものしかできない
* 画像のセンシティブ判定の有無
* 絵文字の取得
* リンクカードの内容データ取得
* エラーハンドリングを丁寧に
*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request !== 'URL') return;
    console.log("content-script:URL");
    var url = document.location.href;    
    var data = {
        "url": url,
        "url_id": get_url_id(),
        "access_date": new Date().toISOString(),
        "tweets": getTweets(),
    }
    var jsonString = JSON.stringify(data);
    console.log(`donload: ${jsonString}`);
    download_text(jsonString, `tweet_${data["url_id"]}.json`);
})


function download_text(text, file_name){
    var blob = new Blob([text], { type: 'text/plain' });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file_name;
    link.click();
}

function get_url_id(){
    const url = location.href;
    const url_id = url.split("/")[url.split("/").length - 1];
    return url_id;
}

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
        const card = get_card(tweet);
        const text = (card=="")? get_text(tweet): `${get_text(tweet)} ${card}`;
        return {
            "id": get_id(tweet),
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

function getTweets(){
    let result = [];
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    const url_id = get_url_id();
    Array.from(tweets).forEach((tweet)=>{
        const tweet_stat = getTweetStats(tweet);
        console.log(tweet_stat.id, url_id);
        result.push(tweet_stat);
    })
    return result;
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

function unique(arr){
    if(!arr) return []
    return [...(new Set(arr))]
}
