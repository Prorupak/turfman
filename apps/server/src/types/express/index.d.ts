import { AuthUser } from 'modules/auth/auth-user.class';
import { Express } from 'express';

declare module 'express' {
  export interface Request {
    user: AuthUser;
    file: Express.Multer.File;
    files: { [fieldname: string]: Express.Multer.File[] };
    query: any;
  }
}
