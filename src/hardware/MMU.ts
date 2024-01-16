import { Hardware } from './Hardware';
import { Memory } from './Memory';

// initializing memory
let mem = new Memory(0, 'MMU', true);

export class MMU extends Hardware {
  // address register, initially set to 0 in hexadecimal
  private _mar: number = 0x0000;

  // getter and setter for address register
  public get mar(): number {
    return this._mar;
  }

  public set mar(value: number) {
    this._mar = value;
  }

  // data register, initialized to 0
  private _mdr: number = 0x00;

  // getter and setter for data register
  public get mdr(): number {
    return this._mdr;
  }

  public set mdr(value: number) {
    this._mdr = value;
  }

  // constructor initializing the MMU hardware
  constructor(hardwareID: number, hardwareName: string, debug: boolean) {
    super(hardwareID, hardwareName, debug);
    this.resetMemory();
  }

  // method to read data from a specified memory address
  public read(address: number): number {
    this.mar = address; // update MAR with the address
    this.mdr = mem.memory[this.mar]; // read data into MDR

    return this.mdr;
  }

  // method to write data to a specified memory address
  public write(address: number, data: number): void {
    this.mar = address; // update MAR with the address
    this.mdr = data; // update MDR with the data

    mem.memory[this.mar] = this.mdr; // write data to memory
  }

 

  // static property for decoded byte 1
  private static _decodedByte1: number = null;
  public static get decodedByte1(): number {
    return MMU._decodedByte1;
  }
  public static set decodedByte1(value: number) {
    MMU._decodedByte1 = value;
  }

  // static property for decoded byte 2
  private static _decodedByte2: number = null;
  public static get decodedByte2(): number {
    return this._decodedByte2;
  }
  public static set decodedByte2(value: number) {
    this._decodedByte2 = value;
  }

  // method to create a memory pointer from two bytes
  public createPointer(lowByte: number, highByte: number): number {
    var bytes = new Uint8Array(2);
    bytes[0] = lowByte;
    bytes[1] = highByte;

    var buffer = bytes.buffer;
    var datav = new DataView(buffer);
    var uint = datav.getUint16(0, true);

    return uint; // returning the created pointer
  }

  // method to perform a memory dump between specified addresses
  public memoryDump(startAddress: number, endAddress: number): void {
    this.log('Memory Dump');
    this.log('====================');

    for (let i = startAddress; i <= endAddress; i++) {
      this.log(`Address: ${this.hexConverter(i,4)}: ${this.hexConverter(this.read(i),4)}`);
    }

    this.log('====================');
    this.log('Memory Dump Complete');
  }

  // method to reset all memory to 0x0000
  public resetMemory(): void {
    mem.memory.forEach((addr) => this.write(addr, 0x00));
    this.log(`Memory Reset, ${mem.memory.length} elements available`);
  }
}
