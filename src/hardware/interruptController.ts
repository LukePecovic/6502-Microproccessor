import { Hardware } from './Hardware';
import { ClockListener } from './imp/ClockListener';
import { Interrupt } from './imp/Interrupt';

export class InterruptController
  extends Hardware
  implements ClockListener, Interrupt {
  //Interupt members
  public IRQNum: number;
  public inputBuffer: any[];
  public outputBuffer: any[];
  public IRQname: string;

  /** Interrupt Queue */
  public iQueue: Interrupt[] = [];
  public irqsPending: number = 0;

  constructor(hardwareID: number, hardwareName: string, debug: boolean) {
    super(hardwareID, hardwareName, debug);

    this.IRQname = 'IRQ Controller';
  }

  /** Allow classes to call this and add data to the irq input buffer
   * Also, iterate the iQueue and place it in the correct index
   * @param interupt received interupt __object__
   */
  public acceptInterrupt(irq: Interrupt): void {
    if (this.debug) {
      this.log(`Interrupt Received: ${irq.IRQname}`);
    }

    //add interupt to back of Queue
    this.iQueue.push(irq);

    this.sortIQueue();
  }

  /** Sort by IRQ priority
   * - ref: https://www.javascripttutorial.net/javascript-array-sort/
   */
  private sortIQueue(): void {
    //only call this when multiple interupt requests are recevied
    if (this.irqsPending > 1) {
      this.iQueue.sort(function (a, b) {
        return a.IRQNum - b.IRQNum;
      });
    } else {
      //pass
    }
  }

  /**Each pulse, check the amount of interupts recd. */
  public irqChecker(): number {
    return this.iQueue.length;
  }

  pulse(): void {
    this.irqsPending = this.irqChecker();
  }
}
