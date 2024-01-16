import {Hardware} from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

export class Memory extends Hardware implements ClockListener{

    
    
    //array for hex numbers
    //getters and setters 
    private _memory: number[] = [];
    public get memory() {
        return this._memory;
    }
    public set memory(hexNum){
        this._memory = hexNum;
    }
    //Capacity is 65536 or 16^4 or ffff
    private _memoryCap: number = 0xffff;
    public get memoryCap(): number {
        return this._memoryCap
    }
    public set memoryCap(value: number) {
        this._memoryCap = value;
    }
    



    constructor(hardwareID, hardwareName, debug){
    super(hardwareID, hardwareName, debug)
    // for loop for initializing memory
    for (let i = 0; i < this._memoryCap; i++) {
        this._memory[i] = 0x00;
    }
    }


    pulse(): void {
        // clock pulse 
        this.log("received clock pulse");
    }


    public displayMemory() {
        // for loop to go through each address and display it with hexLog function
        for (let address = 0x00; address <= 0x14; address++) {
            const value = this._memory[address];
            
            

            if (address <= 0xffff) { // Only log if value is less than or equal 65536
                this.hexLog(address, 4);
            } else {
                this.log(`${address}: Undefined`); //if not its we do not use and its undefined
            }
        }
    }
}