import { createMixin, hasOne, attr, Errors } from 'denali';

export default createMixin((MixinBase) =>
  class InvitableMixin extends MixinBase {

    static isInvitable = true;

    static invitation = hasOne('invitation');
    static invitationUsedAt = attr('date');

    async save() {
      if (this.isNew) {
        if (!this.invitation) {
          throw new Errors.UnprocessableEntity('Missing invitation code');
        }
        let Invitation = this.modelFor('invitation');
        let invitation = Invitation.find({ value: this.invitation });
        if (!invitation) {
          throw new Errors.UnprocessableEntity('Invalid invitation code');
        }
        invitation.deleted = true;
        await invitation.save();
        this.invitation = invitation;
        this.invitationUsedAt = new Date();
        return super.save(...arguments);
      }
      return super.save(...arguments);
    }

  }
);
