const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");
let app = express();

const routes = require("./routes");

app.set("port", process.env.PORT || 1000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(cors());
app.use(logger("dev"));
app.use("/criminals", routes.criminal);

app.listen(app.get("port"), () => console.log(`WebApi is running up on port: ${app.get("port")}`));