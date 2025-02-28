import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Dropbox,
  DropboxAuth,
  Error as DropboxError,
  files as filesType,
  users as DropboxUsers,
} from 'dropbox';
import { readFile } from 'fs/promises';
import _ from 'lodash';
import { AppError } from 'common/errors';
import { Config } from 'config/config.schema';
import { messages } from 'constants/messages';
import { IFile } from 'helpers/file-type.helper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudStorageService {
  public dbxAuth: DropboxAuth;
  public dbx: Dropbox;

  constructor(private configService: ConfigService<Config>) {
    this.dbxAuth = new DropboxAuth({
      clientId: this.configService.get('DROPBOX_CLIENT_ID'),
      clientSecret: this.configService.get('DROPBOX_CLIENT_SECRET'),
      refreshToken: this.configService.get('DROPBOX_REFRESH_TOKEN'),
    });

    this.dbx = new Dropbox({
      auth: this.dbxAuth,
    });
  }

  async getSpaceUsage() {
    const response = await this.dbx.usersGetSpaceUsage();

    return {
      used: response.result.used,
      allocated: (
        response.result.allocation as DropboxUsers.SpaceAllocationIndividual
      ).allocated,
    };
  }

  private getPath(name: string, prefix?: string) {
    return prefix ? `/${prefix}/${name}` : name;
  }

  async getTemporaryLink(name: string, prefix?: string) {
    const path = this.getPath(name, prefix);

    try {
      const response = await this.dbx.filesGetTemporaryLink({ path });

      return response.result.link;
    } catch {
      throw new AppError.Argument(messages.error.filesDownload);
    }
  }

  async filesUpload(
    files: Array<IFile>,
    arg: Omit<filesType.UploadArg, 'contents'>,
    options?: {
      throwOnFail?: boolean;
    },
  ) {
    const responses = await Promise.all(
      files.map(async (file) => {
        const uuid = uuidv4();
        const path = `/${arg.path}/${uuid}.${file.extension}`;
        try {
          const response = await this.dbx.filesUpload({
            ...arg,
            path,
            contents: file.buffer,
          });

          return {
            name: file.name,
            uuid,
            pathDisplay: response.result.path_display,
            ..._.pick(file, 'mime', 'extension'),
          };
        } catch (error) {
          if (options?.throwOnFail ?? true) {
            throw error as DropboxError<filesType.UploadError>;
          }

          return null;
        }
      }),
    );

    const result = _.filter(responses, (r) => !_.isNull(r));

    if (!_.size(result)) {
      throw new AppError.Argument(messages.error.filesUpload);
    }

    return result;
  }

  async fileUpload(file: IFile, arg: Omit<filesType.UploadArg, 'contents'>) {
    try {
      const path = `/${arg.path}/${file.name}.${file.extension}`;

      const response = await this.dbx.filesUpload({
        ...arg,
        path,
        contents: file.buffer ?? (await readFile(file.path)),
      });

      console.log({ response });

      return {
        name: file.name,
        pathDisplay: response.result.path_display,
        ..._.pick(file, 'mime', 'extension'),
      };
    } catch (error) {
      console.log({ error });
    }
  }

  async fileDownload(name: string, prefix?: string) {
    const path = this.getPath(name, prefix);

    try {
      const response = await this.dbx.filesDownload({ path });

      // dropbox sdk fileBinary
      return {
        buffer: (response.result as any).fileBinary as Buffer,
      };
    } catch {
      throw new AppError.Argument(messages.error.filesDownload);
    }
  }

  async fileDelete(name: string, prefix?: string) {
    const path = this.getPath(name, prefix);

    try {
      await this.dbx.filesDeleteV2({ path });

      return { name, path };
    } catch {
      throw new AppError.Argument(messages.error.filesDelete);
    }
  }
}
