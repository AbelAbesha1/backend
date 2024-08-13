const mongoose = require ('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
})

const UsersModel = mongoose.model('brightAdmin', UserSchema);

module.exports = UsersModel;