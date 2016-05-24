import { createMixin } from 'denali';

export default createMixin(() =>
  class TrackableMixin {

    static isTrackable = true;

  }
);

