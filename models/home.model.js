const mongoose = require ('mongoose');

const HomeSchema = new mongoose.Schema({
    childrenNumber: String,
    mainTitle: String,
})

const HomeModel = mongoose.model('home', HomeSchema);

module.exports = HomeModel;