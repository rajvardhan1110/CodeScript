const mongoose = require("mongoose");
// const ObjectId = mongoose.ObjectId;

const Schema = mongoose.Schema;

const admin = new Schema({
    email : {type: String , unique : true},
    password : String,
    name : String
})

const AdminModel = mongoose.model("admins",admin);

module.exports = {
    
    AdminModel
   
};
