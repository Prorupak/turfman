export const messages = {
  error: {
    unknown: 'An unknown error occurred',
    unauthenticated: 'Unauthenticated access',
    unauthorized: 'Unauthorized access',
    accessDenied: 'Access denied',
    notFound: 'Resource not found',
    notFoundEntity: 'Entity not found',
    badQuery: 'Invalid query',
    badDto: 'Invalid data transfer object',
    conflict: 'Conflict with existing document.',
    argument: 'Invalid argument',
    changeUserRoles: 'Cannot change user roles',
    changeSort: 'Cannot change sort order',
    mongo: 'Database error',
    refreshToken: 'Invalid refresh token provided.',
    filesDownload: 'Error occurred while downloading file.',
    filesUpload: 'Error occurred while uploading file.',
    filesDelete: 'Error occurred while deleting file.',
    fieldSource: 'Field source is required.',
    fieldSourceInvalid: 'Field source has invalid value.',
    userNotFound: 'User not found.',
    currentPassword: 'Current password is incorrect.',
    verificationToken: 'The verification code is invalid or has expired.',
    forgotPassword:
      'Please check your credentials or verify your email address.',
    sameEmailAddressProvided:
      'The provided email address is already associated with your account. Please provide a different email address.',
    notFoundToken: 'Token is not available.',
  },
  warning: {
    defaultData: 'Using default data',
    noChange: 'No changes were made',
    requestVerifyEmail:
      'User has already verified their email or no email is associated with the account.',
  },
};
