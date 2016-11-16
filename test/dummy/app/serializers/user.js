import ApplicationSerializer from './application';

export default class UserSerializer extends ApplicationSerializer {

  static attributes = [
    'email',
    'facebookId'
  ];

}
