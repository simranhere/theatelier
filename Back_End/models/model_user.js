var mongoose = require("mongoose");

let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true ,lowercase: true,trim: true,},
    pwd: { type: String, required: true },
    utype: { type: String, required: true, enum: ['Admin', 'Customer', 'Tailor'] },
    dos: { type: Date, default: Date.now },
    status: { type: Boolean, default: true }
}

var ver = {
    versionKey: false
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);
let UserColRef = mongoose.model("users", collectionObj);

module.exports = UserColRef;