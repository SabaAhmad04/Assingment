const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const airtableAuthRouter = require("./routes/airtableAuth");
const airtableDataRouter = require("./routes/airtableData");
const formsRouter = require("./routes/forms");
const responsesRouter = require("./routes/response");
const devAuthRouter = require("./routes/devAuth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/auth", devAuthRouter);
app.use("/auth/airtable", airtableAuthRouter);
app.use("/airtable", airtableDataRouter);
app.use("/forms", formsRouter);
app.use("/forms", responsesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
