import { authRoutesFor } from 'denali-auth';
export default function drawRoutes(router) {

  router.get('/', 'index');
  authRoutesFor('user', router);

}
