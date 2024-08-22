import os from 'os';
import { randomUUID } from 'crypto';
import { init } from '@paralleldrive/cuid2';

/**
 * Generates a highly unique fingerprint using multiple entropy sources:
 * - Hostname
 * - Environment variable
 * - Timestamp
 * - Process ID
 * - Random UUID
 * @returns {string} - The generated fingerprint string.
 */
export const generateFingerprint = (): string => {
  const hostname = os.hostname();
  const environment = process.env.NODE_ENV || 'development';
  const timestamp = Date.now();
  const processId = process.pid;
  const uuid = randomUUID();

  return `${hostname}|${environment}|${timestamp}|${processId}|${uuid}`;
};
/**
 * Configuration for generating verification tokens.
 * @param length - The length of the token.
 * @param fingerprint - Optional fingerprint string to add additional entropy. Uses a highly unique dynamic fingerprint by default.
 */
export const createCustomTokenGenerator = (
  length: number = 10,
  fingerprint: string = generateFingerprint(),
) => {
  const createId = init({
    random: Math.random,
    length,
    fingerprint,
  });

  /**
   * Generates a unique verification token.
   * @returns {string} - A unique token string.
   */
  const generateToken = (): string => {
    return createId();
  };

  return generateToken();
};
