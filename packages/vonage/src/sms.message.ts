import { IMessage } from '@bigbangjs/notify';
import { SendSmsOptions } from '@vonage/server-sdk';
import { SmsParams } from './types';


export class SmsMessage implements IMessage {

    public params: Partial<SmsParams> = {};

    public from(from: string): SmsMessage {
        this.params.from = from;
        return this;
    }

    public to(to: string): SmsMessage {
        this.params.to = to;
        return this;
    }

    public text(text: string): SmsMessage {
        this.params.text = text;
        return this;
    }

    public options(options: Partial<SendSmsOptions>): SmsMessage {
        this.params.options = options;
        return this;
    }

    public async getDataForChannel(): Promise<any> {
        return this.params;
    }


}
