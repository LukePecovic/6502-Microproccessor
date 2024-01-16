export class Hardware {
    id: number;
    name: string;
    debug: boolean;
  
    constructor(id: number, name: string, debug: boolean = true) {
      this.id = id;
      this.name = name;
      this.debug = debug;
    }
    log(message: string) {
        if (this.debug) {
          const timestamp = new Date().getTime();
          console.log(`[HW - ${this.name} id: ${this.id} - ${timestamp}]: ${message}`);
        }
      }

    hexLog(inputNumber: number, desiredLength: number) {
      //decimal to hex converter where inputNumber is the number to be converted to hex and displayed
      if(inputNumber == null){
        return 'NULL'
      }
      const hexString = inputNumber.toString(16).toUpperCase().padStart(desiredLength, '0');
      //log hex num
      console.log(`0x${hexString}`);

      return `0x${hexString}`
    }
    hexConverter(inputNumber: number, desiredLength: number) {
      //decimal to hex converter where inputNumber is the number to be converted to hex and displayed
      const hexString = inputNumber.toString(16).toUpperCase().padStart(desiredLength, '0');
      //log hex num
      

      return `0x${hexString}`
    }
  }
  