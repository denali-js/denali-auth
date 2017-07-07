import { createMixin, Model } from 'denali';

export default createMixin((BaseModel: typeof Model) => {
  return class FetchableMixin extends BaseModel {

    static isFetchable = true;

  };
});
