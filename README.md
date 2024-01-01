# Event Emitter
Strictly typed event emitter.

## API
```js
import EventEmitter from "@mkellsy/event-emitter";

interface Payload {
    Headers: Headers;
    Body: string;
}

type Events = {
    Error: (error: Error) => void;
    Message: (body: string) => void;
    Response: (payload: Payload) => void;
}

const eventEmitter = new EventEmitter<Events>();
```

Synchronously calls each of the listeners registered for the event named `event`, in the order they were registered, passing the supplied arguments to each.
```js
eventEmitter.emit("Response", {
    Headers: new Headers(),
    Body: "string response",
});
```

Adds the `listener` function to the end of the listeners array for the event named `event`. No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination of `event`and `listener` will result in the `listener` being added, and called, multiple times.
```js
eventEmitter.on("Response", (payload) => {
    console.log(payload.Body);
});
```

Add the callback to the begining of the call stack.
```js
eventEmitter.on("Response", (payload) => {
    console.log(payload.Body);
}, true);
```

Adds a **one-time** `listener` function for the event named `event`. The next time `event` is triggered, this listener is removed and then invoked.
```js
eventEmitter.once("Response", (payload) => {
    console.log(payload.Body);
});
```

Add the callback to the begining of the call stack.
```js
eventEmitter.once("Response", (payload) => {
    console.log(payload.Body);
}, true);
```

Removes all listeners or the specified `listener` from the listener array for the event named `event`.
```js
const printResponse = (payload: Payload) => {
    console.log(payload.Body);
};

eventEmitter.on("Response", printResponse);
eventEmitter.off("Response", printResponse);
```

Removing a all listeners for a given `event``.
> It is bad practice to remove listeners added elsewhere in the code, particularly when the `EventEmitter` instance was created by some other component or module (e.g. sockets or file streams).
```js
eventEmitter.on("Response", (payload: Payload) => {
    console.log(payload.Body);
});

eventEmitter.off("Response");
```

Returns a copy of the array of listeners for the `event`.
```js
if (eventEmitter.listeners("Response").length > 0) {
    console.log("Response listeners exist");
}
```

Returns an array listing the events for which the emitter has registered listeners. The values in the array are of type `string` or `symbol`.
```js
if (eventEmitter.events().indexOf("Response") >= 0) {
    console.log("Response listeners exist");
}
```