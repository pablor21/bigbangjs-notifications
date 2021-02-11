/* eslint-disable dot-notation */
import { INotifiable } from '../notifiable';
import { NotificationManager } from '../notification.manager';
import { INotification } from './notification.interface';

export abstract class Notification implements INotification {

    public manager: NotificationManager;
    public channels: string[] = [];
    public data: any = {};

    constructor(data: any = {}) {
        this.data = data;
    }


    /**
     * Obtains the available channels for the notification
     * You may use the notifiable object to determine wich channels
     * are available for the notifiable
     * @param notifiable the notifiable object
     */
    public async getChannelsFor(notifiable: INotifiable): Promise<string[]> {
        return this.channels;
    }

}
