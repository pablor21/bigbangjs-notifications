import { NotificationChannelConfig } from '@bigbangjs/notify';
import { TransportOptions, Transport } from 'nodemailer';

export type EmailChannelConfig = {
    transport: any;
    from: string;
    fromName?: string;
} & NotificationChannelConfig;
