require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

mongoose
	.connect(process.env.MONGODB_URI || "mongodb://localhost:3000/dvd-ai-chat")
	.then(() => console.log("Connected to MongoDB"))
	.catch((error) => {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	});

app.use("/", chatRoutes);
app.use((req, res) => res.status(404).send("Not Found"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
