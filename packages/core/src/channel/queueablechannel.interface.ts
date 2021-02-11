export interface IQueueableChannel<DataType> {

    /**
     * Serialize the data
     * @param data the data to serialize
     */
    serializeData(data: DataType): Promise<any>;

    /**
     * Unserialize data (from queues)
     * @param data the data
     */
    unserializeData(data: any): Promise<DataType>;

}
