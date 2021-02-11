import { NotifyExceptionType, throwError } from '../exceptions';
import { camelize, objectNull } from '../lib';
import { INotifiable } from '../notifiable';
import { IMessage, INotification } from '../notification';
import { NotificationManager } from '../notification.manager';
import { ClassType, NotificationResult } from '../types';
import { INotificationChannel } from './channel.interface';
import { NotificationChannelConfig, NotificationChannelDataType } from './types';
import { EventEmitter } from 'events';
import { IQueueableChannel } from './queueablechannel.interface';

export abstract class AbstractChannel<DataType extends NotificationChannelDataType = NotificationChannelDataType, ConfigType extends NotificationChannelConfig = NotificationChannelConfig>
    extends EventEmitter implements INotificationChannel<DataType>, IQueueableChannel<DataType> {

    public readonly name: string;
    public readonly type: string;
    public readonly config: ConfigType;
    public readonly manager: NotificationManager;

    constructor(manager: NotificationManager, config: ConfigType) {
        super();
        this.manager = manager;
        this.config = this.parseConfig(config);
        this.name = this.config.name;
        this.type = this.config.type;
    }

    public supportsBulk(): boolean {
        return this.config.supportsBulk;
    }


    public abstract init(): Promise<void>;
    public abstract send(args: DataType): Promise<NotificationResult>;

    public async serializeData(data: DataType): Promise<any> {
        return data;
    }

    public async unserializeData(data: any): Promise<DataType> {
        return data;
    }


    /**
     * Parses the notification
     * @param config the configuration object
     */
    protected parseConfig(config: ConfigType): ConfigType {
        return config;
    }

    /**
     * Obtains the function name to call on the notifiable object to obtains the recipients
     * @param notifiable the notifiable object
     */
    protected getNotifiableMethodName(notifiable: INotifiable): string {
        if (objectNull(notifiable)) {
            return null;
        }
        // first option getRouteForName
        let methodName = camelize(`getRouteFor ${this.name}`);
        if (typeof (notifiable[methodName]) !== 'function') {
            // second option getRouteForType
            methodName = camelize(`getRouteFor ${this.type}`);
            if (typeof (notifiable[methodName]) !== 'function') {
                // third method a single getRouteFor
                methodName = 'getRouteFor';
                if (typeof (notifiable[methodName]) !== 'function') {
                    return null;
                }
            }
        }
        return methodName;

    }

    /**
     * Obtains the function to call on the notification object to obtain the message object
     * @param notification the notification object
     */
    protected getNotificationMethodName(notification: INotification): string {
        if (objectNull(notification)) {
            return null;
        }
        // first method to check toName
        let methodName = camelize(`to ${this.name}`);
        if (typeof (notification[methodName]) !== 'function') {
            // second option to check toType
            methodName = camelize(`to ${this.type}`);
            // no method found
            if (typeof (notification[methodName]) !== 'function') {
                return null;
            }
        }
        return methodName;
    }

    /**
     * Obtains the recipient
     * @param notifiable the notifiable object
     * @param notification the notification object
     */
    protected async getRecipient<T>(notifiable: INotifiable, notification: INotification): Promise<T | undefined> {
        const notifiableMethodName = this.getNotifiableMethodName(notifiable);
        if (!notifiableMethodName) {
            this.manager.log('warn', `No message for channel ${this.name} on ${notification}`);
            return;
        }
        const recipient: T = await notifiable[notifiableMethodName](this, notification);
        return recipient;
    }

    /**
     * Obtains the message
     * @param notifiable the notifiable object
     * @param notification the notification object
     * @param messageType the expected message type
     */
    protected async getMessage<T extends IMessage>(notifiable: INotifiable, notification: INotification, messageType?: ClassType<any>): Promise<T | undefined> {
        const notificationMethodName = this.getNotificationMethodName(notification);
        if (!notificationMethodName) {
            this.manager.log('warn', `No message for channel ${this.name} on ${notification}`);
            return;
        }

        const message: T = await notification[notificationMethodName](this, notifiable);

        if (objectNull(message) || (messageType && !(message instanceof messageType))) {
            throwError(`Invalid message type for ${this.name}`, NotifyExceptionType.INVALID_PARAMS, { notification, notifiable, channel: this });
        }

        return message;
    }

    public async prepare(notifiable: INotifiable, notification: INotification): Promise<DataType> {
        const message = await this.getMessage(notifiable, notification);
        if (!message) {
            return;
        }
        return message.getDataForChannel();
    }


    public async prepareBulk(notifiables: INotifiable[], notification: INotification, bulkSize?: number): Promise<DataType[]> {
        bulkSize = bulkSize || this.config.bulkSize;
        if (bulkSize > this.config.maxBulkSize) {
            bulkSize = this.config.maxBulkSize;
        }
        const response: any[] = [];
        const message = await this.getMessage(null, notification);

        // split the data in chunks
        const chunks = notifiables.reduce((all, one, i) => {
            const ch = Math.floor(i / this.config.bulkSize || 1);
            all[ch] = [].concat((all[ch] || []), one);
            return all;
        }, []);

        await Promise.all(chunks.map(async chunk => {
            const recipientsToSend: any = [];
            await Promise.all(chunk.map(async (notifiable: INotifiable) => {
                const recipient = await this.getRecipient(notifiable, notification);
                if (recipient) {
                    recipientsToSend.push(recipient);
                }
            }));
            response.push({
                isBulk: true,
                recipients: recipientsToSend,
                data: await message.getDataForChannel(),
            });
        }));

        return response;
    }

}
