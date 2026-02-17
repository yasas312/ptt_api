const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegStatic);
const app = express();

app.get("/tools/ptt", async (req, res) => {
    // URL එක Encoded වී ඇත්නම් එය Decode කරගන්නවා
    const audioUrl = req.query.url;

    if (!audioUrl) {
        return res.status(400).json({ status: false, error: "URL එකක් ලබා දෙන්න." });
    }

    try {
        // PTT සඳහා අවශ්‍ය Header සෙට් කිරීම
        res.setHeader("Content-Type", "audio/ogg; codecs=opus");

        ffmpeg(audioUrl)
            .inputOptions([
                '-reconnect 1',
                '-reconnect_streamed 1',
                '-reconnect_delay_max 5'
            ])
            .toFormat("opus")
            .audioCodec("libopus")
            .audioChannels(1)
            .audioFrequency(48000)
            .outputOptions([
                "-application voip",
                "-frame_duration 20",
                "-vbr on"
            ])
            .on("start", (commandLine) => {
                console.log("FFmpeg process started");
            })
            .on("error", (err) => {
                console.error("FFmpeg Error:", err.message);
                if (!res.headersSent) {
                    res.status(500).json({ status: false, error: "පරිවර්තනය අසාර්ථකයි. ලින්ක් එක මිය ගොස් තිබිය හැක." });
                }
            })
            .pipe(res, { end: true });

    } catch (err) {
        console.error("Main Error:", err.message);
        res.status(500).json({ status: false, error: "Server Error" });
    }
});

module.exports = app;
