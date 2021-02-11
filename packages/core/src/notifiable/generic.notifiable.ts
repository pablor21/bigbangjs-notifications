import { INotificationChannel } from '../channel';
import { INotification } from '../notification';
import { INotifiable } from './notifiable.interface';

/**
 * Represents a generic notifiable with the basic methods to
 * be able of beign notified
 */
export class GenericNotifiable implements INotifiable {

    public readonly routes: Map<string, any> = new Map();

    public route(channel: string, route: any): GenericNotifiable {
        this.routes.set(channel, route);
        return this;
    }

    public getRouteFor<RecipientType = any>(channel: string | INotificationChannel, notification: INotification): Promise<RecipientType> {
        if (typeof (channel) === 'string') {
            return this.routes.get(channel);
        }
        return this.routes.get(channel.name) || this.routes.get(channel.type);
    }


}
