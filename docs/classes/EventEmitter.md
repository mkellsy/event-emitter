[Event Emitter](../README.md) / EventEmitter

# Class: EventEmitter\<MAP\>

Creates a new strictly typed event emitter.

```js
type Events = {
    Error: (error: Error) => void;
    Message: (body: string) => void;
    Response: (payload: Payload) => void;
}

const eventEmitter = new EventEmitter<Events>();
```

## Param

(optional) Override the default max listener count.
                    Default is 10.

## Type Parameters

• **MAP** *extends* `object`

## Constructors

### new EventEmitter()

> **new EventEmitter**\<`MAP`\>(`maxListeners`?): [`EventEmitter`](EventEmitter.md)\<`MAP`\>

Creates a new strictly typed event emitter.

```js
type Events = {
    Error: (error: Error) => void;
    Message: (body: string) => void;
    Response: (payload: Payload) => void;
}

const eventEmitter = new EventEmitter<Events>();
```

#### Parameters

• **maxListeners?**: `number`

(optional) Override the default max listener count.
                    Default is 10.

#### Returns

[`EventEmitter`](EventEmitter.md)\<`MAP`\>

## Methods

### emit()

> **emit**\<`EVENT`\>(`event`, ...`args`): `boolean`

Synchronously calls each of the listeners registered for the event named
`event`, in the order they were registered, passing the supplied
arguments to each.

```js
eventEmitter.emit("Response", {
    Headers: new Headers(),
    Body: "string response",
});
```

#### Type Parameters

• **EVENT** *extends* `string` \| `number` \| `symbol`

#### Parameters

• **event**: `EVENT`

The name of the event being listened for.

• ...**args**: `Parameters`\<`MAP`\[`EVENT`\]\>

Payload as defined in the event map.

#### Returns

`boolean`

Returns `true` if the event had listeners, `false` otherwise.

***

### events()

> **events**(): (`string` \| `symbol` \| keyof `MAP`)[]

Returns an array listing the events for which the emitter has registered
listeners. The values in the array are of type `string` or `symbol`.

#### Returns

(`string` \| `symbol` \| keyof `MAP`)[]

Returns an array of events names.

***

### listeners()

> **listeners**\<`EVENT`\>(`event`): `MAP`\[`EVENT`\][]

Returns a copy of the array of listeners for the `event`.

#### Type Parameters

• **EVENT** *extends* `string` \| `number` \| `symbol`

#### Parameters

• **event**: `EVENT`

The name of the event being listened for.

#### Returns

`MAP`\[`EVENT`\][]

Returns a copy of the array of listeners.

***

### off()

> **off**\<`EVENT`\>(`event`?, `listener`?): `this`

Removes all listeners or the specified `event` and `listener` from the listener
array for the event named `event`.

It is bad practice to remove listeners added elsewhere in the code,
particularly when the `EventEmitter` instance was created by some other
component or module (e.g. sockets or file streams).

```js
const printResponse = (payload) => {
    console.log(payload.Body);
}

eventEmitter.on("Response", printResponse);
eventEmitter.off("Response", printResponse);
```

#### Type Parameters

• **EVENT** *extends* `string` \| `number` \| `symbol`

#### Parameters

• **event?**: `EVENT`

(optional) The name of the event being listened for.

• **listener?**: `MAP`\[`EVENT`\]

(optional) The callback function. Default will remove
                all listeners for the event.

#### Returns

`this`

Returns a reference to the `EventEmitter`, so that calls can be
         chained.

***

### on()

> **on**\<`EVENT`\>(`event`, `listener`, `prepend`?): `this`

Adds the `listener` function to the end of the listeners array for the
event named `event`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of
`event`and `listener` will result in the `listener` being added, and
called, multiple times.

```js
eventEmitter.on("Response", (payload) => {
    console.log(payload.Body);
});
```

#### Type Parameters

• **EVENT** *extends* `string` \| `number` \| `symbol`

#### Parameters

• **event**: `EVENT`

The name of the event being listened for.

• **listener**: `MAP`\[`EVENT`\]

The callback function.

• **prepend?**: `boolean`

(optional) Add the callback to the begining of the call
               stack.

#### Returns

`this`

Returns a reference to the `EventEmitter`, so that calls can be
         chained.

***

### once()

> **once**\<`EVENT`\>(`event`, `listener`, `prepend`?): `this`

Adds a **one-time** `listener` function for the event named `event`. The
next time `event` is triggered, this listener is removed and then
invoked.

```js
eventEmitter.once("Response", (payload) => {
    console.log(payload.Body);
});
```

#### Type Parameters

• **EVENT** *extends* `string` \| `number` \| `symbol`

#### Parameters

• **event**: `EVENT`

The name of the event being listened for.

• **listener**: `MAP`\[`EVENT`\]

The callback function.

• **prepend?**: `boolean`

(optional) Add the callback to the begining of the call
               stack.

#### Returns

`this`

Returns a reference to the `EventEmitter`, so that calls can be
         chained.
