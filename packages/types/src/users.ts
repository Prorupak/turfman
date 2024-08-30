/**
 * @file users.ts
 * @description Type definitions for User-related data structures.
 */

/** Represents the user details. */
export type User = {
  email: string;
  emailConfirmed: boolean;
  firstName: string;
  lastName: string;
  postcode: string;
  userRoles: string[];
  createdAt: string;
  updatedAt: string;
  displayName: string;
  id: string;
};
