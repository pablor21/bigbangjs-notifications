import { INotificationChannel } from './channel';
import { INotifiable } from './notifiable';
import { NotificationManager } from './notification.manager';
import { INotification } from './notification/notification.interface';
import { IQueueNotificaton } from './notification/queueablenotification.interface';

export class NotificationRequest {

    constructor(public readonly manager: NotificationManager, public notifiables?: INotifiable | INotifiable[], public notification?: INotification | IQueueNotificaton) {
    }

    public for(notifiables: INotifiable | INotifiable[]): NotificationRequest {
        this.notifiables = this.notifiables || [];
        if (!Array.isArray(this.notifiables)) {
            this.notifiables = [this.notifiables];
        }
        if (!Array.isArray(notifiables)) {
            notifiables = [notifiables];
        }
        this.notifiables.push(...notifiables);
        return this;
    }

    public notify(notification: INotification | IQueueNotificaton): NotificationRequest {
        this.notification = notification;
        return this;
    }

    public async send(channels?: (string | INotificationChannel)[]) {
        return this.manager.send(this, channels);
    }

    sendNow(channels?: (string | INotificationChannel)[]) {
        return this.manager.sendNow(this, channels);
    }

}
