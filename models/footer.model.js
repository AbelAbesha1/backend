const mongoose = require("mongoose");

const FooterSchema = new mongoose.Schema({
  location: String,
  phone: String,
  email: String,
  youtube: String,
  facebook: String,
  instagram: String,
});

const FooterModel = mongoose.model("footer", FooterSchema);

module.exports = FooterModel;
