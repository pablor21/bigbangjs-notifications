import { INotifiable } from '../notifiable';
import { INotification } from '../notification';
import { NotificationManager } from '../notification.manager';
import { NotificationResult } from '../types';
import { EventEmitter } from 'events';
import { NotificationChannelDataType } from './types';
export type NotificationChannelClassType<T extends INotificationChannel> = new (manager: NotificationManager, config: INotificationChannel & any) => T;

export interface INotificationChannel<DataType extends NotificationChannelDataType = NotificationChannelDataType> extends EventEmitter {
    readonly name: string;
    readonly type: string;

    /**
     * Initializes the channel (connect to the provider?)
     */
    init(): Promise<void>;

    /**
     * Send a simple notification
     * @param data
     */
    send(data: DataType): Promise<NotificationResult>;

    /**
     * Prepare the data to be sent in the send method
     * @param notifiable the notifiable object
     * @param notification the notification
     */
    prepare(notifiable: INotifiable, notification: INotification): Promise<DataType>;

}
