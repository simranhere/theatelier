const mongoose = require("mongoose");

async function connectToMongoDB() {
    try {

        const url =
        "mongodb+srv://PrabhsimranSingh:prabh123%40@cluster0.1bz8rt5.mongodb.net/Balaji_Project?retryWrites=true&w=majority";

        await mongoose.connect(url);

        console.log("Connected to MongoDB");

    } catch (err) {

        console.log("MongoDB Error:", err);

    }
}

module.exports = { connectToMongoDB };