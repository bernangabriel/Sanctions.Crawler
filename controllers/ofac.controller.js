const request = require("request");
const cheerio = require("cheerio");

const {
  ofac,
  headers
} = require("../config");

let options = {
  url: ofac.url,
  method: "POST",
  jar: true,
  form: {
    ctl00_ctl03_HiddenField: ";;AjaxControlToolkit, Version=3.5.40412.0, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:en-US:1547e793-5b7e-48fe-8490-03a375b13a33:475a4ef5:5546a2b:d2e10b12:497ef277:effe2a26",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: "",
    __VIEWSTATEGENERATOR: "CA0B0334",
    ctl00$MainContent$btnSearch: "Search",
    ctl00$MainContent$Slider1: "100",
    ctl00$MainContent$Slider1_Boundcontrol: "100"
  },
  headers: headers,
  followAllRedirects: true
};

module.exports = {
  get_data: get_data,
  get_data_details: get_data_details
};

function get_viewstate() {
  return new Promise((resolve, reject) => {
    request(ofac.url, (error, response, body) => {
      try {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(body);
          resolve($("#__VIEWSTATE").attr("value"));
        }
        reject();
      } catch (ex) {
        reject(ex);
      }
    });
  });
}

/**
 * Request Page
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function get_data(name) {
  return new Promise(async (resolve, reject) => {
    const _viewstate = await get_viewstate().catch(ex => {
      reject(ex);
    });

    if (_viewstate) {
      options.form["ctl00$MainContent$txtLastName"] = name;
      options.form["__VIEWSTATE"] = _viewstate;
      options["url"] = ofac.url;
      request(options, (err, res, body) => {
        if (!err) {
          const _result = get_info_data(body);
          resolve(_result);
        }
      });
    }
  });
}

/**
 * Get Info Data
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function get_info_data(body) {
  let results = [];
  if (body) {
    let $ = cheerio.load(body);
    $("#ctl00_MainContent_pnlResults #scrollResults tr").each((i, item) => {
      if (item) {
        let href_prop = $(item)
          .find("td a")
          .first()
          .attr("href");

        let obj = {
          fullname: $(item)
            .find("td a")
            .first()
            .text()
            .trim(),
          photo: "",
          details: `${ofac.url}${
            href_prop
              .substr(href_prop.indexOf("Details.aspx?id="))
              .split('",')[0]
          }`,
          info_type: "ofac"
        };
        results.push(obj);
      }
    });
  }
  return results;
}

/**
 * Request Get Data Details
 * @param {*} url
 */
async function get_data_details(url) {
  options["url"] = url;
  return new Promise(async (resolve, reject) => {
    let body = await do_request_details(options);
    if (body) {
      let $ = cheerio.load(body);
      resolve({
        fullname: `${$("#ctl00_MainContent_lblFirstName")
          .text()
          .trim()} 
				${$("#ctl00_MainContent_lblLastName")
          .text()
          .trim()}`,
        photo: "",
        alias: $("#ctl00_MainContent_pnlAliases table tr")
          .eq(1)
          .find("td")
          .eq(2)
          .text(),
        description: "N/A",
        rewards: "",
        date_of_birth: $("#ctl00_MainContent_lblDOB")
          .text()
          .trim(),
        place_of_birth: $("#ctl00_MainContent_lblPOB").text(),
        sex: "N/A",
        occupation: "N/A",
        nationality: $("#ctl00_MainContent_pnlIdentification table tr")
          .eq(1)
          .find("td")
          .eq(2)
          .text()
      });
    }
  });
}

/**
 * Do Request Detail Page
 * @param {*} options
 */
async function do_request_details(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, resp, body) => {
      if (!err) {
        resolve(body);
      }
    });
  });
}