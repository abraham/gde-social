import { activatedClass } from './mdc';

test('activatedClass', () => {
  expect(activatedClass('angular', 'angular')).toEqual('mdc-list-item--activated');
  expect(activatedClass('angular', 'android')).toEqual('');
});
