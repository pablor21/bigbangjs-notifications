import { NotificationManager, GenericNotifiable, Notification, SyncQueue, INotifiable, joinPath, INotificationChannel, QueueableNotification } from '@bigbangjs/notify';
import { SmsChannel, SmsMessage } from '../src';
import fs from 'fs';

class TestNotification extends QueueableNotification {

    constructor(public isBulk = false) {
        super();
        this.channels = ['sms'];
    }

    public async isBulkFor(channel: INotificationChannel): Promise<boolean> {
        return this.isBulk;
    }

    public async toSms(channel: SmsChannel): Promise<SmsMessage> {
        return (new SmsMessage())
            .options({
                type: 'unicode',
            })
            .text(`This message has been sent from ${channel.name}`);
    }

}

const credentials = JSON.parse(fs.readFileSync(joinPath(__dirname, 'credentials.json')).toString());

describe('Test vonage transport', () => {
    test('Sms transport', async () => {
        NotificationManager.registerChannelType('sms', SmsChannel);

        // create a fake queue
        const syncQueue = new SyncQueue();

        const manager = new NotificationManager({});
        syncQueue.process(async (data) => {
            await manager.processQueuedNotification(data);
        });

        manager.addQueue('default', syncQueue);
        await manager.addChannel({
            ...credentials,
        });

        const recipients: any[] = [];
        for (const i in credentials.testNumbers) {
            recipients.push(new GenericNotifiable().route('sms', credentials.testNumbers[i]));
        }


        const results = await manager.for(recipients).notify(new TestNotification()).send();
        expect(results).toHaveLength(2);
        // one must fail and the other must success
        //expect(results.filter(o => !o.success)).toHaveLength(1);
        //expect(results.filter(o => o.success)).toHaveLength(1);


        const results2 = await manager.for(recipients).notify((new TestNotification(true))).send();
        expect(results2).toHaveLength(1);
        // // one must fail and the other must success
        // expect(results2.filter(o => !o.success)).toHaveLength(1);
        // expect(results2.filter(o => o.success)).toHaveLength(1);
    });
});
