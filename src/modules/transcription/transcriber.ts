export interface ITranscriber {
  transcribe: (filename: string, stream: ReadableStream) => Promise<string>
}
