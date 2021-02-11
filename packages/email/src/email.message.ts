import { IMessage } from '@bigbangjs/notify';
import Mail from 'nodemailer/lib/mailer';

export class EmailMessage implements IMessage {

    public readonly params: Mail.Options = {};

    public from(address: string): EmailMessage {
        this.params.from = address;
        return this;
    }

    public subject(subject: string): EmailMessage {
        this.params.subject = subject;
        return this;
    }

    public to(address: string): EmailMessage {
        this.params.to = address;
        return this;
    }

    public html(html: string): EmailMessage {
        this.params.html = html;
        return this;
    }

    public text(text: string): EmailMessage {
        this.params.text = text;
        return this;
    }

    public attach(...items: Mail.Attachment[]): EmailMessage {
        this.params.attachments = this.params.attachments || [];
        this.params.attachments.push(...items);
        return this;
    }

    public async getDataForChannel(): Promise<any> {
        return this.params;
    }


}
