// element操作
function add_alt_text(elem){
    try{
        let clone = elem.cloneNode(true);
        [...clone.querySelectorAll("img")].forEach((img)=>{
            let alt = img.getAttribute("alt");
            let src = img.getAttribute("src");
            img.innerHTML = `<a href=${src} class="emoji">${alt}</a>`
        });
        return clone;
    } catch(err){
        console.log("Unexpected error in `add_alt_text`: " + err.toString());
        return null;
    }
}
function replace_link(elem){
    try{
        let clone = elem.cloneNode(true);
        [...clone.querySelectorAll("a")].forEach((anc)=>{
            let href = anc.getAttribute("href");
            const text = anc.textContent;
            let span = document.createElement("span");
            span.innerText = `[${text}]("${href}")`;
            anc.after(span);
            anc.remove();
        });
        return clone;
    } catch(err){
        console.log("Unexpected error in `add_alt_text`: " + err.toString());
        return null;
    }
}
function text_with_alt(elem){
    try{
        return add_alt_text(elem).textContent;
    } catch(err){
        console.log("Unexpected error in `text_with_text`: " + err.toString());
        return "";
    }
}
function text_md(elem){
    try{
        return replace_link(add_alt_text(elem)).textContent;
    } catch(err){
        console.log("Unexpected error in `text_md`: " + err.toString());
        return "";
    }
}
function unique(arr){
    if(!arr) return []
    return [...(new Set(arr))]
}

// tweet: `article[data-testid="tweet"]`

function get_names(tweet){
    // tweet -> [username, screenname(@を含まない)]
    try{
        const names = tweet.querySelector('div[data-testid="User-Name"]')?.textContent.split("·")[0].split("@");
        switch(names?.length){
            case 2: return names;
            case 1: return [names[0], undefined];
            default: return [undefined, undefined]
        }
    } catch(err){
        console.log("Unexpected error in `get_names`: " + err.toString());
        return [undefined, undefined];
    }
}

const get_name_area_elem = (tweet) => tweet.querySelector('div[data-testid="User-Name"]');
const get_article_header_area_elem = (tweet) => get_name_area_elem(tweet).parentElement.parentElement.parentElement;
function get_name_elem(tweet){
    try{
        const names = get_name_area_elem(tweet).childNodes;
        switch(names?.length){
            case 2:
                return names[0].querySelector("span");
            case 1:
                console.log('Warning: Failed to get attribute: `node("User-Name").childNodes.length==1`');
                return names[0];
            default:
                console.log('Warning: Failed to get attribute: `node("User-Name").childNodes.length!=2`');
                return null;
        }
    } catch(err){
        console.log("Unexpected error in `get_name_elem`: " + err.toString());
        return null;
    }
}
function get_name_rest_elem(tweet){
    try{
        const names = get_name_area_elem(tweet).childNodes;
        switch(names?.length){
            case 2:
                return names[1].querySelector("div");
            default:
                console.log('Warning: Failed to get attribute: `node("User-Name").childNodes.length!=2`');
                return null;
        }
    } catch(err){
        console.log("Unexpected error in `get_name_rest_elem`: " + err.toString());
        return null;
    }
}
function get_name_text(tweet){
    try{
        return text_with_alt(get_name_elem(tweet));
    } catch(err){
        console.log("Unexpected error in `get_name_text`: " + err.toString());
        return null;
    }
}
function get_is_verified(tweet){
    try{
        return !!tweet.querySelector(`svg[data-testid="icon-verified"]`)
    } catch(err){
        console.log("Unexpected error in `get_is_verified`: " + err.toString());
        return null;
    }
}
function get_is_locked(tweet){
    try{
        return !!tweet.querySelector(`svg[data-testid="icon-lock"]`)
    } catch(err){
        console.log("Unexpected error in `get_is_verified`: " + err.toString());
        return null;
    }
}
function get_scname_elem(tweet){
    try{
        return get_name_rest_elem(tweet)?.querySelector("div")?.textContent;
    } catch(err){
        console.log("Unexpected error in `get_scname_elem`: " + err.toString());
        return null;
    }
}
const get_time_elem = (tweet) => tweet.querySelector("time");

const get_tweet_elem = (tweet) => tweet.querySelector('div[data-testid="tweetText"]');
function get_tweet_text(tweet){
    try{
        return text_with_alt(get_tweet_elem(tweet));
    } catch(err){
        console.log("Unexpected error in `get_name_text`: " + err.toString());
        return null;
    }
}
function get_tweet_text_md(tweet){
    try{
        return text_md(get_tweet_elem(tweet));
    } catch(err){
        console.log("Unexpected error in `get_name_text`: " + err.toString());
        return null;
    }
}

function get_photos(tweet){
    try{
        const photos = Array.from(tweet.querySelectorAll('div[data-testid="tweetPhoto"]')).map((photo)=>photo?.querySelector('img,video')?.getAttribute("src"));
        return (photos?.length > 0)? photos: undefined;
    } catch(err){
        console.log("Unexpected error in `get_photos`: " + err.toString());
        return null;
    }
}
function get_card_hrefs(tweet){
    try{
        const hrefs = unique(Array.from(tweet.querySelector('div[data-testid="card.wrapper"]')?.querySelectorAll("a") ?? []).map((a)=>a?.getAttribute("href")));//.join(", ");
        return (hrefs?.length > 0)? hrefs: undefined;
    } catch(err){
        console.log("Unexpected error in `get_card_hrefs`: " + err.toString());
        return null;
    }
}
const get_time = (tweet) => tweet.querySelector('time')?.getAttribute("datetime");
const get_url = (tweet) => tweet.querySelector('time')?.parentElement.getAttribute("href");
const get_tweet_id = (tweet) => tweet.querySelector('time')?.parentElement.getAttribute("href")?.split("/").slice(-1)[0];
const get_ids = (tweet) => {
    const url = tweet.querySelector('time')?.parentElement.getAttribute("href");
    return [url, url?.split("/".slice(-1)[0])];
};
const get_icon_src = (tweet) => tweet.querySelector('div[data-testid="Tweet-User-Avatar"]')?.querySelector('img')?.getAttribute("src");
const get_reply = (tweet) => parseInt(tweet.querySelector('[data-testid="reply"]')?.getAttribute("aria-label").split(" ")[0]);
const get_retweet_elem = (tweet) => tweet.querySelector('[data-testid="retweet"]');
const get_retweet = (tweet) => parseInt(tweet.querySelector('[data-testid="retweet"]')?.getAttribute("aria-label").split(" ")[0]);
const get_like = (tweet) => parseInt(tweet.querySelector('[data-testid="like"]')?.getAttribute("aria-label").split(" ")[0]);
const get_bookmark = (tweet) => parseInt(tweet.querySelector('[data-testid="bookmark"]')?.getAttribute("aria-label").split(" ")[0]);
//const get_analytics = (tweet) => parseInt(tweet.querySelector('[data-testid="app-text-transition-container"]')?.getAttribute("aria-label").split(" ")[0]);

const get_quote = (tweet) => {
    const quote = tweet.querySelectorAll(`div[role="link"]`);
    if(quote.length==0) return undefined;
    const sub_tweet = quote[0].firstChild;
    const [sub_name, sub_screenname] = get_names(sub_tweet);
    return {
        "icon": get_icon_src(sub_tweet),
        "screenname": sub_screenname,
        "name": sub_name,
        "text": get_tweet_text(sub_tweet),
        "time": get_time(sub_tweet),
    }
}

function get_retweet_context(tweet){
    try{
        return tweet.querySelector(`span[data-testid="socialContext"]`)?.parentElement?.getAttribute("href")?.split("/")?.slice(-1)[0]
    } catch(err){
        console.log("Unexpected error in `get_retweet_context`: " + err.toString());
        return null;
    }
}

function getTweetStats(
        tweet,
        attrs={
            //id: true,
            //user__screenname: true,
            url: true,
            text: true,
            text_md: true,
            card: true,
            quote: true,
            photos: true,
            time: true,
            reply: true,
            retweet: true,
            like: true,
            bookmark: true,
            retweet_context: true,
            user__name: true,
            user__icon: true,
            user__is_verified: true,
            user__is_locked: true,
        }){    
    try{
        const [name, screenname] = get_names(tweet);
        let data = {
            tweet:{
                id: get_tweet_id(tweet),
                screenname: screenname,
            },
            user: {
                screenname: screenname,
            }
        };
        //const text = get_tweet_text(tweet);
        if(attrs.url)
            data.tweet.url = get_url(tweet);
        if(attrs.text)
            data.tweet.text = get_tweet_text(tweet);
        if(attrs.text_md)
            data.tweet.text_md = get_tweet_text_md(tweet);
        if(attrs.card)
            data.tweet.card = get_card_hrefs(tweet);
        if(attrs.quote)
            data.tweet.quote = get_quote(tweet);
        if(attrs.photos)
            data.tweet.photos = get_photos(tweet);
        if(attrs.time)
            data.tweet.time = get_time(tweet);
        if(attrs.reply)
            data.tweet.reply = get_reply(tweet);
        if(attrs.retweet)
            data.tweet.retweet = get_retweet(tweet);
        if(attrs.like)
            data.tweet.like = get_like(tweet);
        if(attrs.bookmark)
            data.tweet.bookmark = get_bookmark(tweet);
        if(attrs.retweet_context)
            data.tweet.retweet_context = get_retweet_context(tweet);
        if(attrs.user__name)
            data.user.name = get_name_text(tweet);
        if(attrs.user__icon)
            data.user.icon = get_icon_src(tweet);
        if(attrs.user__is_verified)
            data.user.is_verified = get_is_verified(tweet);
        if(attrs.user__is_locked)
            data.user.is_locked = get_is_locked(tweet);
        return data;
        
        return {
            tweet:{
                id: get_tweet_id(tweet),
                screenname: screenname,
                url: get_url(tweet),
                text: text,
                card: get_card_hrefs(tweet),
                quote: get_quote(tweet),
                photos: get_photos(tweet),
                time: get_time(tweet),
                reply: get_reply(tweet),
                retweet: get_retweet(tweet),
                like: get_like(tweet),
                bookmark: get_bookmark(tweet),
                retweet_context: get_retweet_context(tweet)
            },
            user: {
                screenname: screenname,
                name: name,
                icon: get_icon_src(tweet),
                is_verified: get_is_verified(tweet),
                is_locked: get_is_locked(tweet)
            }};
        } catch(err){
            return {
                "error": err.toString()
        };
    }
}

/*
let tweets = document.querySelectorAll(`article[data-testid="tweet"]`);
[...tweets].map(tweet=>getTweetStats(tweet));

let tweet = tweets[6];
tweet.querySelector(`div[data-testid="User-Name"]`);
*/