const request = require("request");
const cheerio = require("cheerio");

const { united_nation, headers } = require("../config");

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
            let body = await request_page(united_nation, params).catch(ex => {
                throw new Error(ex);
            });

            if (body) {
                let $ = cheerio.load(body);

                $(".rowtext").each((i, elem) => {
                    let _obj = get_data_object($, elem, get_prepared_url(params));
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
function get_data_object($, elem, full_url) {
    const fulltext_description=$(elem).find('td').text()

    let _obj = {
        fullname: get_name(fulltext_description),
        description: get_description(fulltext_description),
        photo: "",
        details: full_url,
        info_type: "united_nation"
    };
    return _obj;
}

/**
 * Request Onu page
 * @param  {[type]} params  [params: {firstName:'', lastName: ''}]
 * @return {[type]}         [promise]
 */
async function request_page(united_nation, params) {
    return new Promise((resolve, reject) => {
        //let request_url = onu.url + params;
        let request_url=get_prepared_url(params);

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

//Get Prepared URL
function get_prepared_url(name){
    return united_nation.url.replace('{0}',name)
        .replace('{1}',name);
}

//Util function to extract info
function get_name(name){
    const last_index=name.indexOf('Nombre (en')<0
        ?name.indexOf('Título')
        :name.indexOf('Nombre (en');
    return name.substring(name.indexOf('Nombre:')+8,last_index).trim()
}

function get_description(name){
    return name.substring(name.indexOf('Título:')+8,name.length).trim()
}