var mongoose = require("mongoose");

let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true },
    name: String,
    address: String,
    city: String,
    state: String,
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    profilepic: String
}

var ver = {
    versionKey: false
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);
let CustomerColRef = mongoose.model("customers", collectionObj);

module.exports = CustomerColRef;