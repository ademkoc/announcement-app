import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';

const streamPipeline = promisify(pipeline);

export abstract class AbstractTranscriptionService {
  async saveToTempFolder(filename: string, file: ReadableStream) {
    const destinationPath = new URL(`../../../temp/${filename}`, import.meta.url);
    await streamPipeline(file, fs.createWriteStream(destinationPath));
    return fileURLToPath(destinationPath);
  }

  async convertToWav(tmpFilePath: string) {
    const outputPath = tmpFilePath.replace('.mp3', '.wav');

    const result = await execa({})`gst-launch-1.0 filesrc location=${tmpFilePath} ! decodebin ! audioconvert ! audioresample ! wavenc ! filesink location=${outputPath}`;

    if (result.failed) {
      throw new Error('MP3 to WAV conversion is failed!')
    }

    return outputPath;
  }
}
