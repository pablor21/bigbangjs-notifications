import { INotifiable } from '../notifiable';
import { INotification } from '../notification';
import { NotificationManager } from '../notification.manager';
import { NotificationResult } from '../types';
import { EventEmitter } from 'events';
export type NotificationChannelClassType<T extends INotificationChannel> = new (manager: NotificationManager, config: INotificationChannel & any) => T;

export interface INotificationChannel extends EventEmitter {
    readonly name: string;
    readonly type: string;

    /**
     * Initializes the channel (connect to the provider?)
     */
    init(): Promise<void>;
    /**
     * Sends a notification
     * @param notifiable the notifiable object
     * @param notification the notification object
     */
    send(args: any): Promise<NotificationResult>;

    /**
     * Prepare the data to be sent in the send method
     * @param notifiable the notifiable object
     * @param notification the notification
     */
    prepare(notifiable: INotifiable, notification: INotification): Promise<any>;

    serializeData(notifiable: INotifiable, notification: INotification): Promise<any>;

    unserializeData(data: any): Promise<any>;
}
