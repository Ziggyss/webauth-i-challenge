const express = require("express");
const bcrypt = require("bcryptjs");
const server = express();
const Users = require("./users/user-model");

server.use(express.json());

server.get("/", (req, res) => {
  res.json("It's working!");
});

server.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 11);
  const newUser = {
    username,
    password: hash
  };

  Users.add(newUser)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json({
        message: "There was an error adding the user: " + error.message
      });
    });
});

server.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid credentials: " });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Error logging in: " + error.message
      });
    });
});

module.exports = server;
