import { INotificationChannel } from './channel';
import { LoggerType } from './lib';
import { INotifiable } from './notifiable';
import { INotification } from './notification';

export type ClassType<T> = new (...args: any[]) => T;

export enum NotificationEventTypes {
    NOTIFICATION_SENT = 'NOTIFICATION_SENT',
    NOTIFICATION_SEND_ERROR = 'NOTIFICATION_SEND_ERROR',
    NOTIFICATION_QUEUED = 'NOTIFICATION_QUEUED',
    NOTIFICATION_QUEUE_ERROR = 'NOTIFICATION_QUEUE_ERROR',
}

export type NotificationManagerConfig = {
    /**
    * Logger class
    */
    logger?: LoggerType | boolean;
    /**
     * Auto init providers?
     */
    autoInitProviders: boolean;

    defaultQueueName?: string;
    maxQueueRetries?: number;
};

export type NotificationResult = {
    type: 'SENT' | 'QUEUED' | 'ERROR';
    params: any;
    channel: INotificationChannel;
    recipients: any[];
    shouldRetry: boolean;
    success: boolean;
    nativeResponse?: any;
};


export type NotificationPendingResult = {
    notifiable: INotifiable;
    notification: INotification;
    channel: INotificationChannel;
    promise: Promise<NotificationResult>;
};


