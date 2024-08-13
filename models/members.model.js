const mongoose = require ('mongoose');

const MembersSchema = new mongoose.Schema({
    image: String,
    name: String,
    message: String,
})

const MembersModel = mongoose.model('member', MembersSchema);

module.exports = MembersModel;