export enum NotifyExceptionType {
    UNKNOWN_ERROR = 'E_UNKNOWN',
    NATIVE_ERROR = 'E_NATIVE',
    DUPLICATED_ELEMENT = 'E_DUPLICATED_ELEMENT',
    NOT_FOUND = 'E_NOT_FOUND',
    INVALID_PARAMS = 'E_INVALID_PARAMS',
    PERMISSION_ERROR = 'E_PERMISSION'
}


export function constructError(message: string, name: NotifyExceptionType = NotifyExceptionType.UNKNOWN_ERROR, data?: any): Error {
    const err = new Error(message);
    // eslint-disable-next-line dot-notation
    err['details'] = data || {};
    // eslint-disable-next-line dot-notation
    err.name = name;
    // eslint-disable-next-line dot-notation
    err['code'] = err['details'].code || name;
    return err;
}

export function throwError(message: string, name: NotifyExceptionType = NotifyExceptionType.UNKNOWN_ERROR, data?: any): Error {
    throw constructError(message, name, data);
}
