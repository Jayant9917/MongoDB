const express = require("express");
const mongoose = require("mongoose");
const JWT_SECRET = "s3cret";
mongoose.connect("mongodb+srv://gasfgfafa:Aa5jxKhylWdFhv4v@cluster0.7kmvq.mongodb.net/todo-app")

const { auth, JWT_SECRET } = require("./auth");
const { UserModel, TodoModel } = require("./db");


const app = express();
const port = 3000;
app.use(express.json());

app.post("/signup", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email: email,
        password: password,
        name: name
    });
    
    res.json({
        message: "You are signed up"
    })
});


app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
        password: password,
    });

    if (response) {
        const token = jwt.sign({
            id: response._id.toString()
        })

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
});


app.post("/todo", function(req, res) {

});


app.get("/todos", function(req, res) {

});

app.listen(port, () => {
    console.log("Server is running on port " + port);
});
