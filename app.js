const express = require("express");
const app = express();
const clinicianRoutes = require("./routes/user.routes");
app.use(express.json());

app.use("/api/clinician", clinicianRoutes);

module.exports = app;