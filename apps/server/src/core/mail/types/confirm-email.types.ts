export type IConfirmEmailContext = {
  username: string;
  expires: string;
  confirmationLink: string;
  userEmail: string;
  supportEmail: string;
};
