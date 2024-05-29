import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import Default, { EventEmitter } from "../src";

chai.use(sinonChai);

describe("index", () => {
    it("should define a default export", () => {
        expect(Default).to.not.be.null;
        expect(Default).to.equal(EventEmitter);
    });

    it("should define EventEmitter export", () => {
        expect(EventEmitter).to.not.be.null;
    });
});
