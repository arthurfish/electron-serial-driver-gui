import {SerialPort} from "serialport";
import {Effect} from "effect";

class MotorManager {
    private motor_x: SerialPort;
    private motor_y: SerialPort;

    constructor() {

    }

    private update_motors(){
        if(this.motor_x == null){
            this.motor_x = new SerialPort({
                path: "COM3",
                baudRate: 115200,
            })
        }
    }
}

