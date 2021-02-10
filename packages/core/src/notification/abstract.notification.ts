/* eslint-disable dot-notation */
import { INotifiable } from '../notifiable';
import { NotificationManager } from '../notification.manager';
import { INotification } from './notification.interface';

export abstract class AbstractNotification implements INotification {

    public manager: NotificationManager;
    public channels: string[] = [];
    public data: any = {};

    constructor(data: any = {}) {
        this.data = data;
    }


    public async getChannels(notifiable: INotifiable): Promise<string[]> {
        return this.channels;
    }

}
