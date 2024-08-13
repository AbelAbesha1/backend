const mongoose = require ('mongoose');

const ServiceSchema = new mongoose.Schema({
    image: String,
    title: String,
    description: String,
})

const ServiceModel = mongoose.model('service', ServiceSchema);

module.exports = ServiceModel;