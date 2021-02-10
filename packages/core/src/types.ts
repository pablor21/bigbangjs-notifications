import { LoggerType } from './lib';

export type ClassType<T> = new (...args: any[]) => T;

export type NotificationManagerConfig = {
    /**
    * Logger class
    */
    logger?: LoggerType | boolean;
    /**
     * Auto init providers?
     */
    autoInitProviders: boolean;
};
