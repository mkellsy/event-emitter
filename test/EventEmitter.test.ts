import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { EventEmitter } from "../src/EventEmitter";

chai.use(sinonChai);

type EventMap = {
    EVENT: (payload: any) => void;
    OTHER_EVENT: (payload: any) => void;
};

describe("EventEmitter", function () {
    const payload: any = {};
    const listeners: any = [];

    let eventEmitter: EventEmitter<EventMap>;

    beforeEach(() => {
        listeners[0] = sinon.stub();
        listeners[1] = sinon.stub();
        listeners[2] = sinon.stub();

        eventEmitter = new EventEmitter<EventMap>();
    });

    describe("emit()", () => {
        it("should synchronously emit", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[1]);
            eventEmitter.on("OTHER_EVENT", listeners[2]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[0]).to.be.calledWith(payload);
        });

        it("should not call callbacks for other events", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[1]);
            eventEmitter.on("OTHER_EVENT", listeners[2]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[2]).to.not.be.called;
        });

        it("should emit for all listeners of the event even if one throws", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[1]);
            eventEmitter.on("OTHER_EVENT", listeners[2]);

            listeners[0].throws();

            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[1]).to.be.calledOnce;
        });
    });

    describe("on()", () => {
        it("should add a listener", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[0]).to.be.calledWith(payload);
        });

        it("should add multiple listeners", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[1]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[1]).to.be.calledOnce;
        });

        it("should prepend a listeners before existing listeners", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[1], true);

            expect(eventEmitter.listeners("EVENT")[0]).to.equal(listeners[1]);
        });

        it("should still add multiple listeners even if max is exceeded", () => {
            eventEmitter = new EventEmitter<EventMap>(1);

            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[1]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[1]).to.be.calledOnce;
        });
    });

    describe("off()", () => {
        it("should not throw if there are no attached listeners", () => {
            expect(() => eventEmitter.off("EVENT", listeners[0])).to.not.throw();
        });

        it("should remove the callback for the attached `on` listener", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.off("EVENT", listeners[0]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.not.be.called;
        });

        it("should remove the callback for the attached `once` listener", () => {
            eventEmitter.once("EVENT", listeners[0]);
            eventEmitter.off("EVENT", listeners[0]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.not.be.called;
        });

        it("should not remove identical callbacks for `on` and `once` listeners", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.once("EVENT", listeners[0]);
            eventEmitter.once("EVENT", listeners[0]);
            eventEmitter.off("EVENT", listeners[0]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledThrice;
        });

        it("should only remove the appropriate callback", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("EVENT", listeners[1]);
            eventEmitter.off("EVENT", listeners[1]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[1]).to.not.be.called;
        });

        it("should only remove callbacks for the appropriate event", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.on("OTHER_EVENT", listeners[0]);
            eventEmitter.off("EVENT", listeners[0]);
            eventEmitter.emit("EVENT", payload);
            eventEmitter.emit("OTHER_EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
        });

        it("should only remove the appropriate callback", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.off("EVENT", listeners[1]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[1]).to.not.be.called;
        });

        it("should remove all listeners for the event, if provided", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.once("EVENT", listeners[1]);
            eventEmitter.on("OTHER_EVENT", listeners[2]);

            eventEmitter.off("EVENT");
            eventEmitter.emit("EVENT", payload);
            eventEmitter.emit("OTHER_EVENT", payload);

            expect(listeners[0]).to.not.be.called;
            expect(listeners[1]).to.not.be.called;
            expect(listeners[2]).to.be.calledOnce;
        });

        it("should remove all listeners for all events, if no event is provided", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.once("EVENT", listeners[1]);
            eventEmitter.on("OTHER_EVENT", listeners[2]);

            eventEmitter.off();
            eventEmitter.emit("EVENT", payload);
            eventEmitter.emit("OTHER_EVENT", payload);

            expect(listeners[0]).to.not.be.called;
            expect(listeners[1]).to.not.be.called;
            expect(listeners[2]).to.not.be.called;
        });
    });

    describe("once()", () => {
        it("should only call the callback once", () => {
            eventEmitter.once("EVENT", listeners[0]);
            eventEmitter.emit("EVENT", payload);
            eventEmitter.emit("EVENT", "notCalledPayload");

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[0]).to.be.calledWith(payload);
        });

        it("should prepend a listeners before existing listeners", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.once("EVENT", listeners[1], true);

            expect(eventEmitter.listeners("EVENT")[0]).to.equal(listeners[1]);
        });
    });

    describe("listeners()", () => {
        it("should return an empty array if there are no listeners", () => {
            expect(eventEmitter.listeners("EVENT")).to.be.empty;
        });

        it("should return the listeners attached for the event", () => {
            eventEmitter.on("EVENT", listeners[0]);
            eventEmitter.once("EVENT", listeners[1]);
            eventEmitter.on("OTHER_EVENT", listeners[2]);

            const callbacks = eventEmitter.listeners("EVENT");

            expect(callbacks).to.contain(listeners[0]);
            expect(callbacks).to.contain(listeners[1]);
            expect(callbacks).to.not.contain(listeners[2]);
        });

        it("should not be possible to affect the event emitter with the returned listeners", () => {
            eventEmitter.on("EVENT", listeners[0]);

            eventEmitter.listeners("EVENT").push(listeners[1]);
            eventEmitter.emit("EVENT", payload);

            expect(listeners[0]).to.be.calledOnce;
            expect(listeners[1]).to.not.be.called;
        });
    });
});
