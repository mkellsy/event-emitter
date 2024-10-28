/**
 * Defines an event listener function.
 * @public
 */
export type EventListener<EVENT_MAP> = {
    /**
     * The listener to assign to the event.
     */
    listener: EVENT_MAP[keyof EVENT_MAP];

    /**
     * If the listener should remain assigned after invoked.
     */
    persistent: boolean;
};
