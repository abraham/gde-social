import { version, buildStatus } from './status';
import { status } from './data/status.data';

test('version', () => {
  expect(version).toEqual(2);
});

beforeEach(() => {
  jest.spyOn(global.Date, 'now').mockImplementation(() => 123456789);
});

afterEach(() => {
  jest.clearAllMocks();
});

test('buildStatus', () => {
  expect(buildStatus(status)).toEqual({
    createdAt: 1142974214000,
    data: JSON.stringify(status),
    hasLinks: false,
    hashtags: {},
    updatedAt: Date.now(),
    version: 2,
  });
});
