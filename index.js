const express = require("express");
const path = require("path");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const URL = require("./models/url");

const app = express();
const PORT = process.env.PORT || 8001;

// Connect to MongoDB
connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🔹 This ensures visiting "/" shows home.ejs
app.get("/", async (req, res) => {
    const allUrls = await URL.find({});
    return res.render("home", { urls: allUrls });
});

// Load Routes
app.use("/url", urlRoute);
app.use("/", staticRoute);

// Handle URL Redirects
app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        { shortId },
        { $push: { visitHistory: { timestamp: Date.now() } } }
    );

    if (!entry) {
        return res.status(404).send("URL Not Found");
    }
    res.redirect(entry.redirectURL);
});

// Start Server
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
