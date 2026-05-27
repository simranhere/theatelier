var mongoose = require("mongoose");

let colDesign = {
  mobile: { type: String, required: true, index: true, unique: true },
  star:   { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
};

var ver = {
  versionKey: false,
  timestamps: true,
};

let SchemaClass = mongoose.Schema;
let collectionObj = new SchemaClass(colDesign, ver);
let ReviewColRef = mongoose.model("reviews", collectionObj);

module.exports = ReviewColRef;