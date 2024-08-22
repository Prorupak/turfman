export const productSelectMinimal = {
  _id: 0,
  id: '$_id',
  name: 1,
  description: 1,
  price: 1,
  stock: 1,
  category: 1,
  slug: 1,
  isActive: 1,
  isArchived: 1,
  sku: 1,
  variants: 1,
  variantDetails: 1,
};

export const productSelectDetails = {
  ...productSelectMinimal,
};

export const categorySelect = {
  _id: 0,
  id: '$_id',
  slug: 1,
  name: 1,
  description: 1,
};
