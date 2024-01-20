export type EventListener<EVENT_MAP> = {
    listener: EVENT_MAP[keyof EVENT_MAP];
    persistent: boolean;
};
