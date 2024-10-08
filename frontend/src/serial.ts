import {random} from "lodash-es";
import {randomInt} from "mathjs";

export type SerialPort = {}

export const serialWriteAndRead = (serialCommand: string, readSerialData: (data: string) => void, serailPorts: SerialPort) => {
    console.log(`MOCK/Serial/Write ${serialCommand}\\r\\n ${serailPorts}`);
    setTimeout(() => readSerialData("--->\r\n12.33 [mm]\r\n"), 100)
};

export const getSerialPorts = (_serialPaths: [string, string]) => {
    return [{}, {}] as [SerialPort, SerialPort]
}

export const serialParseToPos = (_data: string): number => {
    return randomInt(5, 15)
}

export const serialClosePorts = (_serialPorts: [string, string]) => {}