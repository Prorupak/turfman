import { parseData, ParseType } from '@turfman/utils';
import _ from 'lodash';

export namespace Jwt {
  export function get(
    payload: Record<string, any>,
    name: string,
    type?: ParseType,
  ) {
    const data =
      payload[name] instanceof Array ? _.first(payload[name]) : payload[name];

    if (_.isNil(data)) {
      return null;
    }

    return parseData(data, type);
  }

  export function getAll(
    payload: Record<string, any>,
    name: string,
    type?: ParseType,
  ) {
    const data =
      payload[name] instanceof Array ? payload[name] : [payload[name]];

    if (_.isNil(data)) {
      return null;
    }

    return _.map(data, (value) => parseData(value, type));
  }
}
