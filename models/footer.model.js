const mongoose = require("mongoose");

const FooterSchema = new mongoose.Schema({
  location: String,
  phone: String,
  email: String,
});

const FooterModel = mongoose.model("footer", FooterSchema);

module.exports = FooterModel;
