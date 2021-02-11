import { INotification } from './notification.interface';

export type DelayType = number | { channel: string; delay: number }[];

export interface IQueueNotificaton extends INotification {
    queueName: string;
    shouldQueue: boolean;
    sendDelay: DelayType;
    onQueue(name: string): IQueueNotificaton;
    delay(delay: DelayType): IQueueNotificaton;
    instant(isInstant: boolean): IQueueNotificaton;
}
