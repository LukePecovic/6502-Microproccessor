import { Hardware } from './Hardware';
import { ClockListener } from './imp/ClockListener';

export class Clock extends Hardware {
  
  public listeners: ClockListener[] = []; //array holds every "listener"

  constructor(hardwareID: number, hardwareName: string, debug: boolean) {
    super(hardwareID, hardwareName, debug);
  }

/* I asked chatgpt for this cycle function and it gave me this. 
it works fine but I didnt understand it at first. I just asked it to explain it to me 
which of course it did an actually did pretty well. The questions marks allow
the allows the Cycle() to call the pulse method and lets say it was null or undefined, 
instead of throwing an error it will just return undefined which
I htought was pretty neat */

  cycle(): void {  
    for (const listener of this.listeners) {
      listener?.pulse?.();
      if (this.debug) this.log(`Clock Pulse Initialized`);
    }
  }
}
