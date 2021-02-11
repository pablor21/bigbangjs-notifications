/* eslint-disable dot-notation */
import { INotifiable, INotification, AbstractChannel, NotificationResult, IBulkChannel, NotificationManager, NotificationChannelDataType } from '@bigbangjs/notify';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EmailMessage } from './email.message';
import { EmailChannelConfig } from './types';

const defaultConfig: Partial<EmailChannelConfig> = {
    supportsBulk: true,
    bulkSize: 10,
    maxBulkSize: 100,
};

export class EmailChannel extends AbstractChannel<NotificationChannelDataType, EmailChannelConfig> implements IBulkChannel<any> {

    protected _client: Mail;

    constructor(manager: NotificationManager, config: EmailChannelConfig) {
        super(manager, Object.assign(defaultConfig, config));

    }

    public async init(): Promise<void> {
        this._client = createTransport(this.config.transport);
    }

    public async prepare(notifiable: INotifiable, notification: INotification): Promise<NotificationChannelDataType> {
        const defaultParams: Partial<Mail.Options> = {
            from: `${this.config.fromName} ${this.config.from}`,
            to: await this.getRecipient<string | Mail.Address | (string | Mail.Address)[]>(notifiable, notification),
        };
        const params = await super.prepare(notifiable, notification);
        Object.assign(defaultParams, params);
        return defaultParams as NotificationChannelDataType;
    }


    public async sendBulk(data: any): Promise<NotificationResult[]> {
        // the email doesn't allow to send the email to bulk so we need to send one for each
        const response: NotificationResult[] = [];
        await Promise.all(data.recipients.map(async (recipient: any) => {
            const params = { ...data.data, to: recipient };
            try {
                response.push(await this.send(params));
            } catch (ex) {
                response.push({
                    type: 'ERROR',
                    params,
                    success: false,
                    channel: this,
                    nativeResponse: ex,
                });
            }
        }));
        return response;
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
