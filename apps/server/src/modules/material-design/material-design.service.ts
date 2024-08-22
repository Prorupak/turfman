import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { readFile } from 'fs/promises';

import { ThemeResponse } from './material-design.interfaces';
import { IFile } from 'helpers/file-type.helper';
import { AppError } from 'common/errors';
import { messages } from 'constants/messages';
// import { themeFromSourceColor } from '@buzz/md3-theme-generator';

@Injectable()
export class MaterialDesignService {
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    const baseURL = this.configService.get<string>('MATERIAL_COLORS_UTILS_URL');

    this.axiosInstance = axios.create({ baseURL });
  }

  async generateThemeFromImage(image: IFile) {
    const blob = new Blob([
      image.buffer ? image.buffer : await readFile(image.path),
    ]);

    const form = new FormData();
    form.append('image', blob);

    try {
      const { data } = await this.axiosInstance.post<ThemeResponse>(
        '/image',
        form,
      );

      return data;
    } catch (error) {
      return { themeSource: null, themeStyle: null } satisfies ThemeResponse;
    }
  }

  async generateThemeFromSource(source: number) {
    try {
      // const { data } = await this.axiosInstance.post<ThemeResponse>('/source', {
      //   source,
      // });

      // return data;
      if (typeof source !== 'number') {
        throw new AppError.Argument(messages.error.fieldSource);
      }

      if (source < 0 || source > 4294967295) {
        throw new AppError.Argument(messages.error.fieldSourceInvalid);
      }

      // const theme = await themeFromSourceColor(source);
    } catch (error) {
      return { themeSource: null, themeStyle: null } satisfies ThemeResponse;
    }
  }
}
