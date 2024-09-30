import Chart from "./Chart.tsx";
import {linespace} from "./utils.ts";
import _ from 'lodash-es'

export default function App() {

    return <div>
        <Chart height={300} width={600} path={linespace(1, 80, 100)} trail={}
    </div>
}