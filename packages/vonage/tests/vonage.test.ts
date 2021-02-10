import { NotificationManager, AbstractNotification, INotifiable, joinPath } from '@bigbangjs/notify/src';
import { SmsChannel, SmsMessage } from '../src';
import fs from 'fs';

class TestNotification extends AbstractNotification {

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

        await manager.route('sms', credentials.testNumbers[0]).notify(new TestNotification());
    });
});
