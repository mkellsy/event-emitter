export type EventListener = {
    [key: string]: (...args: any[]) => void;
};
