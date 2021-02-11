import { INotificationChannel } from '../channel';
import { INotification } from '../notification';

export interface INotifiable {
    /**
     * Obtains the recipient for the channel and notification object
     * @param channel the notification chanel
     * @param notification the notification object
     */
    getRouteFor<RecipientType = any>(channel: string | INotificationChannel, notification: INotification): Promise<RecipientType>;
}
