const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

async function convertToPtt(url) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(__dirname, `temp_voice_${Date.now()}.opus`);
        
        ffmpeg(url)
            .toFormat("opus")
            .audioCodec("libopus")
            .audioChannels(1)     
            .audioFrequency(48000)
            .outputOptions([
                "-application voip",  
                "-frame_duration 20",
                "-vbr on"
            ])
            .on("end", () => {
                const buffer = fs.readFileSync(outputPath);
                fs.unlinkSync(outputPath); 
                resolve(buffer);
            })
            .on("error", (err) => reject(err))
            .save(outputPath);
    });
}

module.exports = convertToPtt;
