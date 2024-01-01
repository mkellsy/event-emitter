import { EventListener } from "./EventListener";

/**
 * Strictly typed event emitter.
 *
 * ```js
 * import { EventEmitter } from "@mkellsy/event-emitter";
 * ```
*/
export class EventEmitter<MAP extends EventListener> {
    private callbacks: Record<keyof MAP, Function[]>;
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
        this.callbacks = {} as Record<keyof MAP, Function[]>;
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
    on<EVENT extends keyof MAP>(event: EVENT, listener: MAP[EVENT], prepend: boolean): this {
        this.callbacks[event] = this.callbacks[event] || [];

        if (this.callbacks[event].length >= this.maxListeners) {
            throw new Error(`exceeded maximum (${this.maxListeners}) number of listeners`);
        }

        if (prepend) {
            this.callbacks[event].unshift(listener);
        } else {
            this.callbacks[event].push(listener);
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
    once<EVENT extends keyof MAP>(event: EVENT, listener: MAP[EVENT], prepend: boolean): this {
        this.callbacks[event] = this.callbacks[event] || [];

        if (this.callbacks[event].length >= this.maxListeners) {
            throw new Error(`exceeded maximum (${this.maxListeners}) number of listeners`);
        }

        const wrapper = (...args: any[]) => {
            listener(...args);
            this.off(event, wrapper as MAP[EVENT]);
        }

        if (prepend) {
            this.callbacks[event].unshift(wrapper as MAP[EVENT]);
        } else {
            this.callbacks[event].push(wrapper as MAP[EVENT]);
        }

        return this;
    }

    /**
     * Removes all listeners or the specified `listener` from the listener
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
     * @param event The name of the event being listened for.
     * @param listener (optional) The callback function. Default will remove
     *                 all listeners for the event.
     * @returns Returns a reference to the `EventEmitter`, so that calls can be
     *          chained.
     */
    off<EVENT extends keyof MAP>(event: EVENT, listener?: MAP[EVENT]): this {
        const listeners = this.callbacks[event];

        if (!listeners) {
            return this;
        }

        if (listener != null) {
            for(let i = listeners.length; i > 0; i--) {
                if (listeners[i] === listener) {
                    listeners.splice(i,1);

                    return this;
                }
            }
        } else {
            delete this.callbacks[event];
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
    emit<EVENT extends keyof MAP>(event: EVENT, ...args: Parameters<MAP[EVENT]>): boolean {
        const listeners = this.callbacks[event];

        if (!listeners || listeners.length === 0) {
            return false;
        }

        for (let i = 0; i < listeners.length; i++) {
            listeners[i](...args);
        }

        return true;
    }

    /**
     * Returns a copy of the array of listeners for the `event`.
     *
     * @param event The name of the event being listened for.
     * @returns Returns a copy of the array of listeners.
     */
    listeners<EVENT extends keyof MAP>(event: EVENT): MAP[EVENT][] {
        return [...(this.callbacks[event] || [])] as MAP[EVENT][];
    }

    /**
     * Returns an array listing the events for which the emitter has registered
     * listeners. The values in the array are of type `string` or `symbol`.
     *
     * @returns Returns an array of events names.
     */
    events(): (keyof MAP | string | symbol)[] {
        return Object.keys(this.callbacks);
    }
}
