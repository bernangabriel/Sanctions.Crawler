module.exports.fbi = {
  url_fugitives: "https://www.fbi.gov/wanted/fugitives/@@castle.cms.querylisting/f7f80a1681ac41a08266bd0920c9d9d8?Title=",
  url_terrorism: "https://www.fbi.gov/wanted/terrorism/@@castle.cms.querylisting/55d8265003c84ff2a7688d7acd8ebd5a?Title="
};

module.exports.interpool = {
  url: "https://www.interpol.int/notice/search/wanted/",
  domain: "https://www.interpol.int"
};

module.exports.onu = {
  url: "https://eumostwanted.eu/es/search/node/",
  domain: "https://eumostwanted.eu/es/"
};

module.exports.ofac = {
  url: "https://sanctionssearch.ofac.treas.gov/",
  domain: "https://sanctionssearch.ofac.treas.gov/",
  viewstate: ""
};

module.exports.united_nation={
  url:'https://scsanctions.un.org/sp/?keywords=+{0}&per-page=2500&sections=s&sort=id&includes={1}',
  domain: 'https://scsanctions.un.org',
  viewstate:""
};

module.exports.headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3263.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
};