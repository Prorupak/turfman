export const orderSelectBase = {
  _id: 0,
  id: '$_id',
  customer: 1,
  items: 1,
  status: 1,
  totalAmount: 1,
  deliveryCost: 1,
  isPaid: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const ordersSelectDetails = {
  ...orderSelectBase,
  deliveryDetails: 1,
  specialInstructions: 1,
  invoiceGenerated: 1,
};
