module.exports.fbi = {
    url_fugitives: "https://www.fbi.gov/wanted/fugitives/@@castle.cms.querylisting/f7f80a1681ac41a08266bd0920c9d9d8?page=",
    url_terrorism: "https://www.fbi.gov/wanted/terrorism/@@castle.cms.querylisting/55d8265003c84ff2a7688d7acd8ebd5a?page="
  };
  
  module.exports.interpol = {
    url: "https://www.interpol.int/notice/search/wanted/",
    domain: "https://www.interpol.int"
  };
  
  module.exports.onu = {
    url: "https://eumostwanted.eu/es/",
    domain: "https://eumostwanted.eu/es/"
  };
  
  module.exports.ofac = {
    url: "https://sanctionssearch.ofac.treas.gov/",
    domain: "https://sanctionssearch.ofac.treas.gov/",
    viewstate: ""
  };
  
  module.exports.headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3263.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
  };
  
  module.exports.sql = {
    user: 'sa',
    password: '123456',
    server: 'GABRIELCORDERO\\SQLEXPRESS2014',
    database: 'LavadoActivosNew'
  };