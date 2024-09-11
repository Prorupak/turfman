export namespace Regex {
  export namespace CommonType {
    /**  Matches strings that represent true (true, yes, 1) */
    export const BOOLEAN_POSITIVE = /^(true|yes|1)$/i;

    /** Matches strings that represent false (false, no, 0) */
    export const BOOLEAN_NEGATIVE = /^(false|no|0)$/i;

    /** Matches strings that represent a valid number (both integer and float) */
    export const DOUBLE = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;
  }

  export namespace Validate {
    /**
     * Validates a strong password:
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     * - At least one special character
     * - No whitespace allowed
     * - Length validation (8-64 characters) handled by decorators
     */
    export const PASSWORD =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,64}$/;
    /**
     * Validates a username:
     * - Allows letters (a-z, A-Z), numbers (0-9)
     * - Allows underscores (_) and hyphens (-)
     * - No spaces allowed
     * - Cannot start or end with an underscore or hyphen
     * - Length validation (3-32 characters) handled by decorators
     */
    export const USERNAME =
      /^(?=[a-zA-Z0-9._-]{3,32}$)(?!.*[_.-]{2})(?!.*[_.-]$)[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;
  }

  export namespace CommonFile {
    /**
     * Regular expression to match common image MIME types.
     * Includes JPEG, PNG, GIF, BMP, SVG, and WebP formats.
     */
    export const IMAGE_MIME_TYPES =
      /^(image\/jpeg|image\/png|image\/gif|image\/bmp|image\/svg\+xml|image\/webp)$/;
  }
}
