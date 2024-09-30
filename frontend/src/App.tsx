import Chart from "./Chart.tsx";
import {linespace, zip} from "./utils.ts";
import {useState} from "react";
import {compile} from "mathjs"
import {getSerialPorts, serialClosePorts, serialParseToPos, SerialPort, serialWriteAndRead} from "./serial.ts";
import {List} from 'immutable'

const xyAxisPositionLimitInMillimeters: [number, number]  = [80, 80]
const numberOfStep = 1000
const pollingIntervalInMilliseconds = 1000

type ExecutionState = "Ready" | "Idle" | "Pause"

let timerStepForward: number = 0
const setTimerStepForward = (id: number)=> {
    timerStepForward = id
}
let path: List<[number, number]> = List()
const setPath = (newPath: List<[number, number]>) => {
    console.log(`path is modified to ${newPath}`)
    path = newPath
}

export default function App() {
    const [executionState, _changeExecutionState] = useState<ExecutionState>("Ready")
    const changeExecutionState = (s: ExecutionState) => {
        _changeExecutionState(_ => {
            console.log(`[[${executionState}]] <- state transformed.`)
            return s
        })
    }

    const [trail, setTrail] = useState<List<[number, number]>>(List.of())

    const [serialPorts, setSerialPorts] = useState<[SerialPort, SerialPort]>(getSerialPorts(["COM3", "COM4"]))
    const [currentPos, setCurrentPos] = useState<[number, number]>([0, 0])
    const [formulaString, setFormulaString] = useState<string>("")



    let buttons: Array<JSX.Element> = [<button>Crashed!</button>]
    let input: JSX.Element = <input type="text" value={formulaString}
                                    onChange={(event) => setFormulaString(event.target.value)}
                                    className={"border-2"}
    />
    function stepForward(){
        console.log(`stepForward. timerID: ${timerStepForward}`)
        if(path.size == 0) {
            changeExecutionState("Ready")
            return
        }
        const [xPosInMillimeters, yPosInMillimeters] = path.get(0) as [number, number]
        setPath(path.shift())
        console.log("stepForward: Will send serial commands.")
        try {
            serialWriteAndRead(`moveabs ${xPosInMillimeters}`, (data) => console.log(`Serial/moveabs x ${data}`), serialPorts[0])
            serialWriteAndRead(`moveabs ${yPosInMillimeters}`, (data) => console.log(`Serial/moveabs y ${data}`), serialPorts[1])
            serialWriteAndRead(`pfb`, (data) => {
                setCurrentPos(prevState => {
                    const posX = serialParseToPos(data)
                    setTrail(prevState2 => prevState2.push([posX, prevState[1]]))
                    return [posX, prevState[1]]
                });
            }, serialPorts[0])
            serialWriteAndRead(`pfb`, (data) => {
                setCurrentPos(prevState => [prevState[0], serialParseToPos(data)])
            }, serialPorts[1])
        }catch (e) {
            console.log("stepForward/catch serial operations failed!")
            changeExecutionState("Pause")
        }
    }
    switch (executionState) {
        case "Ready":
            function handleStartButtonPressed() {
                let formula = compile(formulaString)
                let pathX = linespace(0, xyAxisPositionLimitInMillimeters[0], numberOfStep) as number[]
                let pathY =  pathX.map(x => formula.evaluate({x}) as number) as number[]
                //console.log(`zip(): ${zip(pathX, pathY)}\n`)
                setPath(List(zip(pathX, pathY)))
                if(timerStepForward == 0){
                    setTimerStepForward(setInterval(() => stepForward(), pollingIntervalInMilliseconds))
                }
                changeExecutionState("Idle")
            }
            buttons = [<button onClick={handleStartButtonPressed}>Execute</button>]
            console.log("buttons inits.")

            break

        case "Pause":
            console.log("App/switch Pause.")
            clearInterval(timerStepForward)
            console.log(`Timer of ${timerStepForward} forward should be cleared.`)
            function handleContinueButtonPressed() {
                serialClosePorts(["COM3", "COM4"])
                try{
                    setSerialPorts(getSerialPorts(["COM3", "COM4"]))
                    setTimerStepForward(setInterval(stepForward, pollingIntervalInMilliseconds))
                    changeExecutionState("Idle")
                }catch (e){
                    console.log(`Pause/Continue Error! Can not resume. ${e.message}`)
                }
            }
            function handleStopButtonPressed(){
                setTrail(List())
                setPath(List())
                setTimerStepForward(0)
                changeExecutionState("Ready")
            }

            buttons = [
                <button onClick={handleContinueButtonPressed}>Continue</button>,
                <button onClick={handleStopButtonPressed}>Stop</button>]

            break

        case "Idle":
            console.log("App/switch Idle.")
            function handlePauseButtonPressed(){
                changeExecutionState("Pause")
            }
            buttons = [<button onClick={handlePauseButtonPressed}>Pause</button>]
            break
    }


    return <div className={"p-6 max-w-screen-md mx-auto bg-white rounded-xl shadow-lg flex-col items-center space-x-4"}>
        <Chart height={300} width={600} path={path.toArray()} trail={trail.toArray()} />
        <div className={"flex justify-around mx-auto p-auto"}>
            <div className={"w-64 p-1 m-1"}>{input}</div>
            <div className={"rounded bg-slate-200 p-1 m-1"}>{buttons[0]}</div>
            {buttons.length >= 2? <div className={"rounded bg-slate-200 p-1 m-1"}>{buttons[1]}</div> : null}
        </div>
    </div>
}