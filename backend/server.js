const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const saveForm = require("./save-form");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.use("/", saveForm);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
