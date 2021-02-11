/* eslint-disable dot-notation */
import { INotifiable, INotification, AbstractChannel, INotificationChannel, NotifyExceptionType, objectNull, throwError, NotificationManager, ClassType, NotificationResult, NotificationChannelDataType } from '@bigbangjs/notify';
import Vonage from '@vonage/server-sdk';
import { SmsMessage } from './sms.message';
import { SmsParams, VonageChannelOptions } from './types';


const defaultConfig: Partial<VonageChannelOptions> = {
    supportsBulk: true,
    bulkSize: 10,
    maxBulkSize: 100,
};

export class SmsChannel extends AbstractChannel<NotificationChannelDataType, VonageChannelOptions> implements INotificationChannel {

    protected _client: Vonage;

    constructor(manager: NotificationManager, config: VonageChannelOptions) {
        super(manager, Object.assign(defaultConfig, config));

    }

    public async init(): Promise<void> {
        this._client = new Vonage(this.config);
    }


    public async prepare(notifiable: INotifiable, notification: INotification): Promise<NotificationChannelDataType> {
        const defaultParams: Partial<SmsParams> = {
            from: this.config.from,
            to: await this.getRecipient(notifiable, notification),
        };

        const params = await super.prepare(notifiable, notification);
        Object.assign(defaultParams, params);
        return defaultParams as NotificationChannelDataType;
    }

    public async sendBulk(data: any): Promise<NotificationResult[]> {
        // the vonage sms service doesn't allow to send the sms to bulk so we need to send one for each
        const response: NotificationResult[] = [];
        await Promise.all(data.recipients.map(async (recipient: any) => {
            const params = { ...data.data, to: recipient };
            try {
                response.push(await this.send(params));
            } catch (ex) {
                response.push({
                    type: 'ERROR',
                    params,
                    recipients: [params.to],
                    success: false,
                    shouldRetry: true,
                    channel: this,
                    nativeResponse: ex,
                });
            }
        }));
        return response;
    }

    public async send(params: any): Promise<NotificationResult> {
        try {
            // default params
            const response = await (new Promise((resolve, reject) => {
                this._client.message.sendSms(params.from, params.to, params.text, params.options, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (res.messages[0].status !== '0') {
                            reject(res.messages[0]);
                        } else {
                            resolve(res);
                        }
                    }
                });
            }));
            const success = true;
            return {
                type: 'SENT',
                params,
                success,
                recipients: [params.to],
                shouldRetry: true,
                channel: this,
                nativeResponse: response,
            };
        } catch (ex) {
            return {
                type: 'ERROR',
                params,
                recipients: [params.to],
                success: false,
                shouldRetry: true,
                channel: this,
                nativeResponse: ex,
            };
        }

    }

}
