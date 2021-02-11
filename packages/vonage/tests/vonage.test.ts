import { NotificationManager, GenericNotifiable, Notification, INotifiable, joinPath } from '@bigbangjs/notify';
import { SmsChannel, SmsMessage } from '../src';
import fs from 'fs';

class TestNotification extends Notification {

    constructor() {
        super();
        this.channels = ['sms'];
    }

    public async toSms(notifiable: INotifiable, channel: SmsChannel): Promise<SmsMessage> {
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

        const manager = new NotificationManager({});
        await manager.addChannel({
            ...credentials,
        });

        const recipients: any[] = [];
        for (const i in credentials.testNumbers) {
            recipients.push(new GenericNotifiable().route('sms', credentials.testNumbers[i]));
        }


        const results = await manager.for(recipients).notify(new TestNotification()).send();
        expect(results).toHaveLength(1);
    });
});
