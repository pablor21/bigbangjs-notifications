import { Notification } from '../notification';
import { DelayType, IQueueNotificaton } from './queueablenotification.interface';

export abstract class QueueableNotification extends Notification implements IQueueNotificaton {

    public queueName = 'default';
    public shouldQueue = true;
    public sendDelay: DelayType = null;

    public async serialize(): Promise<any> {
        return this;
    }

    public async unserialize(data: any): Promise<IQueueNotificaton> {
        Object.assign(this, data);
        return this;
    }

    public onQueue(name: string): IQueueNotificaton {
        this.queueName = name;
        return this;
    }

    public delay(delay: DelayType): IQueueNotificaton {
        this.sendDelay = delay;
        return this;
    }

    public instant(isInstant: boolean): IQueueNotificaton {
        this.shouldQueue = !isInstant;
        return this;
    }


}
