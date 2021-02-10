import { INotificationChannel } from '../channel';
import { NotificationManager } from '../notification.manager';

export interface INotifiable {
    setNotificationManager(manager: NotificationManager): void;
    getRouteFor<RecipientType = any>(type: string, channelInstance?: INotificationChannel): Promise<RecipientType>;
}
