import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';

// Parse configuration files
let rawConfigs: any[] = [];

if (process.env.CONFIG_FILE) {
  // Load the configuration file specified by the environment variable
  rawConfigs = [path.resolve(process.env.CONFIG_FILE)];
} else {
  // Load default configuration files
  rawConfigs = [
    path.resolve('/etc/chats/config.yaml'),
    path.resolve('./config.yaml'),
  ];
}

// Read and parse existing configuration files
rawConfigs = rawConfigs
  .filter(fs.existsSync)
  .map((file) => fs.readFileSync(file, 'utf-8'))
  .map((content) => yaml.parse(content));

// If no configuration files were found, log a message and initialize with an empty config
if (rawConfigs.length === 0) {
  console.log(
    'No chats configuration files detected. Will read from environment variables or use default configurations.',
  );
  rawConfigs.push({});
}

// Merge configurations recursively with the following priority:
// env > config.{NODE_ENV}.yaml > config.yaml > /etc/chats/config.yaml > defaults
const config = _.merge({}, ...rawConfigs);

/**
 * Retrieve the value of a configuration item
 * @param key The key of the configuration item, sub-items can be selected using dot notation, e.g., app.port
 * @param defaultValue The default value to use if the key is not found
 * @returns The value of the configuration item or the default value
 */
export const loadConfig = (key: string, defaultValue?: any) => {
  const envKey = key
    .split('.')
    .map((x) => x.toUpperCase())
    .join('_');

  return (
    process.env[envKey] ||
    _.get(
      config,
      key,
      defaultValue instanceof Function ? defaultValue() : defaultValue,
    )
  );
};

// Export the version from the environment variables or default to 'dev'
export const version = process.env['VERSION'] || 'dev';
