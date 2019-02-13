const request = require("request");
const cheerio = require("cheerio");

const { interpool, headers } = require("../config");

module.exports = {
    get_data: get_data,
    get_data_details: get_data_details
};

/**
 * Request get data
 * @param  {[type]} params [description]
 * @param  {[type]} offset [description]
 * @return {[type]}        [description]
 */
async function get_data(params, offset) {
    return new Promise(async(resolve, reject) => {
        try {
            let _result = [];
            let body = await request_page(interpool, params, offset).catch(ex => {
                throw new Error(ex);
            });

            if (body) {
                let $ = cheerio.load(body);

                $(".bloc_bordure").each((i, elem) => {
                    let _obj = get_data_object($, elem);
                    _result.push(_obj);
                });

                resolve(_result);
            }
        } catch (ex) {
            reject(ex);
        }
    });
}

/**
 * Request Get Data Details
 * @param {*} url 
 */
async function get_data_details(url) {
    let options = {
        url: url,
        method: "GET",
        headers: headers,
        jar: true
    };
    return new Promise(async(resolve, reject) => {
        let body = await do_request_details(options);
        if (body) {
            let $ = cheerio.load(body);
            resolve({
                fullname: $(".nom_fugitif_wanted").text(),
                photo: `${interpool.domain}${$("#result_details img").attr("src")}`,
                alias: $(".table_detail_profil tr")
                    .eq(0)
                    .find("td")
                    .last()
                    .text(),
                description: "N/A",
                rewards: "",
                date_of_birth: $(".table_detail_profil tr")
                    .eq(3)
                    .find("td")
                    .last()
                    .text(),
                place_of_birth: $(".table_detail_profil tr")
                    .eq(5)
                    .find("td")
                    .last()
                    .text()
                    .trim(),
                sex: $(".table_detail_profil tr")
                    .eq(2)
                    .find("td")
                    .last()
                    .text(),
                occupation: "N/A",
                nationality: $(".table_detail_profil tr")
                    .eq(5)
                    .find("td")
                    .last()
                    .text()
                    .trim()
            });
        }
    });
}

/**
 * Get Data Object
 * @param  {[type]} $    [description]
 * @param  {[type]} elem [description]
 * @return {[type]}      [description]
 */
function get_data_object($, elem) {
    let _obj = {
        fullname: $(elem)
            .find(".titre")
            .html()
            .replace("<br>", " "),
        photo: `${interpool.domain}${$(elem)
      .find(".photo img")
      .first()
      .attr("src")}`,
        details: `${interpool.domain}${$(elem)
      .find(".links a")
      .attr("href")}`,
        info_type: "interpool"
    };
    return _obj;
}

/**
 * Request Interpool page
 * @param  {[type]} params  [params: {forename:'', name: ''}]
 * @param  {[type]} offset  [offset page]
 * @return {[type]}         [promise]
 */
async function request_page(interpool, params, offset) {
    return new Promise((resolve, reject) => {
        let request_url = interpool.url;

        if (offset) request_url = request_url + `(offset)/${offset}/`;

        if (params.forename)
            request_url = request_url + `(Forename)/${params.forename}/`;

        if (params.name) request_url = request_url + `(Name)/${params.name}/`;

        request_url = request_url + "(search)/1";

        let options = {
            url: request_url,
            method: "GET",
            headers: headers,
            jar: true
        };

        request(options, (err, res, body) => {
            if (!err) {
                resolve(body);
            } else {
                reject(err);
            }
        });
    }).catch(err => {
        reject(err);
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