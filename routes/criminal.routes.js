const router = require("express").Router();
const ctrl = require("../controllers");

router.get('/download',async(req, res)=>{
    const _result=await ctrl.download.save_all();
    res.json(_result);
});

router.post("/", async(req, res) => {
    var firstName = (req.body.first_name || "").toLowerCase();
    var lastName = (req.body.last_name || "").toLowerCase();

    var search_in_fbi = req.body.search_in_fbi || false;
    var search_in_interpool = req.body.search_in_interpool || false;
    var search_in_ofac = req.body.search_in_ofac || false;
    var search_in_onu = req.body.search_in_onu || false;
    var search_in_united_nation = req.body.search_in_united_nation || false;
    var search_in_pn = req.body.search_in_pn || false;

    var obj_result = {
        fbi: [],
        interpool: [],
        ofac: [],
        onu: [],
        united_nation:[],
		pn:[]
    };

    if (firstName.length > 3 || lastName.length > 3) {
        //fbi
        if (search_in_fbi == true || search_in_fbi === "True") {
            obj_result.fbi = await ctrl
                .fbi
                .get_data(`${firstName.trim()} ${lastName.trim()}`);
        }

        //interpool
        if (search_in_interpool == true || search_in_interpool == "True") {
            obj_result.interpool = await ctrl
                .interpool
                .get_data({forename: firstName, name: lastName});
        }

        //ofac
        if (search_in_ofac == true || search_in_ofac === "True") {
            obj_result.ofac = await ctrl
                .ofac
                .get_data(`${firstName.trim()} ${lastName.trim()}`);
        }

        //onu
        if (search_in_onu == true || search_in_onu === "True") {
            obj_result.onu = await ctrl
                .onu
                .get_data(`${firstName.trim()} ${lastName.trim()}`);
        }

        //united-nation
         if (search_in_united_nation == true || search_in_united_nation === "True") {
            obj_result.united_nation = await ctrl
                .unitedNation
                .get_data(`${firstName.trim()} ${lastName.trim()}`);
        }

        //policia nacional
        if (search_in_pn == true || search_in_pn === "True") {
            obj_result.pn = await ctrl
                .pn
                .get_data(`${firstName.trim()} ${lastName.trim()}`);
        }
    }
    res.json(obj_result);
});

router.get("/details", async(req, res) => {
    let type = req.query.type || "";
    let url = req.query.url || "";
    var _result = {};

    if (type != "" && url != "") {
        switch (type) {
            case "fbi":
                _result = await ctrl
                    .fbi
                    .get_data_details(url);
                break;

            case "interpool":
                _result = await ctrl
                    .interpool
                    .get_data_details(url);
                break;

            case "ofac":
                _result = await ctrl
                    .ofac
                    .get_data_details(url);
                break;

            case "onu":
                _result = await ctrl
                    .onu
                    .get_data_details(url);
                break;
        }
    }
    res.json(_result);
});

module.exports = router;