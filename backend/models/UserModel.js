const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;

const Schema = mongoose.Schema;

const user = new Schema({

    email : {type: String , unique : true},
    password : String,
    name : String,

})

const UserModel = mongoose.model("users",user);

module.exports = {
    UserModel,
};
