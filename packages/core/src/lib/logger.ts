/* eslint-disable no-console */

import c from 'ansi-colors';


export type LoggerType = {
    warn: (...args: any) => void;
    error: (...args: any) => void;
    info: (...args: any) => void;
    debug: (...args: any) => void;
};


export const ConsoleLogger: LoggerType = {
    warn: (message: string, ...args): void => {
        console.log(c.yellow(message), ...args);
    },
    error: (message: string, ...args): void => {
        console.log(c.red(message), ...args);
    },
    info: (message: string, ...args): void => {
        console.log(c.cyan(message), ...args);
    },
    debug: (message: string, ...args): void => {
        console.log(c.gray(message), ...args);
    },
};
