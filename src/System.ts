import { Clock } from './hardware/Clock';
import { Cpu } from './hardware/Cpu';
import { MMU } from './hardware/MMU';
import { Keyboard } from './hardware/Keyboard';
import { InterruptController } from './hardware/interruptController';
import { op } from './utility/opCode';




const helloWorld = [
    op.LDX, 0x02,
  
    op.LDY, 0x48, op.SYS,
    op.LDY, 0x65, op.SYS,
    op.LDY, 0x6c, op.SYS,
    op.LDY, 0x6c, op.SYS,
    op.LDY, 0x6f, op.SYS,
    op.LDY, 0x20, op.SYS,
    op.LDY, 0x57, op.SYS,
    op.LDY, 0x6f, op.SYS,
    op.LDY, 0x72, op.SYS,
    op.LDY, 0x6c, op.SYS,
    op.LDY, 0x64, op.SYS,
    op.LDY, 0x21, op.SYS
  ];
  

// power operation sequence
const powers = [
  0xa9, 0x00, 0x8d, 0x40, 0x00, 0xa9, 0x01, 0x6d, 0x40, 0x00, 0x8d, 0x40, 0x00,
  0xa8, 0xa2, 0x01, 0xff, 0xd0, 0xf4, 0x00,
];

// system class definition
export class System {
  // hardware components instantiation
  private _CPU: Cpu = null;
  private _Clock: Clock = null;
  private _MMU: MMU = null;
  private _KEY: Keyboard = null;
  private _IRQ: InterruptController = null;

  // debug mode flag
  private debug: boolean = null;

  // clock interval setting
  private CLOCK_INTERVAL: number = 10;

  // constructor for system setup
  constructor(debug: boolean) {
    this.debug = debug;
  }

  // l
  private writeImmediate(startAddress: number, program: number[]): void {
    var data = 0;
    for (let i = startAddress; data < program.length; i++) {
      this._MMU.write(i, program[data]);
      data++;
    }
  }

  // method to initialize and start the system
  public startSystem(): boolean {
    // initializing hardware components
    this._CPU = new Cpu(1, 'CPU', this.debug);
    this._Clock = new Clock(3, 'CLK', this.debug);
    this._MMU = new MMU(4, 'MMU', this.debug);
    this._KEY = new Keyboard(5, 'KEY', this.debug);
    this._IRQ = new InterruptController(6, 'IRQ', this.debug);

    // adding hardware components to clock listeners
    this._Clock.listeners.push(this._CPU, this._KEY, this._IRQ);

    // loading 'Hello World' program into memory
    this.writeImmediate(0x00, helloWorld);

    // setting up and starting the clock cycles
    const intervalObj = setInterval(() => {
      this._Clock.cycle();
    }, this.CLOCK_INTERVAL);

    return true;
  }

  // method to stop the system
  public static stopSystem(): void {
    console.log('System shutdown initiated');
    process.exit();
  }
}

// system instantiation and startup
let system: System = new System(false);
system.startSystem();
