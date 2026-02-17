const express = require("express");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const axios = require("axios");
const { PassThrough } = require("stream");

ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
app.use(cors());

app.get("/tools/ptt", async (req, res) => {
    const audioUrl = req.query.url;

    if (!audioUrl) {
        return res.status(400).json({ status: false, message: "URL එකක් ඇතුළත් කරන්න" });
    }

    try {
        // 1. මුලින්ම ලින්ක් එක වැඩද කියලා Axios හරහා චෙක් කරනවා
        const response = await axios({
            method: 'get',
            url: audioUrl,
            responseType: 'stream'
        });

        // 2. Header එක PTT වලට ගැලපෙන ලෙස සෙට් කරනවා
        res.setHeader("Content-Type", "audio/ogg; codecs=opus");

        // 3. FFmpeg හරහා කෙලින්ම Stream එක Convert කිරීම
        ffmpeg(response.data)
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
                // Header එක දැනටමත් යවා ඇත්නම් error එකක් යවන්න බැහැ
                if (!res.headersSent) {
                    res.status(500).json({ status: false, error: "Conversion Failed" });
                }
            })
            .pipe(res, { end: true }); // කෙලින්ම response එකට pipe කරනවා

    } catch (err) {
        console.error("Axios/FFmpeg Error:", err.message);
        res.status(500).json({ status: false, error: "Audio එක ලබා ගැනීමට නොහැකි විය" });
    }
});

module.exports = app;
