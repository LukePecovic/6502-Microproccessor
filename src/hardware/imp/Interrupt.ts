// Asked Chat Gpt for a few potential interrupts, Gave me some garbage at first but this seemed good
export interface Interrupt {
   
    IRQNum: number;  // this sets the priority of the interrupt
    
    inputBuffer?: number[]; // array of numbers buffered from input, optional 
    
    outputBuffer: number[]; // array of numbers buffered for output
   
    IRQname: string; // name of the interrupt, should not be same as hardware name
  }