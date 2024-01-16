"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
const System_1 = require("../System");
const ascii_1 = require("../utility/ascii");
const Hardware_1 = require("./Hardware");
const interruptController_1 = require("./interruptController");
const stdin = process.stdin;
const irqController = new interruptController_1.InterruptController(1, "IRQ-Key", false);
/**
 * class Keyboard extends Hardware and implements ClockListener and Interrupt interfaces.
 * acts as an interface for user input via terminal.
 */
class Keyboard extends Hardware_1.Hardware {
    constructor(hardwareID, hardwareName, debug) {
        super(hardwareID, hardwareName, debug);
        // properties related to interrupt functionality
        this.IRQNum = 2;
        this.IRQname = "Key input given";
        this.outputBuffer = [];
        this.monitorKeys();
    }
    /**
     * initializes key monitoring for input.
     * sets up event listeners for processing keystrokes.
     */
    monitorKeys() {
        let rawMode = false;
        // check for raw mode compatibility
        if (!rawMode) {
            this.log('RawMode disabled. Enable in src/Keyboard.ts by setting rawMode to true.');
        }
        // start listening to stdin
        stdin.resume();
        stdin.setEncoding(null); // set encoding to null for raw input
        stdin.on("data", (key) => {
            let keyPressed = key.toString();
            let keyPressedHex = ascii_1.ASCII.getHex(keyPressed);
            // exit condition for non-node.js environments
            if (keyPressed === "\u0003") {
                System_1.System.stopSystem();
            }
            // add key value to the buffer
            this.outputBuffer.push(keyPressedHex);
        });
    }
    /**
     * sends interrupts on each clock pulse if there are keys in the buffer.
     */
    pulse() {
        if (this.outputBuffer.length > 0) {
            irqController.acceptInterrupt(this);
            if (this.debug)
                console.log(`Interrupt sent: ${this}`);
        }
    }
}
exports.Keyboard = Keyboard;
//# sourceMappingURL=Keyboard.js.map