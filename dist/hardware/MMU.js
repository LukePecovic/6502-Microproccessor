"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MMU = void 0;
const Hardware_1 = require("./Hardware");
const Memory_1 = require("./Memory");
// initializing memory
let mem = new Memory_1.Memory(0, 'MMU', true);
class MMU extends Hardware_1.Hardware {
    // getter and setter for address register
    get mar() {
        return this._mar;
    }
    set mar(value) {
        this._mar = value;
    }
    // getter and setter for data register
    get mdr() {
        return this._mdr;
    }
    set mdr(value) {
        this._mdr = value;
    }
    // constructor initializing the MMU hardware
    constructor(hardwareID, hardwareName, debug) {
        super(hardwareID, hardwareName, debug);
        // address register, initially set to 0 in hexadecimal
        this._mar = 0x0000;
        // data register, initialized to 0
        this._mdr = 0x00;
        this.resetMemory();
    }
    // method to read data from a specified memory address
    read(address) {
        this.mar = address; // update MAR with the address
        this.mdr = mem.memory[this.mar]; // read data into MDR
        return this.mdr;
    }
    // method to write data to a specified memory address
    write(address, data) {
        this.mar = address; // update MAR with the address
        this.mdr = data; // update MDR with the data
        mem.memory[this.mar] = this.mdr; // write data to memory
    }
    static get decodedByte1() {
        return MMU._decodedByte1;
    }
    static set decodedByte1(value) {
        MMU._decodedByte1 = value;
    }
    static get decodedByte2() {
        return this._decodedByte2;
    }
    static set decodedByte2(value) {
        this._decodedByte2 = value;
    }
    // method to create a memory pointer from two bytes
    createPointer(lowByte, highByte) {
        var bytes = new Uint8Array(2);
        bytes[0] = lowByte;
        bytes[1] = highByte;
        var buffer = bytes.buffer;
        var datav = new DataView(buffer);
        var uint = datav.getUint16(0, true);
        return uint; // returning the created pointer
    }
    // method to perform a memory dump between specified addresses
    memoryDump(startAddress, endAddress) {
        this.log('Memory Dump');
        this.log('====================');
        for (let i = startAddress; i <= endAddress; i++) {
            this.log(`Address: ${this.hexConverter(i, 4)}: ${this.hexConverter(this.read(i), 4)}`);
        }
        this.log('====================');
        this.log('Memory Dump Complete');
    }
    // method to reset all memory to 0x0000
    resetMemory() {
        mem.memory.forEach((addr) => this.write(addr, 0x00));
        this.log(`Memory Reset, ${mem.memory.length} elements available`);
    }
}
exports.MMU = MMU;
// static property for decoded byte 1
MMU._decodedByte1 = null;
// static property for decoded byte 2
MMU._decodedByte2 = null;
//# sourceMappingURL=MMU.js.map