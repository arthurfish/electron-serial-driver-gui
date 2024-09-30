import Chart from "./Chart.tsx";
import {linespace} from "./utils.ts";
import {useState} from "react";
import {compile} from "mathjs"
import {clone, head, zip} from "lodash-es";
import {getSerialPorts, serialClosePorts, serialParseToPos, SerialPort, serialWriteAndRead} from "./serial.ts";


export default function App() {
    const [executionState, changeExecutionState] = useState<"Ready" | "Idle" | "Pause" | "Forward" | "Update">("Ready")

    const [trail, setTrail] = useState<Array<[number, number]>>([])
    const [path, setPath] = useState<Array<[number, number]>>([])
    const [serialPorts, setSerialPorts] = useState<[SerialPort, SerialPort]>(getSerialPorts(["COM3", "COM4"]))
    const [currentPos, setCurrentPos] = useState<[number, number]>([0, 0])
    const [formulaString, setFormulaString] = useState<string>("")
    const [timerStepForward, setTimerStepForward] = useState<number>()

    const limitInMillimeters: [number, number]  = [80, 80]
    const resolution = 1000
    let buttons: Array<JSX.Element> = [<button>Crashed!</button>]
    let input: JSX.Element = <input value={formulaString} onChange={(event) => setFormulaString(event.target.value)}/>
    switch (executionState) {
        case "Ready":
            function handleStartButtonPressed() {
                let formula = compile(formulaString)
                let pathX = linespace(0, limitInMillimeters[0], resolution)
                let pathY =  pathX.map(x => formula.evaluate({x}) as number)
                setPath(zip(pathX, pathY) as [number, number][])
                changeExecutionState("Idle")
            }
            buttons = [<button onClick={handleStartButtonPressed}>Execute</button>]
            function stepForward(){
                if(path.length == 0) {
                    changeExecutionState("Ready")
                    return
                }
                const [xPosInMillimeters, yPosInMillimeters] = head(path) as [number, number]
                setPath(prevState => prevState.slice(1))
                try {
                    serialWriteAndRead(`moveabs ${xPosInMillimeters}`, (data) => console.log(`Serial/moveabs x ${data}`), serialPorts[0])
                    serialWriteAndRead(`moveabs ${yPosInMillimeters}`, (data) => console.log(`Serial/moveabs y ${data}`), serialPorts[1])
                    serialWriteAndRead(`pfb`, (data) => {
                        setCurrentPos(prevState => [serialParseToPos(data), prevState[1]]);
                        setTrail(prevState => {prevState.push(currentPos); return clone(prevState)})
                    }, serialPorts[0])
                    serialWriteAndRead(`pfb`, (data) => {
                        setCurrentPos(prevState => [prevState[0], serialParseToPos(data)])
                        setTrail(prevState => {prevState.push(currentPos); return clone(prevState)})
                    }, serialPorts[1])
                }catch (e) {
                    changeExecutionState("Pause")
                }
            }
            setTimerStepForward(setInterval(stepForward, 1000))
            break

        case "Pause":
            clearInterval(timerStepForward)
            function handleContinueButtonPressed() {
                serialClosePorts(["COM3", "COM4"])
                try{
                    setSerialPorts(getSerialPorts(["COM3", "COM4"]))
                    setTimerStepForward(setInterval(stepForward, 1000))
                    changeExecutionState("Idle")
                }catch (e){
                    console.log(`Pause/Continue Error! Can not resume.`)
                }
            }
            function handleStopButtonPressed(){
                setTrail([])
                setPath([])
                changeExecutionState("Ready")
            }

            buttons = [
                <button onClick={handleContinueButtonPressed}>Continue</button>,
                <button onClick={handleStopButtonPressed}>Stop</button>]

            break

        case "Idle":
            function handlePauseButtonPressed(){
                changeExecutionState("Idle")
            }
            buttons = [<button onClick={handlePauseButtonPressed}>Pause</button>]
            break
    }




    return <div className={"p-6 max-w-screen-md mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4"}>
        <Chart height={300} width={600} path={path} trail={trail} />
        <div className={"container max-w-full"}>
            <div>{input}</div>
            <div>{buttons[0]}</div>
            <div>{buttons.length >= 2 ? buttons[1] : <div/>}</div>
        </div>
    </div>
}