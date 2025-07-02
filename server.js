const express = require("express");
const materialsRouter = require("./routes/materials.js");

const app = express();
app.use(express.json());
app.use("/materials", materialsRouter);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
