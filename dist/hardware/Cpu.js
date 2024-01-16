"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cpu = void 0;
const Hardware_1 = require("./Hardware");
const MMU_1 = require("./MMU");
const ascii_1 = require("../utility/ascii");
const System_1 = require("../System");
const opCode_1 = require("../utility/opCode");
const MMU_CPU = new MMU_1.MMU(1, 'MMU / CPU', false);
class Cpu extends Hardware_1.Hardware {
    constructor(hardwareID, hardwareName, debug) {
        super(hardwareID, hardwareName, debug);
        //interrupt members 
        this.IRQNum = 0;
        this.inputBuffer = [];
        this.outputBuffer = [];
        this.IRQname = 'CPU Interrupt'; // as stated in interrupt interface, must be descriptive on what piece of hardware
        this.cpuClockCount = 0;
        //ALL REGISTERS FOR CPU
        this.pc = 0x0000; //program counter
        this.sp = 0x0000; // stack pointer
        this.ir = 0x00; // instruction register
        this.xReg = 0x00; // x register
        this.yReg = 0x00; // y register
        /**Status register
         * - 0: carry flag
         * - 1: zero flag
         * - 2: interupt mask
         * - 3: decimal flag (not used)
         * - 4: break flag
         * - 5: no name and always set to 1
         * - 6: overflow flag
         * - 7: Negative flag
         */
        this.sReg = null;
        this.acc = 0x00; //accumulator
        this.step = 0; // step, data thats used in pipelining
        // Used for debugging
        this.pipelineLog = [];
        this.OpComplete = false;
        this.cpuClockCount = 0; //initialize clock count to 0
    }
    // ALL CPU METHODS
    getOffset(data) {
        return 0xff - data + 1;
    }
    writePipeLineLog() {
        //data we want to store
        let pipelineState = {
            Cycle: this.cpuClockCount,
            PC: MMU_CPU.hexLog(this.pc, 2),
            SP: MMU_CPU.hexLog(this.sp, 2),
            IR: MMU_CPU.hexLog(this.ir, 1),
            byte1: MMU_CPU.hexLog(MMU_1.MMU.decodedByte1, 1),
            byte2: MMU_CPU.hexLog(MMU_1.MMU.decodedByte2, 1),
            ACC: MMU_CPU.hexLog(this.acc, 1),
            xReg: MMU_CPU.hexLog(this.xReg, 1),
            YReg: MMU_CPU.hexLog(this.yReg, 1),
            sReg: MMU_CPU.hexLog(this.sReg, 1),
            Step: this.step,
        };
        this.pipelineLog.push(pipelineState);
    }
    getStatus() {
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
                System_1.System.stopSystem();
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
    //TODO:
    /**Logic based off sReg
     * - Handles errors, overflow and other sReg commands
     */
    //private monitorRegisters(): void {}
    /** Get next opCode instruction.
     * - Always step 1.
     * - Uses the Program counter to select memory location.
     * - Before reading, INC the program counter.
     */
    fetch() {
        //only skip on the first execution
        if (this.cpuClockCount > 1) {
            this.pc++;
        }
        //Set the IR to the current data at the address in the PC
        this.ir = MMU_CPU.read(this.pc);
    }
    /** Decode the operands for an instruction and send to MMU
     * @param operands how many operands the opcode has (0-2)
     * @param register data to read from. Pass in the ***register memeber***
     */
    decode(operands, register) {
        //zero memory read. Read from register
        if (operands === 0) {
            if (register === undefined)
                this.log('Provide data in decode');
            else {
                MMU_1.MMU.decodedByte1 = register;
            }
        }
        //one byte decode
        else if (operands === 1) {
            this.pc++;
            MMU_1.MMU.decodedByte1 = MMU_CPU.read(this.pc);
        }
        //two byte decode
        else if (operands === 2) {
            this.pc++;
            if (MMU_1.MMU.decodedByte1 === null) {
                MMU_1.MMU.decodedByte1 = MMU_CPU.read(this.pc);
            }
            else {
                MMU_1.MMU.decodedByte2 = MMU_CPU.read(this.pc);
                //Set the Stack Pointer with 16 bit data address
                this.sp = MMU_CPU.createPointer(MMU_1.MMU.decodedByte1, MMU_1.MMU.decodedByte2);
            }
        }
    }
    /** Check for IRQ Requests, Sets OpComplete to true */
    checkInterrupt() {
        if (this.inputBuffer.length !== 0)
            this.sReg = 2;
        //end the pipeline and restart, or handle interupt
        this.OpComplete = true;
    }
    /** resets pipeline Logic for when a operation is done*/
    restartPipeline() {
        //Re initialize all members
        this.step = 0;
        this.OpComplete = false;
        //Initiate these with null for decode logic
        MMU_1.MMU.decodedByte1 = null;
        MMU_1.MMU.decodedByte2 = null;
    }
    /** Load the accumulator with a constant */
    LDA() {
        switch (this.step) {
            case 2:
                this.decode(1);
                break;
            case 3:
                this.acc = MMU_1.MMU.decodedByte1;
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
    LDA_Mem() {
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
    STA() {
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
                this.log('Error in STA');
                break;
        }
    }
    /**Load ACC From xReg */
    TXA() {
        switch (this.step) {
            case 2:
                this.decode(0, this.xReg);
                break;
            case 3:
                this.acc = MMU_1.MMU.decodedByte1;
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
    TYA() {
        switch (this.step) {
            case 2:
                this.decode(0, this.yReg);
                break;
            case 3:
                this.acc = MMU_1.MMU.decodedByte1;
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
    ADC() {
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
    LDX() {
        switch (this.step) {
            case 2:
                this.decode(1);
                break;
            case 3:
                this.xReg = MMU_1.MMU.decodedByte1;
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
    LDX_Mem() {
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
    TAX() {
        switch (this.step) {
            case 2:
                this.decode(0, this.acc);
                break;
            case 3:
                this.xReg = MMU_1.MMU.decodedByte1;
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
    LDY() {
        switch (this.step) {
            case 2:
                this.decode(1);
                break;
            case 3:
                this.yReg = MMU_1.MMU.decodedByte1;
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
    LDY_Mem() {
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
    TAY() {
        switch (this.step) {
            case 2:
                this.decode(0, this.acc);
                break;
            case 3:
                this.yReg = MMU_1.MMU.decodedByte1;
                break;
            case 4:
                this.checkInterrupt();
                break;
            default:
                this.log('Error in TAY');
                break;
        }
    }
    /** No Operation */
    NOP() {
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
    /** Coffee anyone? */
    BRK() {
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
    /** Compare x to a byte in memory, set zFLag if equal */
    CPX() {
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
    /** branch n Bytes if zflag is set */
    BNE() {
        switch (this.step) {
            case 2:
                this.decode(1);
                break;
            case 3:
                if (this.sReg !== 1) {
                    let offset = this.getOffset(MMU_1.MMU.decodedByte1);
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
    /** Increment the value of a byte */
    INC() {
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
    /** Sys call */
    SYS() {
        switch (this.step) {
            case 2:
                if (this.xReg === 1 || this.xReg === 2) {
                    MMU_1.MMU.decodedByte1 = this.yReg;
                }
                else if (this.xReg === 3) {
                    this.log('SYS 3 will be coming in a later release');
                }
                break;
            case 3:
                if (this.xReg === 1) {
                    process.stdout.write(this.yReg.toString());
                }
                else if (this.xReg === 2) {
                    let data = ascii_1.ASCII.getChar(MMU_1.MMU.decodedByte1);
                    process.stdout.write('' + data); //must concat with a string or error will ensue
                }
                break;
            case 4:
                this.checkInterrupt();
                break;
            default:
                this.log('Error in SYS');
        }
    }
    /**Implements all CPU methods for better better logic flow */
    runPipeline() {
        //Always step 1. Fetch the opcode
        if (this.step === 1) {
            this.fetch();
            this.writePipeLineLog(); //Skip the block below, but we still want to write to the log
            return;
        }
        //Read the IR, end execute the correct step for each OpCode
        switch (this.ir) {
            case opCode_1.op.LDA:
                this.LDA();
                break;
            case opCode_1.op.LDA_Mem:
                this.LDA_Mem();
                break;
            case opCode_1.op.STA:
                this.STA();
                break;
            case opCode_1.op.TXA:
                this.TXA();
                break;
            case opCode_1.op.TYA:
                this.TYA();
                break;
            case opCode_1.op.ADC:
                this.ADC();
                break;
            case opCode_1.op.LDX:
                this.LDX();
                break;
            case opCode_1.op.LDX_Mem:
                this.LDX_Mem();
                break;
            case opCode_1.op.TAX:
                this.TAX();
                break;
            case opCode_1.op.LDY:
                this.LDY();
                break;
            case opCode_1.op.LDY_Mem:
                this.LDY_Mem();
                break;
            case opCode_1.op.TAY:
                this.TAY();
                break;
            case opCode_1.op.NOP:
                this.NOP();
                break;
            case opCode_1.op.BRK:
                this.BRK();
                break;
            case opCode_1.op.CPX:
                this.CPX();
                break;
            case opCode_1.op.BNE:
                this.BNE();
                break;
            case opCode_1.op.INC:
                this.INC();
                break;
            case opCode_1.op.SYS:
                this.SYS();
                break;
            default:
                this.log(`Illegal value in IR: ${this.ir.toString(16)}`);
                this.log(`Forcing Shutdown`);
                this.sReg = 4; //throw breakflag
                break;
        }
    }
    /** Called each clock pulse From Interface ```clockListener```
     * - Simulate CPU Pipeline
     */
    pulse() {
        //see the initial state of the CPU
        if (this.cpuClockCount === 0)
            console.log('Output: ');
        //increment for each pulse
        this.cpuClockCount++;
        this.step++;
        //handle instructions
        this.runPipeline();
        //check CPU status
        this.getStatus();
        //Write to the pipeline log after each pulse
        this.writePipeLineLog();
        //Restart Pipline process after logic is set to completed
        if (this.OpComplete)
            this.restartPipeline();
    }
}
exports.Cpu = Cpu;
//# sourceMappingURL=Cpu.js.map