import { execa } from 'execa';
import { TranscriberStrategy } from './strategy.ts';
import type { Config } from '../../infrastructure/config.ts';
import { abortController } from '../../server.ts';

export class WhisperService extends TranscriberStrategy {
  #config: Config;

  constructor(config: Config) {
    super();
    this.#config = config
  }

  async transcribe(filename: string, stream: ReadableStream) {
    const tmpFilePath = await this.saveToTempFolder(filename, stream);

    try {
      const result = await execa({
        cancelSignal: abortController.signal,
        gracefulCancel: true,
      })`whisper-cli -m ${this.#config.whisperModelPath} -f ${tmpFilePath} -l tr`;

      if (result.failed) {
        throw new Error('whisper.cpp is failed!');
      }

      return result.stdout;
    } catch (error) {
      throw new Error('Failed to speech to text!', { cause: error })
    }
  }
}
