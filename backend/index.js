const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const AuthRouter = require("./Routes/AuthRouter");
const TodoListRouter = require("./Routes/TodoListRouter");

require("dotenv").config();
require("./Models/db");

const PORT = process.env.PORT || 8080;

app.get("/ping", (req, res) => {
  res.send("PONG");
});

app.use("/todolist", TodoListRouter);

app.use(bodyParser.json());
app.use(cors());

console.log("AuthRouter typeof:", typeof AuthRouter);

app.use("/auth", AuthRouter);

app.use("/api/todos", TodoListRouter);

app.listen(PORT, () => {
  console.log(`Sever is running on ${PORT}`);
});
