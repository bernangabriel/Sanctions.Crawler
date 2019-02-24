const request = require("request");
const cheerio = require("cheerio");

const {
  pn
} = require("../config");

module.exports = {
  get_data: get_data,
  get_data_details: get_data_details
};


function fetch_info(index) {
  return new Promise((resolve, reject) => {
    const options = {
      url: index > 1 ? `${pn.url}page/${index}` : pn.url,
      method: 'GET'
    }
    request(options, (err, res, body) => {
      if (!err) {
        const $ = cheerio.load(body)
        const panelResult = $(".w-blog-list article")
        let array = []
        if (panelResult.length > 0) {
          panelResult.each((i, item) => {
            const info = {
              fullname: $(item).find('.entry-title').text().trim(),
              photo: $(item).find('img').attr('src'),
              details: $(item).find('.w-blog-post-content p').text().trim(),
              url: $(item).find('.w-blog-post-more').attr('href')
            }
            array.push(info)
          })
        } else {
          resolve({})
        }
        resolve(array)
      }
    })
  })
}


function get_all_data() {
  return new Promise(async (resolve, reject) => {
    let array = []
    let index = 1
    while (index < 4) {
      const _result = await fetch_info(index)
      if (_result.length > 0) {
        array = array.concat(_result)
      }
      index++
    }
    resolve(array);
  })
}


/**
 * Request Page
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function get_data(name) {
  return new Promise(async (resolve, reject) => {
    const _data = await get_all_data();
    if (_data.length > 0) {
      const _result = _data.filter(item => {
        if (item.fullname.toLowerCase().indexOf(name) > -1) {
          return item;
        }
      });
      resolve(_result);
    } else {
      resolve([])
    }
  })
}

/**
 * Request Get Data Details
 * @param {*} url
 */
async function get_data_details(url) {
  const options = {
    url: url,
    method: 'GET'
  };
  return new Promise(async (resolve, reject) => {
    request(options, (err, res, body) => {
      if (!err) {
        if (body) {
          let $ = cheerio.load(body);
          resolve({
            fullname: $('.w-blog-post-title').text().trim(),
            photo: $('.attachment-large').attr('src'),
            description: $('.l-section-h p').first().text().trim()
          });
        }
      }
    })
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