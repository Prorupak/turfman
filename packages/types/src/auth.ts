/**
 * Represents the response received upon a successful user registration.
 */
export type TRegisterResponse = {
  /** The unique identifier of the registered user. */
  id: string;

  /** The username of the registered user. */
  username: string;

  /** The display name of the registered user. */
  displayName: string;

  /** The email address of the registered user. */
  email: string;

  /** The timestamp when the user was created. */
  createdAt: Date;

  /** The timestamp when the user was last updated. */
  updatedAt: Date;
};
