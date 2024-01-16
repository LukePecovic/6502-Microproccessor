"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
const Hardware_1 = require("./Hardware");
class Clock extends Hardware_1.Hardware {
    constructor(hardwareID, hardwareName, debug) {
        super(hardwareID, hardwareName, debug);
        this.listeners = []; //array holds every "listener"
    }
    /* I asked chatgpt for this cycle function and it gave me this.
    it works fine but I didnt understand it at first. I just asked it to explain it to me
    which of course it did an actually did pretty well. The questions marks allow
    the allows the Cycle() to call the pulse method and lets say it was null or undefined,
    instead of throwing an error it will just return undefined which
    I htought was pretty neat */
    cycle() {
        var _a;
        for (const listener of this.listeners) {
            (_a = listener === null || listener === void 0 ? void 0 : listener.pulse) === null || _a === void 0 ? void 0 : _a.call(listener);
            if (this.debug)
                this.log(`Clock Pulse Initialized`);
        }
    }
}
exports.Clock = Clock;
//# sourceMappingURL=Clock.js.map