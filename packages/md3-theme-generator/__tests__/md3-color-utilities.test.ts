import {
  argbFromRgb,
  CustomColor,
  QuantizerCelebi,
  Score,
  themeFromSourceColor,
} from "@material/material-color-utilities";
import { createCanvas, loadImage } from "canvas";
import {
  sourceColorFromImagePath,
  themeFromImagePath,
  // @ts-ignore
} from "../src/md3-color-utilities.js";

jest.mock("canvas", () => ({
  createCanvas: jest.fn(),
  loadImage: jest.fn(),
}));

jest.mock("@material/material-color-utilities", () => ({
  argbFromRgb: jest.fn(),
  QuantizerCelebi: {
    quantize: jest.fn(),
  },
  Score: {
    score: jest.fn(),
  },
  themeFromSourceColor: jest.fn(),
}));

// jest.mock("../src/md3-color-utilities.ts", () => ({
//   ...jest.requireActual("../src/md3-color-utilities.ts"),
//   sourceColorFromImagePath: jest.fn(),
// }));

describe("sourceColorFromImagePath", () => {
  it("should correctly load image and return the top-ranked source color", async () => {
    const mockImage = { width: 100, height: 100, complete: true };
    const mockContext = {
      drawImage: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]), // Example pixel data
      }),
    };

    // Mock loadImage and canvas context
    (loadImage as jest.Mock).mockResolvedValue(mockImage);
    (createCanvas as jest.Mock).mockReturnValue({
      getContext: jest.fn().mockReturnValue(mockContext),
    });

    // Mock Material color utilities
    (argbFromRgb as jest.Mock).mockReturnValue(0xff0000); // Mock ARGB conversion
    (QuantizerCelebi.quantize as jest.Mock).mockReturnValue([
      0xff0000, 0x00ff00,
    ]);
    (Score.score as jest.Mock).mockReturnValue([0xff0000]);

    const result = await sourceColorFromImagePath("mock-path");

    // Ensure the correct calls were made
    expect(loadImage).toHaveBeenCalledWith("mock-path");
    expect(createCanvas).toHaveBeenCalledWith(100, 100);
    expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0);
    expect(result).toBe(0xff0000);
  });

  it("should exclude transparent pixels", async () => {
    const mockImage = { width: 100, height: 100, complete: true };
    const mockContext = {
      drawImage: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        // First pixel is transparent (alpha = 0), second pixel is fully opaque
        data: new Uint8ClampedArray([
          255,
          0,
          0,
          0, // Transparent pixel (alpha = 0)
          0,
          255,
          0,
          255, // Opaque pixel (alpha = 255)
        ]),
      }),
    };

    (loadImage as jest.Mock).mockResolvedValue(mockImage);
    (createCanvas as jest.Mock).mockReturnValue({
      getContext: jest.fn().mockReturnValue(mockContext),
    });

    // Mock Material color utilities
    (argbFromRgb as jest.Mock).mockReturnValueOnce(0xff0000); // Mock ARGB conversion for the opaque pixel
    (QuantizerCelebi.quantize as jest.Mock).mockReturnValue([0xff0000]);
    (Score.score as jest.Mock).mockReturnValue([0xff0000]);

    const result = await sourceColorFromImagePath("mock-path");

    // Transparent pixel should be excluded, resulting in only one valid pixel being quantized
    expect(QuantizerCelebi.quantize).toHaveBeenCalledWith([0xff0000], 128);
    expect(result).toBe(0xff0000);
  });
});

// describe("themeFromImagePath", () => {
//   it("should correctly generate a theme from image source color", async () => {
//     const mockCustomColors: CustomColor[] = [
//       { value: 0xff0000, name: "custom-red", blend: true },
//     ];
//     const mockSourceColor = 0xff0000;

//     // Use jest.spyOn to mock sourceColorFromImagePath only for this test case
//     const sourceColorSpy = jest
//       .spyOn(require("../src/md3-color-utilities"), "sourceColorFromImagePath")
//       .mockResolvedValue(mockSourceColor);

//     (themeFromSourceColor as jest.Mock).mockReturnValue("mock-theme");

//     const result = await themeFromImagePath("mock-path", mockCustomColors);

//     expect(sourceColorSpy).toHaveBeenCalledWith("mock-path");
//     expect(themeFromSourceColor).toHaveBeenCalledWith(
//       mockSourceColor,
//       mockCustomColors
//     );
//     expect(result).toBe("mock-theme");

//     // Restore the original implementation after the test
//     sourceColorSpy.mockRestore();
//   });
// });
