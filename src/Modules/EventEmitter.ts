import { EventHandler } from "../Interfaces/EventHandler";
import { EventListener } from "../Interfaces/EventListener";

/**
 * Strictly typed event emitter.
 *
 * ```js
 * import { EventEmitter } from "@mkellsy/event-emitter";
 * ```
*/
export class EventEmitter<MAP extends EventListener> {
    private handlers: Record<keyof MAP, EventHandler[]>;
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
        this.handlers = {} as Record<keyof MAP, EventHandler[]>;
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
        if (this.handlers[event].length >= this.maxListeners) {
            throw new Error(`exceeded maximum (${this.maxListeners}) number of listeners`);
        }

        this.pushListeners(event, listener, true, prepend || false);

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
        if (this.handlers[event].length >= this.maxListeners) {
            throw new Error(`exceeded maximum (${this.maxListeners}) number of listeners`);
        }

        this.pushListeners(event, listener, false, prepend || false);

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
            this.removeListeners(events[i], listener);
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
        if (!this.handlers[event] || this.handlers[event].length === 0) {
            return false;
        }

        for (let i = 0; i < this.handlers[event].length; i++) {
            this.handlers[event][i].listener(...args);

            if (!this.handlers[event][i].persistent) {
                this.spliceListeners(event, i);
            }
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

    private removeListeners<EVENT extends keyof MAP>(event: EVENT, listener?: MAP[EVENT]): void {
        if (!this.handlers[event]) {
            return;
        }

        if (listener == null) {
            delete this.handlers[event];

            return;
        }

        for(let i = this.handlers[event].length; i > 0; i--) {
            if (this.handlers[event][i].listener === listener) {
                this.spliceListeners(event, i);

                return;
            }
        }
    }

    private pushListeners<EVENT extends keyof MAP>(event: EVENT, listener: MAP[EVENT], persistent: boolean, prepend: boolean): void {
        const handler: EventHandler = { listener, persistent };

        this.handlers[event] = this.handlers[event] || [];

        if (prepend) {
            this.handlers[event].unshift(handler);
        } else {
            this.handlers[event].push(handler);
        }
    }

    private spliceListeners<EVENT extends keyof MAP>(event: EVENT, index: number): void {
        if (this.handlers[event] == null || this.handlers[event][index] == null) {
            return;
        }

        this.handlers[event].splice(index, 1);

        if (this.handlers[event].length === 0) {
            delete this.handlers[event];
        }
    }
}
