export type NotificationChannelConfig = {
    name: string;
    autoInit?: boolean;
    type: string;
    supportsBulk?: boolean;
    bulkSize?: number;
    maxBulkSize?: number;
};


export type NotificationChannelDataType = {
    recipients: any | any[];
    isBulk: boolean;
    data: any;
};
