const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");

mongoose.connect("mongodb+srv://admin:jayant132465rana@cluster0.cty7ree.mongodb.net/Todo-app-database")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


const app = express();
const port = 3000;
app.use(express.json());

app.post("/signup", async function(req, res) {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            email: email,
            password: hashedPassword,
            name: name
        });

        res.json({
            message: "You are signed up"
        });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong during signup" });
    }
});



app.post("/signin", async function(req, res) {
    try{
        const { email, password } = req.body;

    const response = await UserModel.findOne({
        email: email,
    });
    if (!response){
        res.status(403).json({
            "msg" : "user does not exist in db"
        })
        return
    }
    const passwordMatch = await bcrypt.compare(password, response.password);
    if (passwordMatch) {
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
}catch(error){
    res.status(500).json({ error: "Something went wrong" });
    }
});


app.post("/todo", auth, async function(req, res) {
    const userId = req.userId;
    const { title, done } = req.body;

    await TodoModel.create({
        userId,
        title,
        done
    });

    res.json({
        message: "Todo created"
    })
});


app.get("/todos", auth, async function(req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    })
});

app.listen(port, () => {
    console.log("Server is running on port " + port);
});
