import * as React from "react";

import {VictoryLine, VictoryBar, VictoryChart, VictoryZoomContainer, VictoryAxis,} from "victory";
import ReactLoading from "react-loading";
import { DateRange, DateRangePicker } from "@blueprintjs/datetime";
import { Classes} from "@blueprintjs/core";

import { getStyles } from "./styles/styles_Graphics";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.scss";

const { InfluxDB } = require("@influxdata/influxdb-client");

const token = "TV5r7CtALtoRh8JnTAfH-fsF-ByvIpz2cWibe0ElhK_ou-WO6PTD_xn95RkSzh4T3DVxyE14TCUukCzl8d60cQ==";
const org = "qapio";
const bucket = "qapio";
const client = new InfluxDB({ url: "http://localhost:8086", token: token });

interface tabla {x: Date; y: number;}
type ReactFormInput = React.FormEvent<HTMLInputElement>;
type ReactFormSelect = React.FormEvent<HTMLSelectElement>;

function App() {

  const [date, setDate] = React.useState({ init: "", end: "" });
  const [dateRange, setDateRange] = React.useState([null, null]);
  const [arreglo, setArreglo] = React.useState<tabla[]>([]);
  const [styles, setStyles] = React.useState(getStyles());
  const [msg, setMsg] = React.useState(
    <div className="loading">
      <ReactLoading className="bubble" type="spinningBubbles" color="#ffffff" />
    </div>
  );
  const [loading, setLoading] = React.useState(false);
  const [equidList, setEquid] = React.useState([]);
  const [factorList, setFactor] = React.useState([]);
  const [info, setInfo] = React.useState({factor: "", measur: ""})

  

  const queryResults = `from(bucket: "${bucket}")
      |> range(start: ${dateToString(new Date(dateRange[0]), true)}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]), true)}T23:59:00Z)
      |> filter(fn: (r) => r._measurement == "go_gc_duration_seconds")
      |> filter(fn: (r) => r._field == "count")
      |> aggregateWindow(fn: mean, every: 24h)
      `;

  const handleInputChange = (event: ReactFormInput) => {
    const element = event.target as HTMLInputElement;
    setDate({
      ...date,
      [element.name]: element.value,
    });
  };

  const handleSelect = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    if(element.value !== ""){
    const queryEquid = `from(bucket: "${bucket}")
      |> range(start: ${dateToString(new Date(dateRange[0]), true)}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]), true)}T23:59:00Z)
        |> filter(fn: (r) => r._field == "${element.value}")
        |> columns()
        |> keep(columns: ["_measurement"])
        |> group(columns: ["_measurement"])
        |> distinct()
      `;
    dataInflux(queryEquid, 3);
    setArreglo([])
    setInfo({factor: element.value, measur: ""})
    }
  }

  const handleMeasurement = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    if(element.value !== ""){
      setArreglo([])
    const queryEquid = `from(bucket: "${bucket}")
      |> range(start: ${dateToString(new Date(dateRange[0]), true)}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]), true)}T23:59:00Z)
        |> filter(fn: (r) => r._measurement == "${element.value}")
        |> filter(fn: (r) => r._field == "${info.factor}")
        |> aggregateWindow(fn: mean, every: 24h)
      `;
      setLoading(true)
    dataInflux(queryEquid, 1);
    
    setInfo({factor: info.factor, measur: element.value})
    }
  }

  const dataInflux = (query:string, option: number) => {
    const queryApi = client.getQueryApi(org);

    queryApi.queryRows(query, {
      next(row: any, tableMeta: any) {
        const o = tableMeta.toObject(row);
        switch(option){
          case 1:
            var nume = parseFloat(`${o._value}`);
            var fecha = o._time;
            if (nume >= 0 || nume < 0) {
              setArreglo((arreglo) => [
                ...arreglo,
                { x: new Date(fecha.toString()), y: nume },
              ]);
            }
            break;

            case 2:
              setFactor((factorList) => [...factorList, o._field])
            break;

            case 3:
              setEquid((equidList) => [...equidList, o._measurement])
            break;

          default:
            console.log("error")
          }
      },
      error(error: any) {
        console.error(error);
        console.log("\\nFinished ERROR");
      },
      complete() {
        setLoading(false);
        console.log("\\nFinished SUCCESS");
      },
    });
  };

  const sendData = () => {
    if (dateRange[0] !== null || dateRange !== null) {
      setLoading(true);
      setArreglo([]);
      dataInflux(queryResults, 1);
    }
  };

  const handleDateChange = (dateRange: DateRange) => {
    setDateRange( dateRange );
    if(dateRange[0] !== null && dateRange[1] !== null){
      setFactor([])
      var queryFactorList = `from(bucket: "qapio") 
        |> range(start: ${dateToString(new Date(dateRange[0]), true)}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]), true)}T23:59:00Z)
        |> columns()
        |> keep(columns: ["_field"])
        |> group(columns: ["_field"])
        |> distinct()`
      dataInflux(queryFactorList, 2);
  }
  };

  function dateToString(date: Date, option = false){
    var year = (date.getFullYear()).toString();
    var month = (date.getMonth() + 1).toString();

    if(date.getDate() <= 9){
      var day = "0" + (date.getDate()).toString();
    }else{
      var day = (date.getDate()).toString();
    }
    
    if(option){
      return (year + "-" + month + "-" + day).toString();
    }else{
      return (day + "/" + month + "/" + year).toString();
    }
  }

  const formatBar = arreglo.map(x => dateToString(x.x));

  return (
    <React.Fragment>
     {console.log(factorList)}
      <header id="header">
      </header>

      <div className="container-fluid gridContainer">
        <div className="row">

          <aside className="col-md-3 comands">
            <br/>
            <select className="selectFactor" onChange={handleSelect}>
              <option key={0} value="">Select Factor</option>
              {factorList.map((x, index) => <option key={index + 1} value={x}>{x}</option>)}
            </select>
            
            <br/>
            <div className={Classes.DARK}>
              <DateRangePicker
              shortcuts={false}
              singleMonthOnly={true}
              onChange={handleDateChange}
              />
            </div>
           
            <br />
            <button id="submit" onClick={sendData} type="submit">
              Search
            </button>
          </aside>

          <div className="col-md-9">
            <div>
              <h1>{info.factor}</h1><br/>
              <h2>{info.measur}</h2><br/>
            </div>
            <div className="grafico">
            {loading ? (
              msg
            ) : (
              <VictoryChart
              height={300} width={700}
              domainPadding={20}
              padding={{ top: 20, bottom: 50, left: 35, right: 15 }}
        >

          <VictoryAxis
            style={styles.dependet}
            standalone={false}
            tickValues={arreglo.map(x => x.x)}
            tickFormat={formatBar}
          />
          <VictoryAxis
            dependentAxis
            standalone={false}
            style={styles.independet}
            tickFormat={(x) => (x)}
          />
          <VictoryBar
            barWidth={20}
            standalone={false}
            data={arreglo}
            x="x"
            y="y"
            labels={arreglo.map(x => parseInt(x.y))}
            style={{ data: { fill: "#4472c3ff"}}}
          />
        </VictoryChart>
            )}
            <br></br>
            </div>
            <select className="selectEquid" onChange={handleMeasurement}>
              <option key={0} value="">Equidad</option>
              {equidList.map((x, index) => <option key={index + 1} value={x}>{x}</option>)}
            </select>
           
            <select >
              <option>Graphic</option>
            </select>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;