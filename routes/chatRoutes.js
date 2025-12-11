const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/Chat");

const genAI = new GoogleGenerativeAI(process.env.DVD_AI_API_KEY);

router.get("/", async (req, res) => {
	try {
		const chatHistory = await Chat.find().sort({ timestamp: 1 }).limit(50);
		res.render("index", { history: chatHistory });
	} catch (error) {
		res.render("index", {
			history: [],
			error: "Failed to load chat history",
		});
	}
});

router.post("/chat", async (req, res) => {
	try {
		const { message } = req.body;
		if (!message || message.trim() === "") {
			return res.status(400).json({ error: "Message cannot be empty" });
		}

		const model = genAI.getGenerativeModel({
			model: "gemini-flash-latest",
		});
		const result = await model.generateContent(message);
		const botResponse = result.response.text();

		const newChat = new Chat({
			userMessage: message,
			botResponse,
		});
		await newChat.save();

		res.json({
			userMessage: message,
			botResponse: botResponse,
			timestamp: newChat.timestamp,
		});
	} catch (error) {
		res.status(500).json({
			error: "Failed to process message",
		});
	}
});

router.delete("/chat/clear", async (req, res) => {
	try {
		await Chat.deleteMany({});
		res.json({ success: true });
	} catch (error) {
		res.status(500).json({
			error: "Failed to clear chat history",
		});
	}
});

module.exports = router;
