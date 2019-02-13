const request = require("request");
const cheerio = require("cheerio");

const {
    fbi,
    headers
} = require("../config");

let options = {
    method: "GET",
    jar: true,
    followAllRedirects: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36",
        Accept: "*/*"
    },
    cookie: {
        __cfduid: "d7bdf2f7704806c63c31452f72c6b30b41510274680",
        _gat: "1"
    }
};

module.exports = {
    get_data: get_data,
    get_data_details: get_data_details
};

/**
 * Get Result Data
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
async function get_data(name) {
    return new Promise(async (resolve, reject) => {
        let body_fugitives = await do_request(
            (options["url"] = `${fbi.url_fugitives}${name}`)
        );
        let body_terrorism = await do_request(
            (options["url"] = `${fbi.url_terrorism}${name}`)
        );

        resolve(
            get_info_data(body_fugitives, "fugitive").concat(
                get_info_data(body_terrorism, "terrorism")
            )
        );
    });
}

/**
 * Get Result Data Details
 * @param {*} url 
 */
async function get_data_details(url) {
    options["url"] = url;
    return new Promise(async (resolve, reject) => {
        let body = await do_request_details(options);
        if (body) {
            let $ = cheerio.load(body);
            resolve({
                fullname: $(".documentFirstHeading").text(),
                photo: $(".wanted-person-mug img").attr("src"),
                alias: $(".wanted-person-aliases p").text(),
                description: $(".wanted-person-caution p").text(),
                rewards: $(".wanted-person-reward p").text(),
                date_of_birth: $(".wanted-person-description table tr")
                    .eq(0)
                    .find("td")
                    .last()
                    .text(),
                place_of_birth: $(".wanted-person-description table tr")
                    .eq(1)
                    .find("td")
                    .last()
                    .text(),
                sex: $(".wanted-person-description table tr")
                    .eq(6)
                    .find("td")
                    .last()
                    .text(),
                occupation: $(".wanted-person-description table tr")
                    .eq(8)
                    .find("td")
                    .last()
                    .text(),
                nationality: $(".wanted-person-description table tr")
                    .eq(9)
                    .find("td")
                    .last()
                    .text()
            });
        }
    });
}

/**
 * Get Info Data
 * @param  {[type]} body      [description]
 * @param  {[type]} info_type [description]
 * @return {[type]}           [description]
 */
function get_info_data(body, info_type) {
    let results = [];
    if (body) {
        let $ = cheerio.load(body);
        $(".castle-grid-block-item").each((i, item) => {
            let _obj = {
                fullname: $(item)
                    .find(".name")
                    .text(),
                photo: $(item)
                    .find("img")
                    .attr("src"),
                details: $(item)
                    .find(".name a")
                    .attr("href"),
                crime_type: $(item)
                    .find(".title")
                    .text(),
                type: info_type === "fugitive" ? "fugitive" : "terrorism",
                info_type: "fbi"
            };
            results.push(_obj);
        });
    }
    return results;
}

/**
 * Do Request
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
async function do_request(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, resp, body) => {
            if (!err) {
                resolve(body);
            }
        });
    });
}

/**
 * Do Request Detail Page
 * @param {*} options 
 */
async function do_request_details(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, resp, body) => {
            if (!err) {
                resolve(body);
            }
        });
    });
}