/* eslint-disable dot-notation */
import { INotifiable, INotification, INotificationChannel, NotifyExceptionType, objectNull, throwError, NotificationManager, AbstractChannel } from '@bigbangjs/notify';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EmailMessage } from './email.message';
import { EmailChannelConfig } from './types';

export class EmailChannel extends AbstractChannel<EmailChannelConfig> implements INotificationChannel {

    protected _client: Mail;

    public async init(): Promise<void> {
        this._client = createTransport(this.config.transport);
    }

    public async send(notifiable: INotifiable, notification: INotification): Promise<any> {
        // default params
        const params: Partial<Mail.Options> = {
            from: `${this.config.fromName} ${this.config.from}`,
            to: await notifiable.getRouteFor(this.name),
        };

        const message = await super.getMessage<EmailMessage>(notifiable, notification, EmailMessage);
        if (!message) {
            return;
        }
        Object.assign(params, message.params);
        return this._client.sendMail(params);
    }

}
