import * as React from "react"
import { VictoryLine, VictoryChart, VictoryZoomContainer } from 'victory';
import './App.css';

interface tabla {x: Date, y: number};
type ReactForm = React.FormEvent<HTMLFormElement>;
type ReactFormInput = React.FormEvent<HTMLInputElement>;



function App() {
  const pru:tabla[]=[
    {x: new Date('2020-11-26T00:45:36.801318465Z'), y: 29},
    {x: new Date('2020-11-26T00:45:46.803954889Z'), y: 30},
    {x: new Date('2020-11-26T00:45:56.803168549Z'), y: 30},
    {x: new Date('2020-11-26T00:46:06.804979747Z'), y: 30},
    {x: new Date('2020-11-26T00:46:16.804199074Z'), y: 41}
    ];

  const [date, setDate] = React.useState({init:"", end:""});
  const [arreglo, setArreglo] = React.useState<tabla[]>(pru);
  
  const handleInputChange = (event: ReactFormInput) => {
    const element = event.target as HTMLInputElement;
    setDate({
        ...date,
        [element.name] : element.value
    })
  }

  const dataInflux = () => {
    const {InfluxDB} = require('@influxdata/influxdb-client')

    const token = 'uqHc90bGrOaAwv0LODYN9HnMCAWP_CEeqYyCSY0_fOf8nlZkxkhDMagQ-frTErlNIc0sVWZUW6PagaPtTHSVXA=='
    const org = 'qapio'
    const bucket = 'qapio'
    var temp:tabla[] = [];

    const client = new InfluxDB({url: 'http://localhost:8086', token: token})

    const queryApi = client.getQueryApi(org)

    const query = `from(bucket: "${bucket}") |> range(start: 2020-1-1)
    |> filter(fn: (r) => r._measurement == "go_gc_duration_seconds")
    |> filter(fn: (r) => r._field == "count")
    |> filter(fn: (r) => r._time >= ${date.init})
    |> filter(fn: (r) => r._time <= ${date.end})
    |> limit(n: 50)`
    queryApi.queryRows(query, {
      next(row:any, tableMeta:any) {
        const o = tableMeta.toObject(row)
        var nume = parseFloat(`${o._value}`)
        var fecha = o._time;
        temp.push({ x: new Date(fecha.toString()), y: nume})
      },
      error(error) {
        console.error(error)
        console.log('\\nFinished ERROR')
        setArreglo([])
      },
      complete() {
        console.log('\\nFinished SUCCESS')
      },
    })
    setArreglo(temp);
  }

  const handleSubmit = (event:ReactForm) => {
    if(date.init !== '' || date.end !== ''){
      dataInflux();
    }
    event.preventDefault();
    setDate({init:"", end:""})
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <label>
          Inicio:
          <input name="init" type="date" value={date.init} onChange={handleInputChange} />
        </label>
        <label>
          Final:
          <input name="end" type="date" value={date.end} onChange={handleInputChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>

      <div className="grafico">

        <VictoryChart
          scale={{x: "time"}}
          containerComponent={<VictoryZoomContainer/>}
        >
          <VictoryLine
            style={{data: {stroke: "tomato"}}}
            data={arreglo}
          />
          </VictoryChart>
      </div>
    </React.Fragment>
  );
}

export default App;