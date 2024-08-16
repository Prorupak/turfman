export const generateSkip = (page: number, limit: number): number => {
  return Math.max((page - 1) * limit, 0);
};
