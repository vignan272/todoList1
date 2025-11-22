const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users", // model name from Users.js
    required: true,
  },
});

const TodoModel = mongoose.model("todolist", TodoSchema);
module.exports = TodoModel;
