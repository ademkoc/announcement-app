import fs from 'node:fs';
import * as AWS from "@aws-sdk/client-s3";
import type { Config } from "../infrastructure/config.ts";
import { getLogger } from '../infrastructure/logger.ts';

export class GarageService {
  #logger = getLogger();
  #config: Config;
  #client: AWS.S3Client;

  constructor(config: Config) {
    this.#config = config;
    this.#client = new AWS.S3Client({
      region: config.storage.region,
      credentials: {
        accessKeyId: config.storage.accessKeyId,
        secretAccessKey: config.storage.secretAccessKey,
      }
    });
  }

  async uploadFile(filename: string, fullpath: string) {
    try {
      const fileStream = fs.createReadStream(fullpath);

      await this.#client.send(
        new AWS.PutObjectCommand({
          Bucket: this.#config.storage.recordingsBucket,
          Key: filename,
          Body: fileStream,
          ContentType: "audio/mpeg"
        })
      );

      this.#logger.info(`${filename} if uploaded!`);

    } catch (error) {
      throw new Error('File upload failed', { cause: error });
    }
  }

  async getFile(filename: string) {
    try {
      const result = await this.#client.send(
        new AWS.GetObjectCommand({
          Bucket: this.#config.storage.recordingsBucket,
          Key: filename
        })
      );

      return result.Body;
    } catch (error) {
      throw new Error('Failed to read file from cloud storage', { cause: error });
    }
  }
}
