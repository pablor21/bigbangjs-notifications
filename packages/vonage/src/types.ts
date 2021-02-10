import { NotificationChannelConfig } from '@bigbangjs/notify';
import { SendSmsOptions } from '@vonage/server-sdk';

export type VonageChannelOptions = {
    apiKey: string;
    apiSecret: string;
    from: string;
} & NotificationChannelConfig;

export type SmsParams = {
    to: string;
    from: string;
    text: string;
    options?: Partial<SendSmsOptions>;
};
