export interface IQueue {
    push(data: any, options?: any): Promise<any>;
    process(fn: (data: any) => any | Promise<any>, options?: any): void;
}
