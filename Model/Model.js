const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    fname:String,
    lname:String,
    email:String,
    password:String,
});

const Model = mongoose.model('DATA',schema);

module.exports = {Model};