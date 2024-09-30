import {default as ApexChart} from "react-apexcharts";


export default function Chart({height, width, path, trail}: {height: number, width: number, path: Array<[number, number]>, trail: Array<[number, number]>}) {
    let series = [
        {data: path, name:"path"},
        {data: trail, name: "trail"},
    ];

    let options: object = {
        chart: {
            type: 'line',
            width,
            height,
        },
        stroke: {
            width: 4,
            curve: 'smooth'
        },
        xaxis: {
            type: 'numeric'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                gradientToColors: [ '#FDD835'],
                shadeIntensity: 1,
                type: 'horizontal',
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100, 100, 100]
            },
        }
    };

    return <ApexChart className={"mx-auto"} type={"line"} options={options} series={series} width={"600"} />;
}