/**
 * Platform matrix — one definition per execution target.
 *
 * `npm run test:<platform>:<suite>` resolves through here, so adding a device
 * farm or a tablet profile is a data change, not a code change.
 */
export const PLATFORMS = Object.freeze({
  web: {
    key: 'web',
    label: 'Web (Chromium)',
    kind: 'browser',
    suites: ['smoke', 'e2e', 'regression'],
    native: false,
  },
  android: {
    key: 'android',
    label: 'Android emulator',
    kind: 'native',
    suites: ['smoke', 'e2e'],
    native: true,
    appId: 'com.example.hostelhub',
  },
  ios: {
    key: 'ios',
    label: 'iOS simulator',
    kind: 'native',
    suites: ['smoke', 'e2e'],
    native: true,
    appId: 'com.example.hostelhub',
  },
});

export const platformList = () => Object.values(PLATFORMS);

export function resolvePlatform(name) {
  const platform = PLATFORMS[name];
  if (!platform) {
    throw new Error(`Unknown platform "${name}". Use one of: ${Object.keys(PLATFORMS).join(', ')}`);
  }
  return platform;
}
