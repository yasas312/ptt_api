const express = require("express");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("Dileepa Tech PTT Converter API is Running");
});

app.get("/tools/ptt", async (req, res) => {
    const audioUrl = req.query.url;

    if (!audioUrl) {
        return res.status(400).json({ status: false, message: "Please provide a valid MP3 URL." });
    }

    const outputPath = path.join("/tmp", `voice_${Date.now()}.opus`);

    try {
        ffmpeg(audioUrl)
            .toFormat("opus")
            .audioCodec("libopus")
            .audioChannels(1)
            .audioFrequency(48000)
            .outputOptions([
                "-application voip",
                "-frame_duration 20",
                "-vbr on"
            ])
            .on("error", (err) => {
                console.error("FFmpeg Error:", err);
                res.status(500).json({ status: false, error: err.message });
            })
            .on("end", () => {
                const buffer = fs.readFileSync(outputPath);
                res.set("Content-Type", "audio/ogg");
                res.send(buffer);
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            })
            .save(outputPath);

    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
