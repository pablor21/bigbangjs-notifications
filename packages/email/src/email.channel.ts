/* eslint-disable dot-notation */
import { INotifiable, INotification, INotificationChannel, NotifyExceptionType, objectNull, throwError, NotificationManager, AbstractChannel, NotificationResult } from '@bigbangjs/notify';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EmailMessage } from './email.message';
import { EmailChannelConfig } from './types';

export class EmailChannel extends AbstractChannel<EmailChannelConfig> implements INotificationChannel {

    protected _client: Mail;

    public async init(): Promise<void> {
        this._client = createTransport(this.config.transport);
    }

    public async prepare(notifiable: INotifiable, notification: INotification): Promise<any> {
        const params: Partial<Mail.Options> = {
            from: `${this.config.fromName} ${this.config.from}`,
            to: await this.getRecipient<string | Mail.Address | (string | Mail.Address)[]>(notifiable, notification),
        };

        const message = await super.getMessage<EmailMessage>(notifiable, notification, EmailMessage);
        if (!message) {
            return;
        }
        Object.assign(params, message.params);
        return params;
    }

    public async send(params: any): Promise<NotificationResult> {
        // default params
        const response = await this._client.sendMail(params);
        const success = response?.accepted?.length > 0;

        return {
            type: 'SENT',
            params,
            success,
            channel: this,
            nativeResponse: response,
        };
    }

}
