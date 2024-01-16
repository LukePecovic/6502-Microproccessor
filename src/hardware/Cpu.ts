import { Hardware } from './Hardware';
import { ClockListener } from './imp/ClockListener';
import { MMU } from './MMU';
import { Interrupt } from './imp/Interrupt';
import { ASCII } from '../utility/ascii';
import { System } from '../System';
import { op } from '../utility/opCode';

const MMU_CPU = new MMU(0, 'MMU / CPU', false);


export class Cpu extends Hardware implements ClockListener, Interrupt {

    //interrupt members 
    public IRQNum: number = 0;
    public inputBuffer: number[] = [];
    public outputBuffer: number[] = [];
    public IRQname: string = 'CPU Interrupt'; // as stated in interrupt interface, must be descriptive on what piece of hardware

    public cpuClockCount: number = 0;

    //ALL REGISTERS FOR CPU
    

    private pc: number = 0x0000; //program counter
  
    private sp: number = 0x0000; // stack pointer
  
    private ir: number = 0x00; // instruction register

    private xReg: number = 0x00; // x register

    private yReg: number = 0x00; // y register
    
    private sReg: number = null; // status register
    
  
    private acc: number = 0x00; //accumulator

    private step: number = 0; // step, data thats used in pipelining

    // Used for debugging
    private pipelineLog: any = [];
  
    private OpComplete: boolean = false;


    constructor(hardwareID: number, hardwareName: string, debug: boolean) {
        super(hardwareID, hardwareName, debug);
        this.cpuClockCount = 0; //initialize clock count to 0
    }

    // ALL CPU METHODS

    private getOffset(data: number): number {
        return 0xff - data + 1;
      }

      private writePipeLineLog(): void {
        //data we want to store
        let pipelineState: any = {
          Cycle: this.cpuClockCount,
          PC: MMU_CPU.hexLog(this.pc, 2),
          SP: MMU_CPU.hexLog(this.sp, 2),
          IR: MMU_CPU.hexLog(this.ir, 1),
          byte1: MMU_CPU.hexLog(MMU.decodedByte1, 1),
          byte2: MMU_CPU.hexLog(MMU.decodedByte2, 1),
          ACC: MMU_CPU.hexLog(this.acc, 1),
          xReg: MMU_CPU.hexLog(this.xReg, 1),
          YReg: MMU_CPU.hexLog(this.yReg, 1),
          sReg: MMU_CPU.hexLog(this.sReg, 1),
          Step: this.step,
        };
    
        this.pipelineLog.push(pipelineState);
      }  


      private getStatus(): void {
        switch (this.sReg) {
          case null:
            //pass. no work to do
            break;
          case 0:
            this.log('Carry Flag thrown');
            break;
          case 1:
            this.log('Zero Flag thrown');
            break;
          case 2:
            this.log('Interupt Recd.');
            break;
          case 3:
            this.log('Decimal Flag thrown');
            break;
          case 4:
            this.log('Brk Flag thrown. Shutting down');
            System.stopSystem();
            break;
          case 5:
            this.log('sReg bit 5 coming in a later release');
            break;
          case 6:
            this.log(`Warning! Overflow`);
            break;
          case 7:
            this.log(`Warning, Negative flag`);
            break;
          default:
            this.log('Cannot read sReg');
            break;
        }
      }
    
      private fetch(): void {
        
        //only skip on the first execution
        if (this.cpuClockCount > 1) {
          this.pc++;
        }
        
        //Set the IR to the current data at the address in the PC
        this.ir = MMU_CPU.read(this.pc);
      }
    
      
      private decode(operands: number, register?: number): void {
        //zero memory read. Read from register
        if (operands === 0) {
          if (register === undefined)
            this.log('Provide data in decode')
    
          else {
            MMU.decodedByte1 = register;
          }
        }
    
        //one byte decode
        else if (operands === 1) {
          this.pc++;
          MMU.decodedByte1 = MMU_CPU.read(this.pc);
        }
    
        //two byte decode
        else if (operands === 2) {
          this.pc++;
          if (MMU.decodedByte1 === null) {
            MMU.decodedByte1 = MMU_CPU.read(this.pc);
          } else {
            MMU.decodedByte2 = MMU_CPU.read(this.pc);
    
            //Set the Stack Pointer with 16 bit data address
            this.sp = MMU_CPU.createPointer(MMU.decodedByte1, MMU.decodedByte2);
          }
        }
      }
    
      /** Check for IRQ Requests, Sets OpComplete to true */
      private checkInterrupt(): void {
        if (this.inputBuffer.length !== 0) this.sReg = 2;
    
        //end the pipeline and restart, or handle interupt
        this.OpComplete = true;
    
      }
    
      /** resets pipeline Logic for when a operation is done*/
      private restartPipeline(): void {
        //Re initialize all members
        this.step = 0;
        this.OpComplete = false;
    
        //Initiate these with null for decode logic
        MMU.decodedByte1 = null;
        MMU.decodedByte2 = null;
      }
    
      /** Load the accumulator with a constant */
      private LDA(): void {
        switch (this.step) {
          case 2:
            this.decode(1);
            break;
    
          case 3:
            this.acc = MMU.decodedByte1;
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in LDA');
            break;
        }
      }
    
      /**Load the accumulator from memory */
      private LDA_Mem(): void {
        switch (this.step) {
          case 2:
            this.decode(2);
            break;
    
          case 3:
            this.decode(2);
            break;
    
          //Load ACC from stack pointer
          case 4:
            this.acc = MMU_CPU.read(this.sp);
            break;
    
          case 5:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in LDA_Mem');
            break;
        }
      }
    
      /** store the ACC In memory at pointer address */
      private STA(): void {
        switch (this.step) {
          case 2:
            this.decode(2);
            break;
    
          case 3:
            this.decode(2);
            break;
    
          //store ACC at stack pointer addr
          case 4:
            MMU_CPU.write(this.sp, this.acc);
            break;
    
          case 5:
            this.checkInterrupt();
            break;
    
          default:
            this.log( 'Error in STA');
            break;
        }
      }
    
      /**Load ACC From xReg */
      private TXA(): void {
        switch (this.step) {
          case 2:
            this.decode(0, this.xReg);
            break;
    
          case 3:
            this.acc = MMU.decodedByte1;
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in TXA');
            break;
        }
      }
    
      /**Load ACC From yReg */
      private TYA(): void {
        switch (this.step) {
          case 2:
            this.decode(0, this.yReg);
            break;
    
          case 3:
            this.acc = MMU.decodedByte1;
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in TYA');
            break;
        }
      }
    
      /** Add with carry */
      private ADC(): void {
        switch (this.step) {
          case 2:
            this.decode(2);
            break;
    
          case 3:
            this.decode(2);
            break;
    
          case 4:
            this.acc = MMU_CPU.read(this.sp) + this.acc;
            break;
    
          case 5:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in ADC');
            break;
        }
      }
    
      /** Load xReg from constant */
      private LDX(): void {
        switch (this.step) {
          case 2:
            this.decode(1);
            break;
    
          case 3:
            this.xReg = MMU.decodedByte1;
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in LDX');
            break;
        }
      }
    
      /** Load xReg from memory */
      private LDX_Mem(): void {
        switch (this.step) {
          case 2:
            this.decode(2);
            break;
    
          case 3:
            this.decode(2);
            break;
    
          case 4:
            this.xReg = MMU_CPU.read(this.sp);
            break;
    
          case 5:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in LDX_Mem');
            break;
        }
      }
    
      /** Load xRegister from Acc */
      private TAX(): void {
        switch (this.step) {
          case 2:
            this.decode(0, this.acc);
            break;
    
          case 3:
            this.xReg = MMU.decodedByte1;
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in TAX');
            break;
        }
      }
    
      /** Load yReg from constant */
      private LDY(): void {
        switch (this.step) {
          case 2:
            this.decode(1);
            break;
    
          case 3:
            this.yReg = MMU.decodedByte1;
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in LDY');
            break;
        }
      }
    
      /** Load yRegister from memory addr */
      private LDY_Mem(): void {
        switch (this.step) {
          case 2:
            this.decode(2);
            break;
    
          case 3:
            this.decode(2);
            break;
    
          case 4:
            this.yReg = MMU_CPU.read(this.sp);
            break;
    
          case 5:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in LDY_Mem');
            break;
        }
      }
    
      /** Load yReg from Accumulator */
      private TAY(): void {
        switch (this.step) {
          case 2:
            this.decode(0, this.acc);
            break;
    
          case 3:
            this.yReg = MMU.decodedByte1;
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in TAY');
            break;
        }
      }
    
      // no operation
      private NOP(): void {
        switch (this.step) {
          case 2:
            break;
    
          case 3:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in NOP');
            break;
        }
      }
    
     // break, shutdown
      private BRK(): void {
        switch (this.step) {
          case 2:
            //execute
            this.sReg = 4;
            break;
    
          case 3:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in BRK');
            break;
        }
      }
    
      // compare x to byte in memory
      private CPX(): void {
        switch (this.step) {
          case 2:
            this.decode(2);
            break;
    
          case 3:
            this.decode(2);
            break;
    
          case 4:
            if (this.xReg === MMU_CPU.read(this.sp)) {
              this.sReg = 1; //set zFlag
            }
            break;
    
          case 5:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in CPX');
            break;
        }
      }
    
      // branch N bytes if z flag is set
      private BNE(): void {
        switch (this.step) {
          case 2:
            this.decode(1);
            break;
    
          case 3:
            if (this.sReg !== 1) {
              let offset = this.getOffset(MMU.decodedByte1);
              this.pc -= offset;
            }
    
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in BNE');
            break;
        }
      }
    
      // increment value of a byte
      private INC(): void {
        switch (this.step) {
          case 2:
            this.decode(2);
            break;
    
          case 3:
            this.decode(2);
            break;
    
          case 4:
            this.acc = MMU_CPU.read(this.sp);
            break;
    
          case 5:
            this.acc++;
            break;
    
          case 6:
            MMU_CPU.write(this.sp, this.acc);
            break;
    
          case 7:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in INC');
            break;
        }
      }
    
      // sys call
      private SYS(): void {
        switch (this.step) {
          case 2:
            if (this.xReg === 1 || this.xReg === 2) {
              MMU.decodedByte1 = this.yReg;
            } 
    
            break;
    
          case 3:
            if (this.xReg === 1) {
              process.stdout.write(this.yReg.toString());
            } else if (this.xReg === 2) {
              let data = ASCII.getChar(MMU.decodedByte1);
              process.stdout.write('' + data); 
            }
    
            break;
    
          case 4:
            this.checkInterrupt();
            break;
    
          default:
            this.log('Error in SYS');
        }
      }
    
      
      private runPipeline(): void {
        
        if (this.step === 1) {
          this.fetch();
          this.writePipeLineLog();
          return;
        }
    
        // read the IR, end execute the correct step for each OpCode
        switch (this.ir) {
          case op.LDA:
            this.LDA();
            break;
    
          case op.LDA_Mem:
            this.LDA_Mem();
            break;
    
          case op.STA:
            this.STA();
            break;
    
          case op.TXA:
            this.TXA();
            break;
    
          case op.TYA:
            this.TYA();
            break;
    
          case op.ADC:
            this.ADC();
            break;
    
          case op.LDX:
            this.LDX();
            break;
    
          case op.LDX_Mem:
            this.LDX_Mem();
            break;
    
          case op.TAX:
            this.TAX();
            break;
    
          case op.LDY:
            this.LDY();
            break;
    
          case op.LDY_Mem:
            this.LDY_Mem();
            break;
    
          case op.TAY:
            this.TAY();
            break;
    
          case op.NOP:
            this.NOP();
            break;
    
          case op.BRK:
            this.BRK();
            break;
    
          case op.CPX:
            this.CPX();
            break;
    
          case op.BNE:
            this.BNE();
            break;
    
          case op.INC:
            this.INC();
            break;
    
          case op.SYS:
            this.SYS();
            break;
    
          default:
            this.log(`Illegal value in IR: ${this.ir.toString(16)}`);
            this.log(`Forcing Shutdown`);
            this.sReg = 4; //throw breakflag and shutdown
            break;
        }
      }
    
     
      pulse(): void {
    
        
        if (this.cpuClockCount === 0) console.log('Output: ');
    
       
        this.cpuClockCount++;
        this.step++;
    
        //handle instructions
        this.runPipeline();
    
        //check CPU status
        this.getStatus();
    
        //write to the pipeline log after each pulse
        this.writePipeLineLog();
    
        //Restart Pipline process after logic is set to completed
        if (this.OpComplete) this.restartPipeline();
    
      }
    }

    


