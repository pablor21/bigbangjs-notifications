import { VALID_TRANSPORTS_NAMES_REGEX } from './constants';
import { NotifyExceptionType, throwError } from './exceptions';
import { ConsoleLogger, LoggerType, objectNull, Registry } from './lib';
import { INotifiable } from './notifiable';
import { INotification } from './notification';
import { INotificationChannel, NotificationChannelClassType, NotificationChannelConfig } from './channel';
import { NotificationEventTypes, NotificationManagerConfig, NotificationResult } from './types';
import { EventEmitter } from 'events';
import { NotificationRequest } from './notification/notification.request';
import { IQueue } from './queue';

const defaultConfigOptions: NotificationManagerConfig = {
    logger: ConsoleLogger,
    autoInitProviders: true,
    defaultQueueName: 'default',
};

export class NotificationManager extends EventEmitter {

    public static channelTypes: Registry<string, NotificationChannelClassType<INotificationChannel>> = new Registry();
    public readonly config: NotificationManagerConfig;
    protected readonly channels: Registry<string, INotificationChannel> = new Registry();
    protected readonly queues: Registry<string, IQueue> = new Registry();


    constructor(config?: Partial<NotificationManagerConfig>) {
        super();
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

    public addQueue(name: string, queue: IQueue): void {
        this.queues.add(name, queue, true);
    }

    public removeQueue(name: string): void {
        this.queues.remove(name);
    }

    public getQueue(name: string): IQueue {
        return this.queues.get(name);
    }

    /**
     * Prepare a notification request to send
     * @param methodToCall the method to call in the channel
     * @param request the notification request
     * @param channels the channels
     */
    protected async prepareToSend(method: 'prepare', request: NotificationRequest, channels?: (string | INotificationChannel)[]) {
        if (channels) {
            if (!Array.isArray(channels)) {
                channels = [channels];
            }
        } else {
            channels = [];
        }
        const notifiables = request.notifiables;
        if (!notifiables) {
            this.log('warn', `No recipients for notification ${request.notification}`);
            return null;
        }
        if (!Array.isArray(request.notifiables)) {
            request.notifiables = [request.notifiables];
        }
        const channelsToSend = {};
        await Promise.all((notifiables as INotifiable[]).map(async (notifiable: INotifiable) => {
            const channels = (await request.notification.getChannelsFor(notifiable));
            channels.map(c => {
                if (undefined === channelsToSend[c]) {
                    channelsToSend[c] = [];
                }
                channelsToSend[c].push(notifiable);
            });
        }));

        // array of promises to resolve
        const promises: any[] = [];
        // filter only valid channels
        await Promise.all(Object.keys(channelsToSend).filter(k => this.channels.has(k)).map(async channelName => {
            const channel = this.channels.get(channelName);
            const recipients = channelsToSend[channelName];
            const isBulk = await request.notification.isBulkFor(channel);
            // eslint-disable-next-line dot-notation
            if (isBulk && typeof (channel['prepareBulk']) === 'function') {
                // add the send request to the promises array
                promises.push({
                    channel,
                    isBulk,
                    notification: request.notification,
                    // eslint-disable-next-line dot-notation
                    promise: channel['prepareBulk'](notifiables, request.notification),
                });
            } else {
                recipients.map((notifiable: INotifiable) => {
                    // add the send request to the promises array
                    promises.push({
                        channel,
                        notifiable,
                        notification: request.notification,
                        promise: channel.prepare(notifiable, request.notification),
                    });
                });
            }
        }));
        return promises;
    }

    public async processQueuedNotification(data: any): Promise<void> {
        try {
            this.log('info', `Processing notification on ${data.channel} ${data.data}`);
            const channel = this.getChannel(data.channel);
            const params = await channel.unserializeData(data.data);
            let result;
            if (params.isBulk) {
                result = await channel.sendBulk(params);
            } else {
                result = await channel.send(params);
            }
            this.log('info', `Processed notification on ${data.channel} ${data.data}`);
        } catch (ex) {
            this.log('error', `Error processing ${data.channel} ${data.data}`);
            throwError(ex.message, NotifyExceptionType.UNKNOWN_ERROR, ex);
        }
    }

    /**
     * Send notification request
     * This is an atomic operation, if one of the channels is
     * unable to sent a notification, the loop will continue
     * and the error will be kept in the result array
     * If the notification object is a queueable object, the
     * method will create the needed jobs
     * @param request the notification request object
     * @param channels only send on the setted channels
     */
    public async send(request: NotificationRequest, channels?: (string | INotificationChannel)[]): Promise<NotificationResult[]> {
        if (objectNull(request) || !(request instanceof NotificationRequest)) {
            throwError(`Invalid notification request!`, NotifyExceptionType.INVALID_PARAMS, { request });
        }

        // eslint-disable-next-line dot-notation
        if (request.notification['shouldQueue']) {
            // eslint-disable-next-line dot-notation
            const queueName = request.notification['queueName'] === 'default' ? this.config.defaultQueueName : request.notification['queueName'];
            let queue = this.getQueue(queueName);
            if (!queue) {
                queue = this.getQueue(this.config.defaultQueueName);
            }
            if (queue) {

                const promises = await this.prepareToSend('prepare', request, channels);
                const results: NotificationResult[] = [];
                // resolve all promises and return
                await Promise.all(promises.map(async p => {
                    try {
                        let params = await p.promise;

                        if (!Array.isArray(params)) {
                            params = [params];
                        }

                        await Promise.all(params.map(async (param: any) => {
                            const queueData = {
                                channel: p.channel.name,
                                data: await p.channel.serializeData(param),
                            };


                            const queueResponse = await queue.push(queueData);
                            const result: NotificationResult = {
                                type: 'QUEUED',
                                channel: p.channel,
                                success: true,
                                params,
                                nativeResponse: queueResponse,
                            };
                            this.emit(NotificationEventTypes.NOTIFICATION_QUEUED, result);
                            results.push(result);
                        }));


                    } catch (ex) { // if the promise throws an exception, keep track of it and continue
                        const result: NotificationResult = {
                            type: 'ERROR',
                            channel: p.channel,
                            success: false,
                            nativeResponse: ex,
                            params: {},
                        };
                        this.emit(NotificationEventTypes.NOTIFICATION_QUEUE_ERROR, result);
                        results.push(result);
                    }
                }));
                return results;
            }
            // eslint-disable-next-line dot-notation
            this.log('warn', `No queue named '${queueName}' sending the notification now...`);

        }
        return await this.sendNow(request, channels);
    }

    /**
     * Send notification request instantly, ignoring if the
     * notification is queueable or not
     * This is an atomic operation, if one of the channels is
     * unable to sent a notification, the loop will continue
     * and the error will be kept in the result array
     * If the notification object is a queueable object, the
     * method will create the needed jobs
     * @param request the notification request object
     * @param channels only send on the setted channels
     */
    public async sendNow(request: NotificationRequest, channels?: (string | INotificationChannel)[]): Promise<NotificationResult[]> {
        // array of promises to resolve
        const promises = await this.prepareToSend('prepare', request, channels);

        const results: NotificationResult[] = [];
        // resolve all promises and return
        await Promise.all(promises.map(async p => {
            try {
                const params = await p.promise;
                const r = await p.channel.send(params);
                if (r.success) {
                    this.emit(NotificationEventTypes.NOTIFICATION_SENT, r);
                } else {
                    this.emit(NotificationEventTypes.NOTIFICATION_SEND_ERROR, r);
                }
                results.push(r);
            } catch (ex) { // if the promise throws an exception, keep track of it and continue
                const r: NotificationResult = {
                    type: 'ERROR',
                    channel: p.channel,
                    success: false,
                    nativeResponse: ex,
                    params: {},
                };
                this.emit(NotificationEventTypes.NOTIFICATION_SEND_ERROR, r);
                return results.push(r);
            }
        }));
        return results;
    }

    /**
     * Creates a notification request with the desired notifiables
     * @param notifiables the notifiable objects
     */
    public for(notifiables: INotifiable | INotifiable[]): NotificationRequest {
        return this.request(notifiables);
    }

    /**
     * Creates a notification request with the desired notification object
     * @param notification the notification object
     */
    public notify(notification: INotification): NotificationRequest {
        return this.request([], notification);
    }

    /**
     * Creates a notification request with the desired notifiables and notification
     * @param notifiables the notifiables objects
     * @param notification the notification
     */
    public request(notifiables?: INotifiable | INotifiable[], notification?: INotification): NotificationRequest {
        return new NotificationRequest(this, notifiables, notification);
    }

}
