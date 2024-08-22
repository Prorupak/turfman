import { Regex } from "../src/regex";

describe("Regex.CommonType", () => {
  test("BOOLEAN_POSITIVE matches correct values", () => {
    expect(Regex.CommonType.BOOLEAN_POSITIVE.test("true")).toBe(true);
    expect(Regex.CommonType.BOOLEAN_POSITIVE.test("yes")).toBe(true);
    expect(Regex.CommonType.BOOLEAN_POSITIVE.test("1")).toBe(true);
    expect(Regex.CommonType.BOOLEAN_POSITIVE.test("false")).toBe(false);
  });

  test("BOOLEAN_NEGATIVE matches correct values", () => {
    expect(Regex.CommonType.BOOLEAN_NEGATIVE.test("false")).toBe(true);
    expect(Regex.CommonType.BOOLEAN_NEGATIVE.test("no")).toBe(true);
    expect(Regex.CommonType.BOOLEAN_NEGATIVE.test("0")).toBe(true);
    expect(Regex.CommonType.BOOLEAN_NEGATIVE.test("true")).toBe(false);
  });

  test("DOUBLE matches valid numbers", () => {
    expect(Regex.CommonType.DOUBLE.test("123")).toBe(true);
    expect(Regex.CommonType.DOUBLE.test("123.45")).toBe(true);
    expect(Regex.CommonType.DOUBLE.test("-123.45")).toBe(true);
    expect(Regex.CommonType.DOUBLE.test("123abc")).toBe(false);
  });
});

describe("Regex.Validate", () => {
  test("PASSWORD matches valid strong passwords", () => {
    expect(Regex.Validate.PASSWORD.test("StrongPass1!")).toBe(true);
    expect(Regex.Validate.PASSWORD.test("Aa1!aA1!")).toBe(true);

    expect(Regex.Validate.PASSWORD.test("weakpass")).toBe(false); // Missing uppercase, number, special char
    expect(Regex.Validate.PASSWORD.test("STRONG123!")).toBe(false); // Missing lowercase
    expect(Regex.Validate.PASSWORD.test("Aa1!")).toBe(false); // Too short (less than 8 characters)
    expect(
      Regex.Validate.PASSWORD.test(
        "Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa"
      )
    ).toBe(false); // Too long (more than 64 characters)
    expect(Regex.Validate.PASSWORD.test("StrongPass 1!")).toBe(false); // Contains whitespace
  });

  test("USERNAME matches valid usernames", () => {
    expect(Regex.Validate.USERNAME.test("user_name")).toBe(true);
    expect(Regex.Validate.USERNAME.test("username-123")).toBe(true);
    expect(Regex.Validate.USERNAME.test("user.name")).toBe(true);

    expect(Regex.Validate.USERNAME.test("user__name")).toBe(false); // Consecutive underscores
    expect(Regex.Validate.USERNAME.test("username-")).toBe(false); // Ends with hyphen
    expect(Regex.Validate.USERNAME.test("-username")).toBe(false); // Starts with hyphen
    expect(Regex.Validate.USERNAME.test("user--name")).toBe(false); // Consecutive hyphens
    expect(Regex.Validate.USERNAME.test("user..name")).toBe(false); // Consecutive dots
    expect(Regex.Validate.USERNAME.test("us")).toBe(false); // Too short (less than 3 characters)
    expect(Regex.Validate.USERNAME.test("a".repeat(33))).toBe(false); // Too long (more than 32 characters)
  });
});
