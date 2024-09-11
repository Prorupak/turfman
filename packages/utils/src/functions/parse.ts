import { Regex } from "./regex";

/**
 * Types of data that can be parsed.
 */
export enum ParseType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  OBJECT = "object",
}

/**
 * Parses the input data into the specified type.
 *
 * @template T - The expected return type based on the `type` parameter.
 * @param {any} data - The data to be parsed.
 * @param {ParseType} [type] - The type to which the data should be parsed. Defaults to `ParseType.STRING`.
 * @returns {T | null} - The parsed data if it matches the specified type; otherwise, `null`.
 *
 * @example
 * const parsedNumber = parseData('123.45', ParseType.NUMBER); // returns 123.45
 * const parsedBoolean = parseData('yes', ParseType.BOOLEAN); // returns true
 */
export function parseData<T>(
  data: any,
  type: ParseType = ParseType.STRING
): T | null {
  switch (type) {
    case ParseType.OBJECT: {
      if (typeof data === "object" && data !== null) {
        return data as T;
      }
      return null;
    }
    case ParseType.BOOLEAN: {
      if (typeof data === "boolean") {
        return data as T;
      }
      if (Regex.CommonType.BOOLEAN_POSITIVE.test(data)) {
        return true as T;
      }
      if (Regex.CommonType.BOOLEAN_NEGATIVE.test(data)) {
        return false as T;
      }
      return null;
    }
    case ParseType.NUMBER: {
      if (typeof data === "number") {
        return data as T;
      }
      if (Regex.CommonType.DOUBLE.test(data)) {
        return Number(data) as T;
      }
      return null;
    }
    case ParseType.STRING:
    default:
      return String(data) as T;
  }
}
