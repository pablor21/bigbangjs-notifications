import { IQueue } from './queue.interface';

export class SyncQueue implements IQueue {

    private processor: any = null;

    public async push(data: any, options?: any): Promise<any> {
        if (this.processor) {
            await this.processor(data);
        }
        return;
    }

    process(fn: (data: any) => any | Promise<any>, options?: any): void {
        this.processor = fn;
    }

}
