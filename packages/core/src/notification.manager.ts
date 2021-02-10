import { VALID_TRANSPORTS_NAMES_REGEX } from './constants';
import { NotifyExceptionType, throwError } from './exceptions';
import { ConsoleLogger, LoggerType, Registry } from './lib';
import { INotifiable } from './notifiable';
import { AnonymousNotifiable } from './notifiable/anonymous.notifiable';
import { INotification } from './notification';
import { INotificationChannel, NotificationChannelClassType, NotificationChannelConfig } from './channel';
import { NotificationManagerConfig } from './types';

const defaultConfigOptions: NotificationManagerConfig = {
    logger: ConsoleLogger,
    autoInitProviders: true,
};

export class NotificationManager {

    public static channelTypes: Registry<string, NotificationChannelClassType<INotificationChannel>> = new Registry();
    public readonly config: NotificationManagerConfig;
    protected readonly channels: Registry<string, INotificationChannel> = new Registry();


    constructor(config?: Partial<NotificationManagerConfig>) {
        this.config = Object.assign({}, defaultConfigOptions, config || {});
        this.log('info', `Notification manager initialized!`);
    }

    public getLoger(): LoggerType {
        if (typeof (this.config.logger) === 'boolean') {
            return this.config.logger === true ? defaultConfigOptions.logger as LoggerType : undefined;
        }
        return this.config.logger as LoggerType;
    }

    public log(level: 'info' | 'debug' | 'warn' | 'error', ...args: any) {
        if (this.getLoger() && this.getLoger()[level]) {
            this.getLoger()[level](...args);
        }
    }

    /**
    * Registers a notification transport type
    * @param name the name of the transport type
    * @param transport the transport type
    */
    public static registerChannelType(name: string, transport: NotificationChannelClassType<INotificationChannel>): void {
        if (!transport || !name.match(VALID_TRANSPORTS_NAMES_REGEX)) {
            throwError(`Invalid transport type`, NotifyExceptionType.INVALID_PARAMS, { name, transport });
        }
        NotificationManager.channelTypes.add(name, transport);
    }

    /**
     * Removes transport type
     * @param name the name of the transport type
     */
    public static unregisterChannelType(name: string): void {
        NotificationManager.channelTypes.remove(name);
    }

    /**
     * Gets a transport type
     * @param name the name of the transport type
     */
    public static getTransportType(name: string): NotificationChannelClassType<INotificationChannel> {
        if (!NotificationManager.channelTypes.has(name)) {
            throwError(`The provider type "${name}" has not been registered yet!`, NotifyExceptionType.NOT_FOUND, { type: name });
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return NotificationManager.channelTypes.get(name)!;
    }

    /**
     * Adds a channel instance
     * @param config the channel configuration
     */
    public async addChannel<T extends INotificationChannel = any>(config: NotificationChannelConfig & any): Promise<T> {
        try {
            const channelClass = NotificationManager.getTransportType(config.type!);
            if (!channelClass) {
                throwError(`The provider type "${config.name}" has not been registered yet!`, NotifyExceptionType.INVALID_PARAMS, { options: config });
            }
            const instance = this.createChannelInstance(channelClass, config);
            if (config.autoInit) {
                await instance.init();
            }
            this.channels.add(instance.name, instance);
            return instance as T;
        } catch (ex) {
            throwError(ex);
        }
    }

    /**
     * Gets a channel instance
     * @param name the channel name
     */
    public getChannel<T extends INotificationChannel = any>(name: string): T {
        return this.channels.get(name) as T;
    }


    /**
     * Creates a channel instance
     * @param ctor the constructor type
     * @param config the configuration
     */
    protected createChannelInstance(ctor: NotificationChannelClassType<INotificationChannel>, config: any): INotificationChannel {
        return new ctor(this, config);
    }


    /**
     * Send notification
     * @param notification the notification object
     */
    public async notify(notifiable: INotifiable, notification: INotification): Promise<void> {
        const channels = await notification.getChannels(notifiable);
        const promises = channels.map(async c => {
            if (this.channels.has(c)) {
                return this.channels.get(c).send(notifiable, notification);
            }
        });
        await Promise.all(promises);
    }

    /**
     * Routes an anonymous notifiable
     * @param channel the channel name
     * @param recipient the recipient config
     */
    public route(channel: string | INotificationChannel, recipient: any): AnonymousNotifiable {
        channel = typeof (channel) === 'string' ? channel : channel.name;
        const notifiable = (new AnonymousNotifiable());
        notifiable.setNotificationManager(this);
        return notifiable.route(channel, recipient);
    }

}
