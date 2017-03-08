import defaults from 'lodash/defaults';
import forIn from 'lodash/forIn';
import { Container } from 'denali';
import MemoryAdapter from 'denali/app/orm-adapters/memory';
import FlatSerializer from 'denali/app/serializers/flat';

export default function setupBasicContainer(options = {}) {
  options = defaults(options, {
    'orm-adapter:memory': MemoryAdapter,
    'serializer:application': FlatSerializer,
    'config:environment': { ormAdapter: 'memory' }
  });

  let container = new Container();
  forIn(options, (value, key) => {
    container.register(key, value);
  });

  return container;
}
