import { INotifiable } from '../notifiable';
import { INotification } from '../notification';
import { NotificationManager } from '../notification.manager';

export type NotificationChannelClassType<T extends INotificationChannel> = new (manager: NotificationManager, config: INotificationChannel & any) => T;

export interface INotificationChannel {
    readonly name: string;
    readonly type: string;

    init(): Promise<void>;
    send(notifiable: INotifiable, notification: INotification): Promise<boolean>;
}
