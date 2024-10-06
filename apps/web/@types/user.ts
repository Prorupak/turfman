export type UserProps = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  emailConfirmed: boolean;
  postcode: string;
  roles: string[];
};
