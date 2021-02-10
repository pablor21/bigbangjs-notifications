import { NotificationManager, AbstractNotification, INotificationChannel, INotifiable } from '@bigbangjs/notify/src';
import { EmailChannel } from '../src';
import { EmailMessage } from '../src/email.message';

class TestNotification extends AbstractNotification {

    constructor() {
        super();
        this.channels = ['test'];
    }

    toTest(notifiable: INotifiable, channel: EmailChannel): EmailMessage {
        return (new EmailMessage())
            .from('pablor21@gmail.com')
            .subject('test')
            .text(`This is the text version of the message`)
            .html(`This message has been sent via ${channel.name}`);
    }

}

describe('Test email transport', () => {
    test('Email transport', async () => {
        NotificationManager.registerChannelType('mail', EmailChannel);

        const manager = new NotificationManager({});
        await manager.addChannel({
            name: 'test',
            type: 'mail',
            from: 'pablor21@gmail.com',
            fromName: 'Pablo Ramirez',
            autoInit: true,
            transport: {
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'leif5@ethereal.email',
                    pass: 'WhZAmbbQdZSDWV8bfy',
                },
            },
        });

        await manager.route('test', 'test@test.com').notify(new TestNotification());
    });
});
