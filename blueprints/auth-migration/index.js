import moment from 'moment';
import snakeCase from 'lodash/snakeCase';
import camelCase from 'lodash/camelCase';
import { pluralize } from 'inflection';
import { Blueprint } from 'denali';

export default class AuthMigrationsBlueprint extends Blueprint {

  static blueprintName = 'auth-migrations';
  static description = 'Generates migrations needed for the given mixins against the given model';

  params = [ 'model', 'mixins' ];

  locals({ model, mixins }) {
    let data = {
      filename: `${ moment().format('X') }-add-auth-columns-to-${ model }`,
      table: snakeCase(pluralize(model)),
      tableVar: camelCase(pluralize(model))
    };
    mixins.forEach((m) => {
      data[m] = true;
    });
    return data;
  }

}
