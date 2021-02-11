import { NotificationManager, QueueableNotification, SyncQueue, GenericNotifiable, INotifiable, joinPath } from '@bigbangjs/notify';
import { EmailChannel } from '../src';
import { EmailMessage } from '../src/email.message';
import fs from 'fs';
class TestNotification extends QueueableNotification {

    constructor() {
        super();
        this.channels = ['mail'];
    }

    toMail(notifiable: INotifiable, channel: EmailChannel): EmailMessage {
        return (new EmailMessage())
            .subject('test')
            .text(`This is the text version of the message`)
            .html(`This message has been sent via ${channel.name}`);
    }

}
const credentials = JSON.parse(fs.readFileSync(joinPath(__dirname, 'credentials.json')).toString());
describe('Test email transport', () => {
    test('Email transport', async () => {
        NotificationManager.registerChannelType('mail', EmailChannel);

        // create a fake queue
        const syncQueue = new SyncQueue();

        const manager = new NotificationManager({});
        syncQueue.process(async (data)=>{
            await manager.processQueuedNotification(data);
        });

        manager.addQueue('default', syncQueue);

        const emailChannel = await manager.addChannel(credentials);
        expect(emailChannel).toBeInstanceOf(EmailChannel);
        expect(emailChannel.type).toBe('mail');
        expect(emailChannel.name).toBe('mail');

        const recipients = [
            new GenericNotifiable().route('mail', 'test0asdfasdfsdf1.com'),
            new GenericNotifiable().route('mail', 'test02@test.com'),
        ];

        const results = await manager.for(recipients).notify(new TestNotification()).send();
        expect(results).toHaveLength(2);
        // one must fail and the other must success
        expect(results.filter(o => !o.success)).toHaveLength(1);
        expect(results.filter(o => o.success)).toHaveLength(1);
    });
});
