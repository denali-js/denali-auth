import { authRoutesFor } from '../../../app';
export default function drawRoutes(router) {

  router.get('/', 'index');
  authRoutesFor('user', router);

}
