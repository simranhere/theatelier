let mongoose = require("mongoose");

function connectToMongoDB() {
    // let url = "mongodb://localhost:27017/Balaji_Project";
    let url = "mongodb+srv://PrabhsimranSingh:prabh123%40@cluster0.1bz8rt5.mongodb.net/?appName=Cluster0";
    mongoose.connect(url).then(() => {
        console.log("Connected to MongoDB")
    }).catch((err) => {
        console.log(err)
    })
}

module.exports = { connectToMongoDB }
