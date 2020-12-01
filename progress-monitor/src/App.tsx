
import * as React from "react"
import {getStyles} from './styles_Graphics'
import { VictoryLine, VictoryChart, VictoryZoomContainer, VictoryAxis} from 'victory';
import './styles.scss';

const {InfluxDB} = require('@influxdata/influxdb-client')

    const token = 'eq7dSOgd_afLSeNPXsmbh05BtT-YgSOavpv7up0dR4wpxV6QHNMIiQPfCaokprFL3mQqazQSmiq9NisyTlnPog=='
    const org = 'qapio'
    const bucket = 'qapio'
    const client = new InfluxDB({url: 'http://localhost:8086', token: token})

interface tabla {x: Date, y: number};
type ReactForm = React.FormEvent<HTMLFormElement>;
type ReactFormInput = React.FormEvent<HTMLInputElement>;

function App() {
  var temp:tabla[]=[];

  const [date, setDate] = React.useState({init:"", end:""});
  const [arreglo, setArreglo] = React.useState<tabla[]>(temp);
  const [datos, setDatos] = React.useState<tabla[]>([]);
  const [styles, setStyles] = React.useState(getStyles());

  
  const handleInputChange = (event: ReactFormInput) => {
    const element = event.target as HTMLInputElement;
    setDate({
        ...date,
        [element.name] : element.value
    })
  }

  const dataInflux = () => {

    const queryApi = client.getQueryApi(org)

    const query = `from(bucket: "${bucket}")
      |> range(start: ${date.init}T00:00:00Z, stop: ${date.end}T23:59:00Z)
      |> filter(fn: (r) => r._measurement == "go_gc_duration_seconds")
      |> filter(fn: (r) => r._field == "count")
      `;

    queryApi.queryRows(query, {
      next(row:any, tableMeta:any) {
        const o = tableMeta.toObject(row)
        var nume = parseFloat(`${o._value}`)
        var fecha = o._time;
        if(nume >= 0 || nume < 0){
        temp.push({ x: new Date(fecha.toString()), y: nume})
      }
      },
      error(error:any) {
        console.error(error)
        console.log('\\nFinished ERROR')
        
      },
      complete() {
        console.log('\\nFinished SUCCESS')
      },
    })
    
  }

  const handleSubmit = (event:ReactForm) => {
    event.preventDefault();

    if(date.init !== '' || date.end !== ''){
      dataInflux();
      setArreglo(temp);
      console.log("hola")
      //setArreglo(dataInflux());
    }
    setDate({init:"", end:""})
    setDatos(arreglo)
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
          <VictoryAxis
            style={styles.dependet}
          />
          <VictoryAxis dependentAxis
            style={styles.independet}
          />
            
          <VictoryLine

            style={{data: {stroke: "tomato"}}}
            data={datos}
            
            
          />
          </VictoryChart>
      </div>
    </React.Fragment>
  );
}

export default App;