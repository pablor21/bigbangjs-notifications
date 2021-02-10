/* eslint-disable dot-notation */
import { INotifiable, INotification, AbstractChannel, INotificationChannel, NotifyExceptionType, objectNull, throwError, NotificationManager, ClassType } from '@bigbangjs/notify';
import Vonage from '@vonage/server-sdk';
import { SmsMessage } from './sms.message';
import { SmsParams, VonageChannelOptions } from './types';

export class SmsChannel extends AbstractChannel<VonageChannelOptions> implements INotificationChannel {

    protected _client: Vonage;


    public async init(): Promise<void> {
        this._client = new Vonage(this.config);
    }

    public async send(notifiable: INotifiable, notification: INotification): Promise<any> {
        // default params
        const params: Partial<SmsParams> = {
            from: this.config.from,
            to: await notifiable.getRouteFor(this.name),
        };

        const message = await super.getMessage<SmsMessage>(notifiable, notification, SmsMessage);
        if (!message) {
            return;
        }
        Object.assign(params, message.params);
        return new Promise((resolve, reject) => this._client.message.sendSms(params.from, params.to, params.text, params.options, (err, res) => {
            if (err) {
                reject(err);
            } else {
                if (res.messages[0].status !== '0') {
                    reject(res.messages[0]['error-text']);
                } else {
                    resolve(res);
                }
            }
        }));
    }

}
