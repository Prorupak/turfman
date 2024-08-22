import { ApiTags } from '@nestjs/swagger';
import { capitalize } from 'lodash';

export const ApiName: (prefix?: string) => ClassDecorator =
  (prefix?: string) => (target: any) => {
    const [name] = target.name.split('Controller');
    prefix
      ? ApiTags(`${capitalize(prefix)} - ${name} Routes`).call(null, target)
      : ApiTags(`${name} Routes`).call(null, target);
  };
