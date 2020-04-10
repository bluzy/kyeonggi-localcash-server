const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopScheme = new Schema({
  city: String,
  name: String,
  lat: Number,
  lng: Number,
  address: String,
  type: String,
  subtype: String,
  tel: String,
  createdTime: { type: Date, default: Date.now },
  modifiedTime: { type: Date, default: Date.now }
}, {
  collection: "shop"
})

mongoose.model("Shop", shopScheme);