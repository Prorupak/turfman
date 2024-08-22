import slugify from 'slugify';

type Slugify = {
  replacement?: string;
  remove?: RegExp;
  lower?: boolean;
  strict?: boolean;
  locale?: string;
  trim?: boolean;
};

export const generateSlug = (text: string, options?: Slugify) => {
  return slugify(text, { lower: true, strict: true, ...options });
};
