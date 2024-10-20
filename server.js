const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Create the Express app
const app = express();
const port = 3002;

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static("public"));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/give-feedback", async (req, res) => {
  const { conjecture, proof } = req.body;
  const prompt = `Conjecture: ${conjecture}\nProof: ${proof}\nProvide some feedback and tips to help guide the user to write a valid proof without giving the full solution.`;

  try {
    const result = await model.generateContent(prompt);
    var showdown = require("showdown"),
      converter = new showdown.Converter(),
      html = converter.makeHtml(result.response.text());
    res.json({ feedback: html });
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).send("Failed to generate feedback.");
  }
});

// Endpoint to check proof with the AI model
app.post("/check-proof", async (req, res) => {
  const { conjecture, proof } = req.body;
  const prompt = `Conjecture: ${conjecture}\nProof: ${proof}\nDoes this proof solve the conjecture? Do not provide feedback, respond with \"YES\" or \"NO\" only. If there are only minor issues which do not impact the veracity and meaning of the proof, respond with "YES".`;

  try {
    const result = await model.generateContent(prompt);
    res.json({ generatedText: result.response.text() });
  } catch (error) {
    console.error("Error checking proof with AI:", error);
    res.status(500).send("Failed to check proof.");
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/check-custom", async (req, res) => {
  const { conjecture } = req.body;
  const prompt = `Conjecture: ${conjecture}\nIs this conjecture a true conjecture? Do not provide feedback, respond with \"YES\" or \"NO\" only. If there are only a minor issue which does not impact the veracity or meaning of the conjecture, respond with "YES".`;

  try {
    const result = await model.generateContent(prompt);
    res.json({ generatedText: result.response.text() });
  } catch (error) {
    console.error("Error checking proof with AI:", error);
    res.status(500).send("Failed to check proof.");
  }
});
