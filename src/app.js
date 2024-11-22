const express = require('express')
const connectDb = require('./config/database')
const app = express()
const User = require("./models/user");
const { validateSignUpData } = require('./helpers/validator');
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const user = require('./models/user');
const { userAuth } = require('./middleware/userAuth');
app.use(express.json());
// This is how we can get the data from database with specify email get request
app.use(cookieParser());
app.get("/user", async (req, res) => {
	const userEmail = req.body.email;
	console.log(userEmail);
	try {
		const users = await User.find({ Email: userEmail });
		res.send(users);
	} catch (error) {
		res.status(404).send("User  not found: " + error.message);
	}
})
//This is how we can update in the database 
app.get("/feed", async (req,res)=>{
	try {
		const users=await User.find({}); 
		res.send(users)
	} catch (error) {
		res.send("no data available")
	}
})

app.patch("/user/:userId", async (req, res) => {
	const userEmail = req.params.userId;
	const data = req.body;
	// API Level validation for changes in patch 
	console.log(data);
	console.log(userEmail);
	try {
		const allow = ["age", "firstName", "lastName", "password", "gender"];

		const newdata = Object.keys(data).every((k) => allow.includes(k));
		if (!newdata) {
			res.send("user update not allowed")
		}
		const updatedUser = await User.findByIdAndUpdate(
			{ _id: userEmail }, data, {
			returnDocument: "after",
			runValidators: true
		});
		console.log(updatedUser);
		if (!updatedUser) {
			return res.status(404).send("User not found");
		}
		res.send(updatedUser);

	} catch (error) {
		res.status(404).send("User  not found: " + error.message);
	}
})

// app.patch("/user",async (req,res)=>{
// 	const userId=req.body.userId;
// 	// here body will replace all the actual update you want
// 	const body=req.body;
// 	console.log(userId);
// 	try {
// 		const users=await User.findByIdAndUpdate({_id:userId}, body);
// 		console.log(users);
// 		res.send(users);
// 		console.log("updated succesfully");		
// 	}  catch (error) {
// 		res.status(404).send("user not found"+err.message());
// 	}
// } )
// This is how we can delete the required user from database

app.delete("/user", async (req, res) => {
	try {
		const { Email, passWord } = req.body;
		const isEmailExist = await User.findOne({ Email: Email });
		if (!isEmailExist) {
			throw new Error("Invalid credentials");
		}
		const isPasswordExist = await bcrypt.compare(passWord, isEmailExist.passWord);
		if (isPasswordExist) {
			const users = await User.findOneAndDelete({ Email: Email });
			res.send("deleted your Account");
		}
		else {
			res.status(404).send("Invalid Credentials");
		}
	} catch (error) {
		res.status(404).send("ERROR   :" + error.message);
	}
})
// app.delete("/user",async (req,res)=> {
// 	const userid=req.body.Id;
// 	console.log(userid);
// 	try {
// 		const users=await User.findByIdAndDelete(userid);
// 		console.log(users);
// 		res.send(users);
// 	}  catch (error) {
// 		res.status(404).send("user not found"+err.message());
// 	}
// })


app.post("/sendingRequest" ,userAuth, async (req,res) =>{
	const user=req.user;
	console.log(user);
	console.log("hii");
	res.send(user.firstName);
})

app.get("/profile",userAuth, async (req, res) => {
	try {
		const user=req.user;
		res.send(user);
		
	} catch (error) {
		res.status(400).send("ERROR  :  " + error.message);
	}
})
app.post("/signup", async (req, res) => {

	try {
		// first we need to validate the Data
		validateSignUpData(req);
		
		const { firstName, lastName, passWord, Email } = req.body;
		// Then we need to Encrypt the password of User . install bcrypt library

		const passWordHash = await bcrypt.hash(passWord, 10);

		

		// Creating new Instance of User with required fields
		 
		const user = new User({
			firstName,
			lastName,
			Email,
			passWord: passWordHash
		});


		await user.save();
		res.send("user added succesfully")
	} catch (error) {
		res.status(404).send("User  not found: " + error.message);
	}
})
// Login API
app.post("/login", async (req, res) => {
	try {
		const { Email, passWord } = req.body;
		const user = await User.findOne({ Email: Email });
		if (!user) {
			throw new Error("Invalid Credentials");
		}
		const isUserExist = await bcrypt.compare(passWord, user.passWord);
		if (isUserExist) {
			// Here we need to create to JWT token
			const jToken = await jwt.sign({ _id: user._id }, "Mallesham@2212" ,{expiresIn:"1d"} );
			// Log the user ID			
			res.cookie("token", jToken);
			res.send("Login Successful");
		}
		else {
			res.send("Invalid Credentials");
		}
	} catch (error) {
		res.status(404).send("ERROR   :" + error.message);
	}
})

app.get("/logout" , userAuth, async (req,res) =>{
	
	res.clearCookie("token");
	res.send("logout successfully")
})

connectDb().then(() => {
	console.log("connected to database");
	app.listen(4000, () => {
		console.log("server connecting...");
	})
}).catch((err) => {
	console.error("data base cannot connected");
})


