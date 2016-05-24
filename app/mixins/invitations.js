import { createMixin, hasOne, attr, Errors } from 'denali';

export default createMixin(() =>
  class InvitableMixin {

    static isInvitable = true;

    static invitation = hasOne('invitation');
    static invitationUsedAt = attr('date');

    save() {
      if (this.isNew) {
        if (!this.invitation) {
          throw new Errors.UnprocessableEntity('Missing invitation code');
        }
        let Invitation = this.modelFor('invitation');
        return Invitation.find({ value: this.invitation })
          .then((invitation) => {
            if (!invitation) {
              throw new Errors.UnprocessableEntity('Invalid invitation code');
            }
            invitation.deleted = true;
            return invitation.save();
          }).then((invitation) => {
            this.invitation = invitation;
            this.invitationUsedAt = new Date();
            return super.save(...arguments);
          });
      }
      return super.save(...arguments);
    }

  }
);

