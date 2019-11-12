const express = require("express");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

const server = express();
const Users = require("./users/user-model");

const sessionConfig = {
  name: "amazingCookieName",
  secret: "this is the bit I am supposed to put into .env",
  cookie: {
    maxAge: 1000 * 60 * 45,
    secure: false,
    httpOnly: false
  },
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore({
    knex: require('./database/db-config'),
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: true,
    clearInterval: 1000 * 60 * 45
  })
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.get("/", (req, res) => {
  res.json("It's working!");
});

server.get("/api/users", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({
        message: "Could not retrieve users: " + err.message
      });
    });
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
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Error logging in: " + error.message
      });
    });
});

function restricted(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(400).json({ message: "You shall not pass!" });
  }
}

module.exports = server;
