const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3000;
app.use(express.json());

app.post("/signup", function(req, res) {
    
});


app.post("/signin", function(req, res) {

});


app.post("/todo", function(req, res) {

});


app.get("/todos", function(req, res) {

});

app.listen(port, () => {
    console.log("Server is running on port " + port);
});
