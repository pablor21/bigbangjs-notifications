import { INotification } from '../notification';
import { NotificationManager } from '../notification.manager';
import { INotificationChannel } from '../channel';
import { INotifiable } from './notifiable.interface';

export class AnonymousNotifiable implements INotifiable {

    public readonly routes: Map<string, any> = new Map();
    protected manager: NotificationManager;


    public setNotificationManager(manager: NotificationManager): void {
        this.manager = manager;
    }

    public route(channel: string, route: any): AnonymousNotifiable {
        this.routes.set(channel, route);
        return this;
    }

    public getRouteFor<RecipientType = any>(channel: string, channelInstance?: INotificationChannel): Promise<RecipientType> {
        return this.routes.get(channel);
    }

    public async notify(notification: INotification): Promise<void> {
        return this.manager.notify(this, notification);
    }

}
