import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MailDataRequired,
  MailService as SendGridMailService,
} from '@sendgrid/mail';
import { readFile } from 'fs/promises';
import { compile } from 'handlebars';
import path from 'path';

// import { IConfirmEmailContext, IForgotPasswordContext } from './types';

@Injectable()
export class MailService {
  public readonly sender: string;
  private readonly mailService: SendGridMailService;

  constructor(private readonly configService: ConfigService) {
    this.sender = configService.get<string>('SENDGRID_SENDER');

    this.mailService = new SendGridMailService();

    this.mailService.setApiKey(
      this.configService.get<string>('SENDGRID_API_KEY'),
    );
  }

  async send(
    data: MailDataRequired | MailDataRequired[],
    isMultiple?: boolean,
  ) {
    try {
      const transport = await this.mailService.send(data, isMultiple);

      return transport;
    } catch (error) {
      console.log({ error });
    }
  }

  async renderTemplate(name: string, context: object): Promise<string> {
    const input = await readFile(
      path.join(
        __dirname,
        '..',
        '..',
        '..',
        'templates',
        'emails',
        `${name}.hbs`,
      ),
      'utf-8',
    );

    const template = compile(input);

    return template(context);
  }
}
