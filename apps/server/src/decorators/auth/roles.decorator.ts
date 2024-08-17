import { SetMetadata } from '@nestjs/common';

/**
 * The key used by the Roles decorator to store role metadata.
 * This key is used internally by NestJS to retrieve the roles in guards.
 */
export const ROLES_KEY = 'roles';

/**
 * A decorator that assigns roles to route handlers.
 * Roles can be used in conjunction with guards to restrict access to specific endpoints.
 *
 * @param roles - A list of roles that have access to the route.
 *
 * @example
 * ```typescript
 * @Roles('admin', 'user')
 * @Get('dashboard')
 * getDashboard() {
 *   // logic here
 * }
 * ```
 *
 * @returns A SetMetadata decorator that stores the roles under the `ROLES_KEY`.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
