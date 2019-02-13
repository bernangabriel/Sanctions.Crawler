const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const parseString = require('xml2js').parseString;
const mssql = require('mssql');

const {
	onu,
	interpol,
	fbi,
	headers,
	sql
} = require("../config-download");


//Do Request
function do_request(options) {
	return new Promise((resolve, reject) => {
		request(options, (err, resp, body) => {
			if (!err) {
				resolve(body);
			} else {
				reject(err);
			}
		});
	});
}

async function save_entry(fbi, onu, interpol, ofac) {
	//store results
	let results = {};
	try {
		//open connection
		await mssql.connect(sql);

		//clear and insert new one
		results.fbi = await insert_new(fbi);
		results.onu = await insert_new(onu);
		results.interpol = await insert_new(interpol);
		results.ofac = await insert_new(ofac);

	} catch (err) {
		console.log('SQL CONNECTION Error...' + err );
	}
	return results;
}


async function insert_new(entry) {
	return new Promise((resolve, reject) => {
		try {
			//clear tables
			const sqlTruncateRequest = new mssql.Request();
			sqlTruncateRequest.query(`truncate table ${entry.table_name}`);

			//insert arrays
			for (index in entry.collections) {
				let item = entry.collections[index];
				if (item) {
					const sqlRequest = new mssql.Request();
					sqlRequest.query(`insert into ${entry.table_name} (Fullname, Photo, Details, Info, InfoType, RegisterDate) 
			          values('${item.fullname}','${item.photo}','${item.details}','${item.info}','${item.info_type}','${new Date().toLocaleDateString()}')`, (err, result) => {});
				}
			}
			resolve(true);
		} catch (ex) {
			reject(`ERROR_INSERT: ${entry.table_name} ${ex}`)
		}
	});
}


async function ofac_get_info() {
	const body = await do_request({
		url: 'https://www.treasury.gov/ofac/downloads/sdn.xml'
	}).catch(ex => console.log('OFAC Error...' + ex));

	if (body) {
		return new Promise((resolve, reject) => {
			parseString(body, function (err, result) {
				const obj = result.sdnList.sdnEntry.map(item => {
					return {
						fullname: `${item.firstName || ''} ${item.lastName.join(',')}`.trim(),
						photo: '',
						details: `${item.sdnType}`,
						info: getAddressInfo(item),
						info_type: 'ofac'
					}
				});
				resolve(obj);
			});
		});
	}

	function getAddressInfo(info) {
		let addr = ''
		if (info.addressList) {
			if (info.addressList[0].address) {
				const item = info.addressList[0].address[0];
				if (item) {
					addr = `${item.address1 || ''} ${item.city || ''} ${item.country || ''}`
				}
			}
		}
		return addr;
	}
}


async function fbi_get_info() {
	let founded = [];
	let offset = 1;
	let url = fbi.url_fugitives + offset;

	while (true) {
		const body = await do_request({
			url: url
		}).catch(ex => console.log('FBI Error...' + ex));

		if (body) {
			let $ = cheerio.load(body);
			const hasRows = $('.castle-grid-block-item').length;
			if (hasRows > 0) {
				offset++;
				url = fbi.url_fugitives + offset;
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
						info: $(item)
							.find(".title")
							.text(),
						info_type: "fbi"
					};
					founded.push(_obj);
				});
			} else {
				break;
			}
		}
	}
	return founded;
}

async function interpol_get_info() {
	let founded = [];
	let url = interpol.url
	let offset = 0;

	url = url + `(offset)/${offset}/`;

	while (true) {
		const body = await do_request(url)
			.catch(ex => console.log('INTERPOL Error...' + ex));

		if (body) {
			let $ = cheerio.load(body);

			const hasRows = $('.bloc_bordure').length;
			if (hasRows > 0) {
				offset = offset + 9;
				url = url + `(offset)/${offset}/`;
				$(".bloc_bordure").each((i, elem) => {
					let _obj = {
						fullname: $(elem)
							.find(".titre")
							.html()
							.replace("<br>", " "),
						photo: `${interpol.domain}${$(elem)
					      .find(".photo img")
					      .first()
					      .attr("src")}`,
						details: `${interpol.domain}${$(elem)
					      .find(".links a")
					      .attr("href")}`,
						info: '',
						info_type: "interpol"
					};
					founded.push(_obj);
				});
			} else {
				break;
			}
		}
	}
	return founded;
}


async function onu_get_info() {
	let founded = [];
	const body = await do_request(onu.url)
		.catch(ex => {
			console.log('ONU Error...' + ex)
		});

	if (body) {
		let $ = cheerio.load(body);

		$(".views-row").each((i, elem) => {
			var det_url = $(elem)
				.find("a")
				.attr("href")
				.replace('/es#/es/', '');

			let _obj = {
				fullname: $(elem).find(".views-field-title").text(),
				photo: "",
				details: `${det_url}`,
				info: `${$(elem).find('.date-display-interval').text()}, ${$(elem).find('.views-field-field-crime').text()}`,
				info_type: "onu"
			}
			founded.push(_obj);
		});
	}
	return founded;
}


async function save_all() {

	results = {};

	//ONU
	const fbi_data = await fbi_get_info(); //fbi
	const onu_data = await onu_get_info(); //onu
	const interpol_data = await interpol_get_info(); //interpol
	const ofac_data = await ofac_get_info(); // ofac

	results = await save_entry({
		collections: fbi_data,
		table_name: 'FbiEntry'
	}, {
		collections: onu_data,
		table_name: 'OnuEntry'
	}, {
		collections: interpol_data,
		table_name: 'InterpolEntry'
	}, {
		collections: ofac_data,
		table_name: 'OfacEntry'
	}, );

	return results;
}

module.exports = {
	save_all: save_all
};



(async () => {
	const _result = await save_all();
	console.log(_result);
})();