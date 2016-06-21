import { createMixin } from 'denali';

export default createMixin((MixinBase) =>
  class TrackableMixin extends MixinBase {

    static isTrackable = true;

  }
);

