import { execa } from 'execa';
import type { ITranscriber } from './transcriber.ts';
import { AbstractTranscriptionService } from './abstract.service.ts';

export class WhisperService extends AbstractTranscriptionService implements ITranscriber {
  async transcribe(filename: string, stream: ReadableStream) {
    const tmpFilePath = await this.saveToTempFolder(filename, stream);

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 60 * 1000);

    try {
      const result = await execa({
          cancelSignal: controller.signal,
          gracefulCancel: true,
      })`whisper-cli -m /Users/adem/Documents/workspace/whisper.cpp/models/ggml-large-v3-turbo.bin -f ${tmpFilePath} -l tr`;

      if (result.failed) {
        throw new Error('whisper.cpp is failed!');
      }

      return result.stdout;
    } catch (error) {
      throw new Error('Failed to speech to text!', { cause: error })
    }
  }
}
