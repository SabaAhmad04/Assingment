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

const allowedOrigins = [
  "https://assingment-fuz1m3ekv-saba-ahmads-projects-070c3af5.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

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
