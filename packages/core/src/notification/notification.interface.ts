import { INotificationChannel } from '../channel';
import { INotifiable } from '../notifiable';

export interface INotification {
    /**
     * Obtains the channels for the notifiable
     * @param notifiable the notifiable object
     */
    getChannelsFor(notifiable: INotifiable): Promise<string[]>;

    /**
     * Obtains if the notification has no variable
     * data between notifiables (the method toChannel will be called only once)
     * The channel will handle how to send the data to all recipients
     * @param channel the channel
     */
    isBulkFor(channel: INotificationChannel): Promise<boolean>;

}
