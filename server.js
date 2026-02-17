const express = require("express");
const convertToPtt = require("./ptt"); 
const app = express();
const PORT = 3000;
app.get("/tools/ptt", async (req, res) => {
    const audioUrl = req.query.url;
    
    if (!audioUrl) {
        return res.json({ status: false, message: "Please provide a valid MP3 URL." });
    }
    try {
        const pttBuffer = await convertToPtt(audioUrl);
        res.set("Content-Type", "audio/ogg"); 
        res.send(pttBuffer);    
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});
app.listen(PORT, () => {
    console.log(`PTT Converter API running on http://localhost:${PORT}`);
});
