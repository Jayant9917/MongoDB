const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const { z } = require("zod");

mongoose.connect("mongodb+srv://admin:jayant132465rana@cluster0.cty7ree.mongodb.net/Todo-app-database")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


const app = express();
const port = 3000;
app.use(express.json());

app.post("/signup", async function(req, res) {
    try {
        // Input validation => You want everything more specific according to the developer 
        // email => string, @, 5
        // password => sttring, 10 char, 1spl, 1 lowercase, 1 uppercase
        //name => string
      
    // 1 => For Input Validation we have to define the Schema
        const requireBody = z.object({
            email : z.string().min(3).max(100).email(),
            name : z.string().min(3).max(100),
            password : z.string().min(3).max(30)
            .refine((val) => /[a-z]/.test(val), {
                message: "Password must contain at least one lowercase letter"
            })
            .refine((val) => /[A-Z]/.test(val), {
                message: "Password must contain at least one uppercase letter"
            })
            .refine((val) => /[^a-zA-Z0-9]/.test(val), {
                message: "Password must contain at least one special character"
            })
        })
    // 2 => Parse the Data
        // const parseData = requiredBody.parse(req.body);
        const parseDataWithSuccess = requireBody.safeParse(req.body);


        // How to show the user exact error what information is wrong and show it to user 

        if (!parseDataWithSuccess.success) { //If user gives unapropriate data it will send the error 
            res.json({
                msg : "Incorrect Format",
                error : parseDataWithSuccess.error // see the error 
            })
            return
        }

        // Parse => it will stop and show error
        //safeParse => don't  through an error just tells us 

        const { email, password, name } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10); // Bcrypt => Hashedpassword & salt

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
