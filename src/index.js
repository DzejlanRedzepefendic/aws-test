const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const config = require("config");

app.use(cors());
const serverName = config.get("server.name") ?? "Paralelelni univerzum";
// Endpoint to get the server status
app.get("/status", (req, res) => {
    res.json({ status: `Server is up and running! Server name: ${serverName}` });
});

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
