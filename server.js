const express = require("express");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
app.use(cors());

app.get("/tools/ptt", async (req, res) => {
    const audioUrl = req.query.url;

    if (!audioUrl) {
        return res.status(400).json({ status: false, message: "URL එකක් ඇතුළත් කරන්න" });
    }
    const outputPath = path.join("/tmp", `voice_${Date.now()}.opus`);

    try {
        ffmpeg(audioUrl)
            .inputOptions(['-reconnect 1', '-reconnect_streamed 1', '-reconnect_delay_max 5'])
            .toFormat("opus")
            .audioCodec("libopus")
            .audioChannels(1)
            .audioFrequency(48000)
            .outputOptions([
                "-application voip",
                "-frame_duration 20"
            ])
            .on("error", (err) => {
                console.error("FFmpeg Error:", err.message);
                if (!res.headersSent) {
                    res.status(500).json({ status: false, error: "පරිවර්තනය අසාර්ථකයි" });
                }
            })
            .on("end", () => {
                const buffer = fs.readFileSync(outputPath);
                res.setHeader("Content-Type", "audio/ogg; codecs=opus");
                res.send(buffer);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            })
            .save(outputPath);

    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});

module.exports = app;
