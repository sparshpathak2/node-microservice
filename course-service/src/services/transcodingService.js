import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

// Define resolutions array
const resolutions = [
    { name: "360p", width: 480, height: 360 },
    { name: "480p", width: 854, height: 480 },
    { name: "720p", width: 1280, height: 720 }
];

// Function to transcode video using fluent-ffmpeg
// export async function transcodeVideo(inputPath, outputDir, baseFileName) {
//     try {
//         // Ensure output directory exists
//         if (!fs.existsSync(outputDir)) {
//             fs.mkdirSync(outputDir, { recursive: true });
//         }

//         const promises = resolutions.map(({ name, width, height }) => {
//             return new Promise((resolve, reject) => {
//                 const outputFileName = `${baseFileName}-${name}.mp4`;
//                 const outputPath = path.join(outputDir, outputFileName);

//                 ffmpeg(inputPath)
//                     .output(outputPath)
//                     .size(`${width}x${height}`)
//                     .on('end', () => resolve(outputPath))
//                     .on('error', (error) => {
//                         console.error(`Error transcoding ${name}:`, error);
//                         reject(new Error(`Transcoding failed for ${name}`));
//                     })
//                     .run();
//             });
//         });

//         return await Promise.all(promises);
//     } catch (error) {
//         console.error("Transcoding process failed:", error);
//         throw new Error("Failed to transcode video");
//     }
// }

// Function to transcode video to HLS format
export async function transcodeVideo(inputPath, outputDir, baseFileName) {
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const promises = resolutions.map(({ name, width, height }) => {
            return new Promise((resolve, reject) => {
                const hlsDir = path.join(outputDir, `${name}`);
                if (!fs.existsSync(hlsDir)) fs.mkdirSync(hlsDir, { recursive: true });

                const outputPlaylist = path.join(hlsDir, `${baseFileName}-${name}.m3u8`);

                ffmpeg(inputPath)
                    .output(outputPlaylist)
                    .outputOptions([
                        '-preset veryfast',
                        '-g 48', '-sc_threshold 0',
                        `-s ${width}x${height}`, // Set resolution
                        '-c:v h264', '-b:v 1000k', // Video codec and bitrate
                        '-c:a aac', '-b:a 128k', // Audio codec and bitrate
                        '-hls_time 6', '-hls_playlist_type vod', // HLS options
                        `-hls_segment_filename ${hlsDir}/${baseFileName}-${name}-%03d.ts` // TS segments
                    ])
                    .on('end', () => resolve(outputPlaylist))
                    .on('error', (error) => reject(new Error(`Transcoding failed for ${name}: ${error.message}`)))
                    .run();
            });
        });

        return await Promise.all(promises);
    } catch (error) {
        console.error("Transcoding process failed:", error);
        throw new Error("Failed to transcode video");
    }
}
