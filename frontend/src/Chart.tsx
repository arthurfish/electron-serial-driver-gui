import {default as ApexChart} from "react-apexcharts";


export default function Chart({height, width, path, trail}: {height: number, width: number, path: Array<[number, number]>, trail: Array<[number, number]>}) {
    let series = [{data: path}, {data: trail}];

    let options: object = {
        chart: {
            height,
            width,
            type: 'line',
        },
        stroke: {
            width: 5,
            curve: 'smooth'
        },
        xaxis: [{
            type: 'numeric'
        },{
            type: 'numeric'
        }],
        yaxis: [{
            title: {text: 'path'}
        }, {
            title: {text: 'trail'}
        }],
        title: {
            text: 'Forecast',
            align: 'left',
            style: {
                fontSize: "16px",
                color: '#666'
            }
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

    return <ApexChart type={"line"} options={options} series={series} />;
}