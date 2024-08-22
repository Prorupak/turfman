import { Jwt } from 'helpers/jwt.helper';
import { ParseType } from '@buzz/utils';

const jwtCache = new Map();

/**
 * Gets a JWT value from a payload, caching the result for efficiency.
 *
 * @param {Record<string, any>} payload - The JWT payload.
 * @param {string} key - The key of the value to retrieve.
 * @param {string} [type] - The expected type of the value.
 * @returns {*} The retrieved value.
 */
function getCachedJwtValue(
  payload: Record<string, any>,
  key: string,
  type?: ParseType,
): any {
  const cachedValue = jwtCache.get(`${payload.sub}-${key}`);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  const value = Jwt.get(payload, key, type);
  jwtCache.set(`${payload.sub}-${key}`, value);
  return value;
}

/**
 * Represents an authenticated user.
 */
export class AuthUser {
  public id: string;
  public username: string;
  public displayName: string;
  public hasPassword: boolean;
  public email: string;
  public emailConfirmed: boolean;
  public firstName: string;
  public lastName: string;
  public birthDate: string;
  public salary: number;
  public roles: Array<string>;
  public photoUrl: string;
  public coverUrl: string;
  public themeSource: string;
  public themeStyle: string;
  public securityStamp: string;

  /**
   * Creates a new AuthUser instance from a JWT payload.
   *
   * @param {Record<string, any>} [payload] - The JWT payload.
   */
  constructor(payload?: Record<string, any>) {
    this.id = getCachedJwtValue(payload, 'sub');
    this.username = getCachedJwtValue(payload, 'username');
    this.displayName = getCachedJwtValue(payload, 'displayName');
    this.hasPassword = getCachedJwtValue(
      payload,
      'hasPassword',
      ParseType.BOOLEAN,
    );
    this.email = getCachedJwtValue(payload, 'email');
    this.emailConfirmed = getCachedJwtValue(
      payload,
      'emailConfirmed',
      ParseType.BOOLEAN,
    );
    this.firstName = getCachedJwtValue(payload, 'firstName');
    this.lastName = getCachedJwtValue(payload, 'lastName');
    this.birthDate = getCachedJwtValue(payload, 'birthDate');
    this.roles = getCachedJwtValue(payload, 'roles');
    this.photoUrl = getCachedJwtValue(payload, 'photoUrl');
    this.coverUrl = getCachedJwtValue(payload, 'coverUrl');
    this.themeSource = getCachedJwtValue(payload, 'themeSource');
    this.themeStyle = getCachedJwtValue(payload, 'themeStyle');
    this.securityStamp = getCachedJwtValue(payload, 'securityStamp');
  }
}

/**
 * Represents an authenticated user's principal.
 */
export class AuthPrincipal {
  public user: AuthUser;

  /**
   * Checks if the user is authenticated.
   *
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  public get isAuthenticated() {
    return !!this.user;
  }

  /**
   * Creates a new AuthPrincipal instance.
   *
   * @param {AuthUser} user - The authenticated user.
   */
  constructor(user: AuthUser) {
    this.user = user;
  }

  /**
   * Checks if the user has a specific role.
   *
   * @param {string} name - The role name.
   * @returns {boolean} True if the user has the role, false otherwise.
   */
  public isInRole(name: string): boolean {
    return this.user.roles.includes(name);
  }

  /**
   * Checks if the user has at least one of the specified roles.
   *
   * @param {...string} names - The role names.
   * @returns {boolean} True if the user has at least one of the roles, false otherwise.
   */
  public someRoles(...names: Array<string>): boolean {
    return names.some((name) => this.user.roles.includes(name));
  }

  /**
   * Checks if the user has all of the specified roles.
   *
   * @param {...string} names - The role names.
   * @returns {boolean} True if the user has all of the roles, false otherwise.
   */
  public everyRoles(...names: Array<string>): boolean {
    return names.every((name) => this.user.roles.includes(name));
  }
}
