const express = require("express");

// const ProjectRouter = require("./projects/projectRouter");

const server = express();

server.use(express.json());
server.get("/", (req, res) => {
    res.jsob("It's working!")
})
// server.use("/api/projects", ProjectRouter);

module.exports = server;