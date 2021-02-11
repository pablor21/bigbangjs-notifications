import { INotifiable } from '../notifiable';
import { INotificationChannel } from '../channel';
import { NotificationManager } from '../notification.manager';

export interface INotification {
    manager: NotificationManager;
    /**
     * Obtains the channels for the notifiable
     * @param notifiable the notifiable object
     */
    getChannelsFor(notifiable: INotifiable): Promise<string[]>;

}
