/**
 * Represents the response received upon a successful user registration.
 */
export type TRegisterResponse = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};
