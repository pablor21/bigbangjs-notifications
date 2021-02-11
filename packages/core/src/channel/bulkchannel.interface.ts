import { INotifiable } from '../notifiable';
import { INotification } from '../notification';
import { NotificationResult } from '../types';
import { NotificationChannelDataType } from './types';

export interface IBulkChannel<DataType extends NotificationChannelDataType = NotificationChannelDataType> {
    /**
     * Prepare a bulk notification to send, will return the data in chunks
     * in case of not being able to send the messages all messages at once
     * @param notifiables the notifiable objects
     * @param notification the notification
     */
    prepareBulk(notifiables: INotifiable[], notification: INotification, bulkSize?: number): Promise<DataType[]>;

    sendBulk(data: any[]): Promise<NotificationResult[]>;
}
