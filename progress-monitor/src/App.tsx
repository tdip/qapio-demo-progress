
import * as React from "react"
import {getStyles} from './styles_Graphics'
import { VictoryLine, VictoryChart, VictoryZoomContainer, VictoryAxis} from 'victory';
import ReactLoading from "react-loading";

import 'bootstrap/dist/css/bootstrap.min.css';
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
  const [styles, setStyles] = React.useState(getStyles());
  const [msg, setMsg] = React.useState(<div className="loading"><ReactLoading type="spinningBubbles" color="#ffffff"/></div>);
  const [loading, setLoading] = React.useState(false);

  
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
      |> aggregateWindow(fn: mean, every: 5m)`;

    queryApi.queryRows(query, {
      
      next(row:any, tableMeta:any) {
        
        const o = tableMeta.toObject(row)
        var nume = parseFloat(`${o._value}`)
        var fecha = o._time;
        if(nume >= 0 || nume < 0){
        setArreglo(arreglo => [...arreglo, { x: new Date(fecha.toString()), y: nume}])
      }
      },
      error(error:any) {
        console.error(error)
        console.log('\\nFinished ERROR')
        setMsg(<label>No results</label>)
        
      },
      complete() {
        setLoading(false)
        console.log('\\nFinished SUCCESS')
      },
    })
    
  }

  const sendData = () => {

    if(date.init !== '' || date.end !== ''){
      setLoading(true)
      dataInflux();
      
    }
    setDate({init:"", end:""})
  }


  return (
    <div className="container-fluid gridContainer">
      <div className="row">
        <div className="col-sm-9 grafico">
    
          {loading ? msg :(
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
              data={arreglo}
              
              
            />
          </VictoryChart>)}
        </div>
        <div className="col-sm-3 comands">
          <label>
              Inicio:
              <input name="init" type="date" value={date.init} onChange={handleInputChange} />
            </label>
            <br/>
            <label>
              Final:
              <input name="end" type="date" value={date.end} onChange={handleInputChange} />
            </label>
            <br/>
            <input onClick={sendData} type="submit" value="Submit" />
        </div>
      </div>
    </div>
  );
}

export default App;