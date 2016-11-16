import { createMixin, hasOne, attr, Errors } from 'denali';

export default createMixin((MixinBase) =>
  class InvitableMixin extends MixinBase {

    static isInvitable = true;

    static invitation = hasOne('invitation');
    static invitationUsedAt = attr('date');

    static async sendInvitationEmail(email, invitation) {
      if (!invitation) {
        let Invitation = this.modelFor('invitation');
        invitation = Invitation.create({ invitedEmail: email });
        await invitation.save();
      }
      this.service('mailer').send('invitation', { invitation });
    }

    static async register() {
      if (!this.invitation) {
        throw new Errors.UnprocessableEntity('Missing invitation code');
      }
      let Invitation = this.modelFor('invitation');
      let invitation = Invitation.find({ value: this.invitation });
      if (!invitation) {
        throw new Errors.UnprocessableEntity('Invalid invitation code');
      }
      if (invitation.used) {
        throw new Errors.Conflict('That invitation was already used');
      }
      invitation.used = true;
      invitation.usedAt = new Date();
      await invitation.save();
      await this.setInvitation(invitation);
      return super.save(...arguments);
    }

  }
);
