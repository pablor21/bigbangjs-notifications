import path from 'path';

/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Check if an object or var is null or undefined
 * @param obj the object
 */
export function objectNull(obj?: any): boolean {
    return obj === undefined || obj === null;
}

/**
 * Check if a string is empty or null or undefined
 * @param string the target string
 */
export function stringNullOrEmpty(string?: string): boolean {
    return objectNull(string) || string?.trim() === '';
}

export function castValue<T extends number | string | boolean | Record<string, unknown> | (new (...args: any) => T)>(value: any, type: 'number' | 'boolean' | 'object' | 'string' | 'object' | (new (...args: any) => T), defaultValue: T = undefined): T {
    if (objectNull(value)) {
        return defaultValue;
    }
    if (typeof (value) === type) {
        return value;
    }

    switch (type) {
        case 'string':
            return value.toString();
        case 'number':
            return Number(value.toString()) as unknown as T;
        case 'boolean':
            return ((value.toString()) === 'true' || (value.toString()) === '1') as T;
        case 'object':
            return value;
        default:
            return new type(value);
    }
}

/**
 * Join paths
 * @param paths the paths to join
 */
export function joinPath(...paths: string[]): string {
    return path.join(...paths).replace(/\\/g, '/');
}

/**
 * Join paths to url
 * @param url the url
 * @param parts the parts to join
 */
export function joinUrl(url: string, ...parts: string[]): string {
    return url + '/' + joinPath(...parts);
}

/**
 * Capitalize the first letter of a string
 * @param str
 */
export function ucFirst(str: string): string {
    if (stringNullOrEmpty(str)) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string in cammelcase
 * @param str
 */
export function camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (stringNullOrEmpty(match)) {
            return '';
        }
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}
