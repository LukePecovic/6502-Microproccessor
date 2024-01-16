"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hardware = void 0;
class Hardware {
    constructor(id, name, debug = true) {
        this.id = id;
        this.name = name;
        this.debug = debug;
    }
    log(message) {
        if (this.debug) {
            const timestamp = new Date().getTime();
            console.log(`[HW - ${this.name} id: ${this.id} - ${timestamp}]: ${message}`);
        }
    }
    hexLog(inputNumber, desiredLength) {
        //decimal to hex converter where inputNumber is the number to be converted to hex and displayed
        if (inputNumber == null) {
            return 'NULL';
        }
        const hexString = inputNumber.toString(16).toUpperCase().padStart(desiredLength, '0');
        //log hex num
        console.log(`0x${hexString}`);
        return `0x${hexString}`;
    }
    hexConverter(inputNumber, desiredLength) {
        //decimal to hex converter where inputNumber is the number to be converted to hex and displayed
        const hexString = inputNumber.toString(16).toUpperCase().padStart(desiredLength, '0');
        //log hex num
        return `0x${hexString}`;
    }
}
exports.Hardware = Hardware;
//# sourceMappingURL=Hardware.js.map