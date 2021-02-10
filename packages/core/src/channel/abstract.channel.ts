import { NotifyExceptionType, throwError } from '../exceptions';
import { camelize, objectNull } from '../lib';
import { INotifiable } from '../notifiable';
import { INotification } from '../notification';
import { NotificationManager } from '../notification.manager';
import { ClassType } from '../types';
import { INotificationChannel } from './channel.interface';
import { NotificationChannelConfig } from './types';

export abstract class AbstractChannel<ConfigType extends NotificationChannelConfig = NotificationChannelConfig> implements INotificationChannel {

    public readonly name: string;
    public readonly type: string;
    public readonly config: ConfigType;
    public readonly manager: NotificationManager;

    constructor(manager: NotificationManager, config: ConfigType) {
        this.manager = manager;
        this.config = this.parseConfig(config);
        this.name = this.config.name;
        this.type = this.config.type;
    }


    public abstract init(): Promise<void>;
    public abstract send(notifiable: INotifiable, notification: INotification): Promise<boolean>;


    protected parseConfig(config: ConfigType): ConfigType {
        return config;
    }

    protected getMethodName(): string {
        return camelize(`to ${this.type}`);
    }

    protected async getRecipient(notifiable: INotifiable): Promise<any> {
        return notifiable.getRouteFor(this.type, this);
    }

    protected async getMessage<T>(notifiable: INotifiable, notification: INotification, messageType: ClassType<T>): Promise<T> {
        const methodName = this.getMethodName();
        let message: T;
        if (typeof (notification[methodName]) === 'function') {
            message = await notification[methodName](notifiable, this);
        } else {
            this.manager.log('warn', `No method for channel ${this.name} on ${notification}`);
            return;
        }
        if (objectNull(message) || !(message instanceof messageType)) {
            throwError('Invalid sms message!', NotifyExceptionType.INVALID_PARAMS);
        }

        return message;
    }

}
