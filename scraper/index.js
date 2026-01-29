import jsdom from 'jsdom'
import fs from 'fs'

// REMINDER: images after often appended 475x268-c-default

const URLS = [
    {
        url: "https://news.wisc.edu/behind-the-scenes-with-nate-buescher-uw-freshman-and-disney-star/",
        img: "buescher.jpeg",
        tags: ["social"]
    },
    {
        url: "https://news.wisc.edu/with-the-wisconsin-exchange-uw-madison-is-strengthening-a-culture-of-civil-dialogue-across-difference/",
        img: "exchange.jpg",
        tags: ["social", "outreach"]
    },
    {
        url: "https://news.wisc.edu/rock-and-roll-and-unleashed-curiosity-with-science-on-the-square/",
        img: "square.jpg",
        tags: ["social", "science", "outreach"]
    },
    {
        url: "https://news.wisc.edu/uw-fostering-closer-research-ties-with-federal-defense-cybersecurity-agencies/",
        img: "defense.jpg",
        tags: ["tech"]
    },
    {
        url: "https://news.wisc.edu/uw-researchers-uncover-possible-new-treatment-to-target-a-devastating-childhood-brain-cancer/",
        img: "treatment.jpg",
        tags: ["science"]
    },
    {
        url: "https://news.wisc.edu/with-milk-testing-and-new-tools-uw-scientists-are-helping-prevent-bird-flu-outbreaks-in-wisconsin-and-beyond/",
        img: "birdflu.jpg",
        tags: ["science"]
    },
    {
        url: "https://news.wisc.edu/author-percival-everett-to-deliver-go-big-read-keynote-nov-4/",
        img: "percival.jpg",
        tags: ["social", "outreach"]
    },
    {
        url: "https://news.wisc.edu/parkinsons-treatment-tested-at-uw-showing-promise-in-first-clinical-trial/",
        img: "parkinson.jpg",
        tags: ["science"]
    },
    {
        url: "https://news.wisc.edu/buckys-tuition-promise-boosts-retention-rate-for-lower-income-students-long-term-study-finds/",
        img: "tuition.jpg",
        tags: ["outreach"]
    },
    {
        url: "https://news.wisc.edu/robotic-space-rovers-keep-getting-stuck-uw-engineers-have-figured-out-why/",
        img: "rovers.jpg",
        tags: ["science", "tech"]
    },
]

const articles = [];

for(const url of URLS) {
    console.log("Processing " + url.url);
    const resp = await fetch(url.url, {
        headers: {
            "Connection": "keep-alive"
        }
    });
    const data = await resp.text();
    // https://stackoverflow.com/questions/11398419/trying-to-use-the-domparser-with-node-js
    const virtualConsole = new jsdom.VirtualConsole();
    const dom = new jsdom.JSDOM(data, { virtualConsole });
    const storyElement = dom.window.document.getElementsByClassName("wp-block-post-content")[0];
    const story = Array.from(storyElement.querySelectorAll('p, li')).reduce((acc, curr) => curr.tagName === "LI" ? `${acc}\n • ${curr.textContent}` : `${acc}\n${curr.textContent}`, "")
    .replace(/(\r?\n)+/g, "\n")
    .replace(/Share via .*/g, "")
    .replace(/Photo by .*/g, "")
    .split("\n")
    .map(cleanStr)
    .filter(t => t)
    const title = dom.window.document.getElementsByClassName("wp-block-post-title")[0].textContent
    const author = dom.window.document.getElementsByClassName("wp-block-uw-storyteller-uw-byline")[0]?.textContent.replace(/By /g, "")
    const dt = dom.window.document.getElementsByClassName("wp-block-post-date")[0]?.textContent
    await sleep(500 + Math.ceil(500 * Math.random()))
    articles.push({
        title: cleanStr(title),
        body: story,
        posted: dt ?? "unknown",
        url: url.url,
        author: author ?? "unknown",
        img: url.img,
        tags: url.tags
    })
}

fs.writeFileSync("_articles.json", JSON.stringify(articles, null, 2))

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanStr(s) {
    return s.trim()
        .replace(/“/g, '"')
        .replace(/”/g, '"')
        .replace(/’/g, '\'')
        .replace(/–/g, "-")
        .replace(/ /g, " ")
}