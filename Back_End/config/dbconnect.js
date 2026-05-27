let mongoose = require("mongoose");

function connectToMongoDB() {
    let url = "mongodb+srv://PrabhsimranSingh:prabh123%40@cluster0.1bz8rt5.mongodb.net/Balaji_Project?retryWrites=true&w=majority";

    mongoose.connect(url)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
    });
}

module.exports = { connectToMongoDB };