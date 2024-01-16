"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const Hardware_1 = require("./Hardware");
class Memory extends Hardware_1.Hardware {
    get memory() {
        return this._memory;
    }
    set memory(hexNum) {
        this._memory = hexNum;
    }
    get memoryCap() {
        return this._memoryCap;
    }
    set memoryCap(value) {
        this._memoryCap = value;
    }
    constructor(hardwareID, hardwareName, debug) {
        super(hardwareID, hardwareName, debug);
        //array for hex numbers
        //getters and setters 
        this._memory = [];
        //Capacity is 65536 or 16^4 or ffff
        this._memoryCap = 0xffff;
        // for loop for initializing memory
        for (let i = 0; i < this._memoryCap; i++) {
            this._memory[i] = 0x00;
        }
    }
    pulse() {
        // clock pulse 
        this.log("received clock pulse");
    }
    displayMemory() {
        // for loop to go through each address and display it with hexLog function
        for (let address = 0x00; address <= 0x14; address++) {
            const value = this._memory[address];
            if (address <= 0xffff) { // Only log if value is less than or equal 65536
                this.hexLog(address, 4);
            }
            else {
                this.log(`${address}: Undefined`); //if not its we do not use and its undefined
            }
        }
    }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map