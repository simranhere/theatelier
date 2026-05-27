const mongoose = require("mongoose");

async function connectToMongoDB() {
    try {

        const url =
        process.env.MONGODB_URL;

        await mongoose.connect(url);

        console.log("Connected to MongoDB");

    } catch (err) {

        console.log("MongoDB Error:", err);

    }
}

module.exports = { connectToMongoDB };