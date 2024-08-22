import { parseData, ParseType } from "../src/parse";

describe("parseData", () => {
  test("parses a number correctly", () => {
    expect(parseData<number>("123.45", ParseType.NUMBER)).toBe(123.45);
    expect(parseData<number>("abc", ParseType.NUMBER)).toBeNull();
  });

  test("parses a boolean correctly", () => {
    expect(parseData<boolean>("yes", ParseType.BOOLEAN)).toBe(true);
    expect(parseData<boolean>("no", ParseType.BOOLEAN)).toBe(false);
    expect(parseData<boolean>("maybe", ParseType.BOOLEAN)).toBeNull();
  });

  test("parses an object correctly", () => {
    const obj = { key: "value" };
    expect(parseData<object>(obj, ParseType.OBJECT)).toEqual(obj);
    expect(parseData<object>("not an object", ParseType.OBJECT)).toBeNull();
  });

  test("parses a string correctly", () => {
    expect(parseData<string>(123, ParseType.STRING)).toBe("123");
  });
});
