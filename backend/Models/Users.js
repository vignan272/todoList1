const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSechema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model("users", UserSechema);
module.exports = UserModel;
