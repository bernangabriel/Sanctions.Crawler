const request = require("request");
const cheerio = require("cheerio");

const { onu, headers } = require("../config");

module.exports = {
    get_data: get_data,
    get_data_details: get_data_details
};

/**
 * Request get data
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
async function get_data(params) {
    return new Promise(async(resolve, reject) => {
        try {
            let _result = [];
            let body = await request_page(onu, params).catch(ex => {
                throw new Error(ex);
            });

            if (body) {
                let $ = cheerio.load(body);

                $(".search-result").each((i, elem) => {
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
                fullname: $("#page-title").text(),
                photo: $(".field-name-field-picture img").attr("src"),
                alias: 'N/A',
                description: $(".wanted_bottom_right").first('.body').text().trim(),
                rewards: "N/A",
                date_of_birth: $('.field-name-field-date-of-birth span').text(),
                place_of_birth: $('.field-name-field-ethnic-origin li').text(),
                sex: $('.field-name-field-gender li').text(),
                occupation: "N/A",
                nationality: $('.field-name-field-nationality li').text()
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
    var det_url = $(elem)
        .find("a")
        .attr("href")
        .replace('/es#/es/', '');

    let _obj = {
        fullname: $(elem).find("a").html(),
        photo: "",
        details: `${onu.domain}${det_url}`,
        info_type: "onu"
    };
    return _obj;
}

/**
 * Request Onu page
 * @param  {[type]} params  [params: {firstName:'', lastName: ''}]
 * @return {[type]}         [promise]
 */
async function request_page(onu, params) {
    return new Promise((resolve, reject) => {
        let request_url = onu.url + params;

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