import * as Logger from "js-logger";

import { EventListener } from "./EventListener";

const log = Logger.get("EventEmitter");

/**
 * Creates a new strictly typed event emitter.
 *
 * ```js
 * type Events = {
 *     Error: (error: Error) => void;
 *     Message: (body: string) => void;
 *     Response: (payload: Payload) => void;
 * }
 *
 * const eventEmitter = new EventEmitter<Events>();
 * ```
 *
 * @param maxListeners (optional) Override the default max listener count.
 *                     Default is 10.
 * @public
 */
export class EventEmitter<MAP extends { [key: string]: (...args: any[]) => void }> {
    private handlers: Record<keyof MAP, EventListener<MAP>[]>;
    private maxListeners: number;

    /**
     * Creates a new strictly typed event emitter.
     *
     * ```js
     * type Events = {
     *     Error: (error: Error) => void;
     *     Message: (body: string) => void;
     *     Response: (payload: Payload) => void;
     * }
     *
     * const eventEmitter = new EventEmitter<Events>();
     * ```
     *
     * @param maxListeners (optional) Override the default max listener count.
     *                     Default is 10.
     */
    constructor(maxListeners?: number) {
        this.handlers = {} as Record<keyof MAP, EventListener<MAP>[]>;
        this.maxListeners = maxListeners || 10;
    }

    /**
     * Adds the `listener` function to the end of the listeners array for the
     * event named `event`. No checks are made to see if the `listener` has
     * already been added. Multiple calls passing the same combination of
     * `event`and `listener` will result in the `listener` being added, and
     * called, multiple times.
     *
     * ```js
     * eventEmitter.on("Response", (payload) => {
     *     console.log(payload.Body);
     * });
     * ```
     *
     * @param event The name of the event being listened for.
     * @param listener The callback function.
     * @param prepend (optional) Add the callback to the begining of the call
     *                stack.
     * @returns Returns a reference to the `EventEmitter`, so that calls can be
     *          chained.
     */
    public on<EVENT extends keyof MAP>(event: EVENT, listener: MAP[EVENT], prepend?: boolean): this {
        if (this.handlers[event] == null) {
            this.handlers[event] = [];
        }

        if (this.handlers[event].length >= this.maxListeners) {
            log.warn(`exceeded maximum (${this.maxListeners}) number of listeners`);
        }

        if (prepend) {
            this.handlers[event].unshift({ listener, persistent: true });
        } else {
            this.handlers[event].push({ listener, persistent: true });
        }

        return this;
    }

    /**
     * Adds a **one-time** `listener` function for the event named `event`. The
     * next time `event` is triggered, this listener is removed and then
     * invoked.
     *
     * ```js
     * eventEmitter.once("Response", (payload) => {
     *     console.log(payload.Body);
     * });
     * ```
     *
     * @param event The name of the event being listened for.
     * @param listener The callback function.
     * @param prepend (optional) Add the callback to the begining of the call
     *                stack.
     * @returns Returns a reference to the `EventEmitter`, so that calls can be
     *          chained.
     */
    public once<EVENT extends keyof MAP>(event: EVENT, listener: MAP[EVENT], prepend?: boolean): this {
        if (this.handlers[event] == null) {
            this.handlers[event] = [];
        }

        if (prepend) {
            this.handlers[event].unshift({ listener, persistent: false });
        } else {
            this.handlers[event].push({ listener, persistent: false });
        }

        return this;
    }

    /**
     * Removes all listeners or the specified `event` and `listener` from the listener
     * array for the event named `event`.
     *
     * It is bad practice to remove listeners added elsewhere in the code,
     * particularly when the `EventEmitter` instance was created by some other
     * component or module (e.g. sockets or file streams).
     *
     * ```js
     * const printResponse = (payload) => {
     *     console.log(payload.Body);
     * }
     *
     * eventEmitter.on("Response", printResponse);
     * eventEmitter.off("Response", printResponse);
     * ```
     *
     * @param event (optional) The name of the event being listened for.
     * @param listener (optional) The callback function. Default will remove
     *                 all listeners for the event.
     * @returns Returns a reference to the `EventEmitter`, so that calls can be
     *          chained.
     */
    public off<EVENT extends keyof MAP>(event?: EVENT, listener?: MAP[EVENT]): this {
        const events = this.events().filter((item) => {
            if (event == null) {
                return true;
            }

            return item === event;
        }) as EVENT[];

        for (let i = 0; i < events.length; i++) {
            if (listener == null || this.handlers[events[i]].length === 0) {
                delete this.handlers[events[i]];

                continue;
            }

            const index = this.handlers[events[i]].findIndex((handler) => handler.listener === listener);

            if (index >= 0) {
                this.handlers[events[i]].splice(index, 1);

                if (this.handlers[events[i]].length === 0) {
                    delete this.handlers[events[i]];
                }

                return this;
            }
        }

        return this;
    }

    /**
     * Synchronously calls each of the listeners registered for the event named
     * `event`, in the order they were registered, passing the supplied
     * arguments to each.
     *
     * ```js
     * eventEmitter.emit("Response", {
     *     Headers: new Headers(),
     *     Body: "string response",
     * });
     * ```
     *
     * @param event The name of the event being listened for.
     * @param args Payload as defined in the event map.
     * @returns Returns `true` if the event had listeners, `false` otherwise.
     */
    public emit<EVENT extends keyof MAP>(event: EVENT, ...args: Parameters<MAP[EVENT]>): boolean {
        if (this.handlers[event] == null || this.handlers[event].length === 0) {
            return false;
        }

        for (let i = 0; i < this.handlers[event].length; i++) {
            try {
                this.handlers[event][i].listener(...args);
            } catch (error) {
                log.error(error);
            }
        }

        this.handlers[event] = this.handlers[event].filter((handler) => handler.persistent);

        if (this.handlers[event].length === 0) {
            delete this.handlers[event];
        }

        return true;
    }

    /**
     * Returns a copy of the array of listeners for the `event`.
     *
     * @param event The name of the event being listened for.
     * @returns Returns a copy of the array of listeners.
     */
    public listeners<EVENT extends keyof MAP>(event: EVENT): MAP[EVENT][] {
        return [...(this.handlers[event] || [])].map((handler) => handler.listener) as MAP[EVENT][];
    }

    /**
     * Returns an array listing the events for which the emitter has registered
     * listeners. The values in the array are of type `string` or `symbol`.
     *
     * @returns Returns an array of events names.
     */
    public events(): (keyof MAP | string | symbol)[] {
        return Object.keys(this.handlers);
    }
}
