import { System } from "../System";
import { ASCII } from "../utility/ascii";
import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";
import { Interrupt } from "./imp/Interrupt";
import { InterruptController } from "./interruptController";

const stdin = process.stdin;
const irqController = new InterruptController(1, "IRQ-Key", false);

/** 
 * class Keyboard extends Hardware and implements ClockListener and Interrupt interfaces.
 * acts as an interface for user input via terminal.
 */
export class Keyboard extends Hardware implements ClockListener, Interrupt {
  // properties related to interrupt functionality
  public IRQNum: number = 2;
  public IRQname: string = "Key input given";
  public outputBuffer: number[] = [];

  constructor(hardwareID: number, hardwareName: string, debug: boolean) {
    super(hardwareID, hardwareName, debug);
    this.monitorKeys();
  }

  // monitors key, sets up listemers for keystrokes
  private monitorKeys(): void {
    // start listening to stdin
    stdin.resume();
    stdin.setEncoding(null); // set encoding to null for raw input

    stdin.on("data", (key: { toString: () => string }) => {
      let keyPressed: string = key.toString();
      let keyPressedHex: number = ASCII.getHex(keyPressed);

      // exit condition for non-node.js environments
      if (keyPressed === "\u0003") {
        System.stopSystem();
      }

      // add key value to the buffer
      this.outputBuffer.push(keyPressedHex);
    });
  }

  /** 
   * sends interrupts on each clock pulse if there are keys in the buffer.
   */
  pulse(): void {
    if (this.outputBuffer.length > 0) {
      irqController.acceptInterrupt(this);
      if (this.debug) console.log(`Interrupt sent: ${this}`);
    }
  }
}
