const interpool = require('./interpool.controller');
const fbi = require('./fbi.controller');
const ofac = require('./ofac.controller');
const onu = require('./onu.controller');
const download=require('./download.controller');
const unitedNation=require('./united-nation.controller');

module.exports = {
    interpool,
    fbi,
    ofac,
    onu,
    download,
    unitedNation
};