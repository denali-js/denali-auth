import { createMixin } from 'denali';

export default createMixin((MixinBase) => {
  return class FetchableMixin extends MixinBase {

    static isFetchable = true;

  };
});
