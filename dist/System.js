"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
// import classes
const Clock_1 = require("./hardware/Clock");
const Cpu_1 = require("./hardware/Cpu");
const MMU_1 = require("./hardware/MMU");
const Keyboard_1 = require("./hardware/Keyboard");
const interruptController_1 = require("./hardware/interruptController");
const opCode_1 = require("./utility/opCode");
const testTXA = [
    opCode_1.op.LDX,
    0x02,
    // load yReg with string, then Print yReg String
    opCode_1.op.TXA,
];
/**Print hello world to the screen */
const helloWorld = [
    opCode_1.op.LDX,
    0x02,
    // load yReg with string, then Print yReg String
    opCode_1.op.LDY,
    0x48,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x65,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x6c,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x6c,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x6f,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x20,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x57,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x6f,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x72,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x6c,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x64,
    opCode_1.op.SYS,
    opCode_1.op.LDY,
    0x21,
    opCode_1.op.SYS,
];
const powers = [
    0xa9, 0x00, 0x8d, 0x40, 0x00, 0xa9, 0x01, 0x6d, 0x40, 0x00, 0x8d, 0x40, 0x00,
    0xa8, 0xa2, 0x01, 0xff, 0xd0, 0xf4, 0x00,
];
class System {
    constructor(debug) {
        //Initialization Parameters for Hardware
        this._CPU = null;
        this._Clock = null;
        this._MMU = null;
        this._KEY = null;
        this._IRQ = null;
        this.debug = null;
        //Possibly the max speed for node.js
        this.CLOCK_INTERVAL = 10;
        this.debug = debug;
    }
    /** Load an array of opcodes and data into memory
     * @param startAddress RAM Address to start writing
     * @param program Array of data
     */
    loadProgram(startAddress, program) {
        var data = 0;
        for (let i = startAddress; data < program.length; i++) {
            this._MMU.write(i, program[data]);
            data++;
        }
    }
    startSystem() {
        //Initialize Hardware (turn on components)
        this._CPU = new Cpu_1.Cpu(1, 'CPU', true);
        this._Clock = new Clock_1.Clock(3, 'CLK', false);
        this._MMU = new MMU_1.MMU(4, 'MMU', false);
        this._KEY = new Keyboard_1.Keyboard(5, 'KEY', false);
        this._IRQ = new interruptController_1.InterruptController(6, 'IRQ', false);
        //populate Clock.listeners[] with hardware
        this._Clock.listeners.push(this._CPU);
        this._Clock.listeners.push(this._KEY);
        this._Clock.listeners.push(this._IRQ);
        /*==================6502 Startup==================*/
        this.loadProgram(0x00, helloWorld);
        //this.loadProgram(helloWorld.length, powers);
        //Pulse with a timed interval repeat
        const intervalObj = setInterval(() => {
            this._Clock.cycle();
        }, this.CLOCK_INTERVAL);
        return true;
    }
    static stopSystem() {
        console.log('Info: [HW: SYS] : Shutting Down');
        process.exit();
    }
}
exports.System = System;
//main
let system = new System(false);
system.startSystem();
//# sourceMappingURL=System.js.map