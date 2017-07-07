import { createMixin, hasOne, attr, Errors, Model } from 'denali';
import * as createDebug from 'debug';
import { returnof } from 'denali-typescript';
import RegisterableMixin from './registerable';

const debug = createDebug('denali-auth:invitable');
const Registerable = returnof(RegisterableMixin._factory, Model);

export default createMixin((BaseModel: typeof Registerable) =>
  class InvitableMixin extends BaseModel {

    static isInvitable = true;

    static invitation = hasOne('invitation');
    static invitationUsedAt = attr('date');

    static async invite(email: string, from: Model, resend: boolean) {
      let user = await this.findOne({ email });
      if (user) {
        throw new Errors.Conflict('User already exists');
      }
      let Invitation = this.modelFor('invitation');
      let invitation = await Invitation.findOne({ invitedEmail: email });
      if (!invitation) {
        debug(`creating invitation for ${ email } from ${ from.type } ${ from.id }`);
        invitation = await Invitation.create({
          userType: this.type,
          fromType: from.type,
          fromId: from.id,
          invitedEmail: email
        });
      } else if (!resend) {
        debug(`invitation for ${ email } was already sent, and resend flag was not supplied, so erroring out`);
        throw new Errors.Conflict('Invitation already sent');
      }
      debug(`emailing invitation to ${ email }`);
      await (<any>this.service('mailer')).send('invitation', { invitation });
      return invitation;
    }

    static async register(attributes: any) {
      debug(`checking in new user registration has a valid invitation (invite token: ${ attributes.invitation })`);
      if (!attributes.invitation) {
        throw new Errors.UnprocessableEntity('Missing invitation code');
      }
      let Invitation = this.modelFor('invitation');
      let invitation = await Invitation.findOne({ token: attributes.invitation });
      if (!invitation) {
        debug(`Invitation code ${ attributes.invitation } does not exist, blocking registration`);
        throw new Errors.UnprocessableEntity('Invalid invitation code');
      }
      if (invitation.used) {
        debug(`Invitation code ${ attributes.invitation } was already used, blocking registration`);
        throw new Errors.Conflict('That invitation was already used');
      }
      debug('invitation is valid, marking it as used and allowing registration to proceed');
      invitation.used = true;
      invitation.usedAt = new Date();
      await invitation.save();
      attributes.invitation = invitation;
      return super.register(attributes);
    }

  }
);
