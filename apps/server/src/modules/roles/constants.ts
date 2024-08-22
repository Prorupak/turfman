export const roleSelect = {
  _id: 0,
  id: '$_id',
  name: true,
  sort: true,
  default: true,
  createdAt: true,
  updatedAt: true,
};

export enum UserRoles {
  SALES_ASSISTANCE = 'sales_assistance',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
