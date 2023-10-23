const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Todo = require('./models/TodoSchema');
const LoggerMiddleware = require('./middleware/LoggerMiddleware');
const User = require('./models/UserSchema');
const { isAuth } = require('./middleware/AuthMiddleware');
require('dotenv').config()

const app = express();

app.use(express.json());
app.use(LoggerMiddleware);

const PORT = process.env.PORT;
const saltAndRounds = 8;

//POST - register user api
app.post('/register', async (req,res)=>{
    const {name, username, password, email} = req.body;

    const hashedPassword = await bcrypt.hash(password,saltAndRounds);

    const newUser = new User({
        name,
        username,
        password: hashedPassword,
        email,
    })

    try {
        await newUser.save();

        res.status(201).send({
            status: 201,
            message: "User Registered Successfully!"
        })

    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "User Register Failed!",
            data: err
        })
    }
})

// POST- User Login API
app.post('/login', async (req,res)=>{
    const {username, password} = req.body;
    let userData;

    try {
        userData = await User.findOne({username});
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "User not Found!",
            data: err,
        })
    }

    let isPassword = await bcrypt.compare(password, userData.password);

    if(!isPassword){
        return res.status(400).send({
            status: 400,
            message: "Password is incorrect!"
        })
    }else{
        let payload = {
            name: userData.name,
            username: userData.username,
            email: userData.email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);

        console.log(token);

        res.status(200).send({
            status: 200,
            message: "user logged in successfully!",
            data: token
        });
    }
})

// Creating a todo - POST
app.post('/add-todo', isAuth, async (req,res)=>{
    const {title, isCompleted, username} = req.body;

    if(title.length == 0 || isCompleted.length == 0 || username.length == 0){
        res.status(400).send({
            status: 400,
            message: "Enter the values in correct format!"
        })
    }

    try {
        const todo = new Todo({
            title,
            isCompleted,
            username,
        })

        await todo.save();
        res.status(201).send({
            status: 201,
            message: "Todo Created Successfully",
        })
        
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Creating a todo failed",
            data: err
        })
    }
})

// GET - get all todos for username
app.get('/todos/:username', isAuth, async(req,res)=>{
    try {
        const username = req.params.username;
        const page = Number(req.query.page) || 1;
        const LIMIT = 5;
        const todosData = await Todo.find({username}).skip((page-1)*LIMIT).limit(LIMIT);

        res.status(200).send({
            status: 200,
            message: "get todos for username is successfull",
            data: todosData
        })
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to get all todos for username",
            data: err
        })
    }

}) 

// GET - get todo by ID
app.get('/todo', isAuth, async(req,res)=>{
    try {
        const todoID = req.body.id;

        const todosData = await Todo.findById(todoID);

        res.status(200).send({
            status: 200,
            message: "Fetching todo by todo ID is successfull",
            data: todosData
        })

    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to get todo by ID",
            data: err
        })
    }
}) 

// Delete - Deleting a todo by id
app.delete('/delete-todo', isAuth, async(req,res)=>{
    try {
        const todoID = req.body.id;

        await Todo.findByIdAndDelete(todoID);

        res.status(200).send({
            status: 200,
            message: "Todo by ID successfully deleted!"
        })
        
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to delete todo by id",
            data: err
        })
    }
})

// PUT - updating a todo by id
app.put('/update-todo/:id', isAuth, async(req,res)=>{
    try {
        const todoID = req.params.id;
        const {title, isCompleted} = req.body;

        await Todo.findByIdAndUpdate(todoID,{title,isCompleted});

        res.status(200).send({
            status: 200,
            message: "Todo by ID successfully updated!",
        })
        
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to update todo by ID",
            data: err
        })
    }
})

// connecting MONGODB to nodejs using mongoose
mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log('MongoDB Connected successfully!'))
.catch((err)=>console.log(err))

app.listen(PORT,()=>{
    console.log('server running at:', PORT);
})