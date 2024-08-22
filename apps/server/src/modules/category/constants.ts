export const categorySelect = {
  _id: 0,
  id: '$_id',
  name: 1,
  description: 1,
  slug: 1,
  isActive: 1,
  displayOrder: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const categorySelectDetails = {
  ...categorySelect,
  parentCategory: 1,
  products: 1,
  relatedCategories: 1,
};
