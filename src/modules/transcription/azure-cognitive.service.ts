import fs from 'node:fs';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import type { ITranscriber } from "./transcriber.ts";
import { AbstractTranscriptionService } from "./abstract.service.ts";
import type { Config } from '../../infrastructure/config.ts';
import { getLogger } from "../../infrastructure/logger.ts";

export class AzureCognitiveService extends AbstractTranscriptionService implements ITranscriber {
  #speechConfig: sdk.SpeechConfig;
  #logger = getLogger();

  constructor(config: Config) {
    super();

    this.#speechConfig = sdk.SpeechConfig.fromSubscription(config.azureSpeech.key, config.azureSpeech.region);
    this.#speechConfig.speechRecognitionLanguage = 'tr-TR';
  }

  async transcribe(filename: string, stream: ReadableStream) {
    const { promise, resolve, reject } = Promise.withResolvers<string>();

    const tmpFilePath = await this.saveToTempFolder(filename, stream);
    const path = await this.convertToWav(tmpFilePath);

    const deleteTempFiles = () => {
      fs.rmSync(tmpFilePath);
      fs.rmSync(path);
    }

    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(path));

    let reco = new sdk.SpeechRecognizer(this.#speechConfig, audioConfig);

    let text = '';

    // The event recognized signals that a final recognition result is received.
    // This is the final event that a phrase has been recognized.
    // For continuous recognition, you will get one recognized event for each phrase recognized.
    reco.recognized = (s, e) => {
      // Indicates that recognizable speech was not detected, and that recognition is done.
      if (e.result.reason === sdk.ResultReason.NoMatch) {
        var noMatchDetail = sdk.NoMatchDetails.fromResult(e.result);
        this.#logger.info("Reason: " + sdk.ResultReason[e.result.reason] + " NoMatchReason: " + sdk.NoMatchReason[noMatchDetail.reason]);
      } else {
        this.#logger.info("Reason: " + sdk.ResultReason[e.result.reason] + " Text: " + e.result.text);

        text += e.result.text;
      }
    };

    // The event signals that the service has stopped processing speech.
    // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
    // This can happen for two broad classes of reasons.
    // 1. An error is encountered.
    //    In this case the .errorDetails property will contain a textual representation of the error.
    // 2. Speech was detected to have ended.
    //    This can be caused by the end of the specified file being reached, or ~20 seconds of silence from a microphone input.
    reco.canceled = function (s, e) {
      if (e.reason === sdk.CancellationReason.Error) {
        const str = "(cancel) Reason: " + sdk.CancellationReason[e.reason] + ": " + e.errorDetails;
        console.log(str);
      }
      reco.stopContinuousRecognitionAsync();
    };

    reco.sessionStarted = (s, e) => {
      this.#logger.debug("(session started)  SessionId: " + e.sessionId);
    };

    reco.sessionStopped = (s, e) => {
      this.#logger.debug("(session stopped)  SessionId: " + e.sessionId);

      reco.stopContinuousRecognitionAsync();
      reco.close();
      resolve(text);
      deleteTempFiles();
    };

    reco.startContinuousRecognitionAsync(function () { }, function (err) {
      if (err) {
        reject(err);
        deleteTempFiles();
      }
    });

    return promise;
  }
}
