const connectmongo = require("./db.js");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

require('dotenv').config(); // Load environment variables from .env file
const cors = require("cors");

app.use(cors());

app.use(express.json());
connectmongo();
app.use(bodyParser.json()); // Parse JSON bodies

//index

const port = process.env.PORT || 3200;


app.use('/api/spreadsheet',require('./routes/spreadsheetRoutes'));



app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
