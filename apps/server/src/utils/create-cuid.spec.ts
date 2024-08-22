import {
  createCustomTokenGenerator,
  generateFingerprint,
} from './create-cuid.util';
import os from 'os';

describe('Enhanced Token Generator Tests', () => {
  it('should generate a token of the specified length', () => {
    const length = 16;
    const generateVerificationToken = createCustomTokenGenerator(length);
    const token = generateVerificationToken();

    expect(token).toHaveLength(length);
  });

  it('should generate unique tokens', () => {
    const generateVerificationToken = createCustomTokenGenerator(16);
    const token1 = generateVerificationToken();
    const token2 = generateVerificationToken();

    expect(token1).not.toEqual(token2);
  });

  it('should include dynamic fingerprint components in the generated fingerprint', () => {
    const fingerprint = generateFingerprint();
    const hostname = os.hostname();
    const environment = process.env.NODE_ENV || 'development';
    const processId = process.pid;

    const [generatedHostname, generatedEnvironment, , generatedProcessId] =
      fingerprint.split('|');

    expect(generatedHostname).toBe(hostname);
    expect(generatedEnvironment).toBe(environment);
    expect(parseInt(generatedProcessId)).toBe(processId);
  });
  it('should generate a token with a custom fingerprint', () => {
    const customFingerprint = 'custom-fingerprint-unique';
    const generateVerificationToken = createCustomTokenGenerator(
      16,
      customFingerprint,
    );
    const token = generateVerificationToken();

    expect(token).toBeDefined();
  });

  it('should generate a token with the default dynamic fingerprint if none is provided', () => {
    const generateVerificationToken = createCustomTokenGenerator(16);
    const token = generateVerificationToken();

    expect(token).toBeDefined();
  });
});
