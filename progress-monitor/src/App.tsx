import * as React from "react";

import { Classes} from "@blueprintjs/core";

import { getStyles } from "./styles/styles_Graphics";
import {VictoryLine, VictoryBar, VictoryChart, VictoryZoomContainer, VictoryAxis,} from "victory";
import ReactLoading from "react-loading";
import { DateRange, DateRangePicker } from "@blueprintjs/datetime";
//import * as fa from "react-icons/fa";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.scss";

const { InfluxDB } = require("@influxdata/influxdb-client");

const token = "TV5r7CtALtoRh8JnTAfH-fsF-ByvIpz2cWibe0ElhK_ou-WO6PTD_xn95RkSzh4T3DVxyE14TCUukCzl8d60cQ==";
const org = "qapio";
const bucket = "qapio";
const client = new InfluxDB({ url: "http://localhost:8086", token: token });

interface tabla {
  x: Date;
  y: number;
}
type ReactForm = React.FormEvent<HTMLFormElement>;
type ReactFormInput = React.FormEvent<HTMLInputElement>;

function App() {
  var temp: tabla[] = [];

  const [date, setDate] = React.useState({ init: "", end: "" });
  const [dateRange, setDateRange] = React.useState([null, null]);
  const [arreglo, setArreglo] = React.useState<tabla[]>(temp);
  const [styles, setStyles] = React.useState(getStyles());
  const [msg, setMsg] = React.useState(
    <div className="loading">
      <ReactLoading type="spinningBubbles" color="#ffffff" />
    </div>
  );
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (event: ReactFormInput) => {
    const element = event.target as HTMLInputElement;
    setDate({
      ...date,
      [element.name]: element.value,
    });
  };

  const dataInflux = () => {
    const queryApi = client.getQueryApi(org);

    const query = `from(bucket: "${bucket}")
      |> range(start: ${date.init}T00:00:00Z, stop: ${date.end}T23:59:00Z)
      |> filter(fn: (r) => r._measurement == "go_gc_duration_seconds")
      |> filter(fn: (r) => r._field == "count")
      |> aggregateWindow(fn: mean, every: 12h)
      `;

    queryApi.queryRows(query, {
      next(row: any, tableMeta: any) {
        const o = tableMeta.toObject(row);
        var nume = parseFloat(`${o._value}`);
        var fecha = o._time;
        if (nume >= 0 || nume < 0) {
          setArreglo((arreglo) => [
            ...arreglo,
            { x: new Date(fecha.toString()), y: nume },
          ]);
        }
      },
      error(error: any) {
        console.error(error);
        console.log("\\nFinished ERROR");
        setMsg(<label>No results</label>);
      },
      complete() {
        setLoading(false);
        console.log("\\nFinished SUCCESS");
      },
    });
  };

  const sendData = () => {
    if (date.init !== "" || date.end !== "") {
      setLoading(true);
      dataInflux();
    }
  };

  const handleDateChange = (dateRange: DateRange) => setDateRange( dateRange );

  function dateToString(date: Date, option = false){
    var year = (date.getFullYear()).toString();
    var month = (date.getMonth() + 1).toString();
    var day = (date.getDate()).toString();

    if(option){
      return year + "-" + month + "-" + day;
    }else{
      return day + "/" + month + "/" + year;
    }
  }

  return (
    <React.Fragment>
      <header id="header">
      </header>

      <div className="container-fluid gridContainer">
        <div className="row">
        <aside className="col-sm-3 comands">
        <div className={Classes.DARK}>
        <DateRangePicker
        shortcuts={false}
        singleMonthOnly={true}
        className="datePiker"
        onChange={handleDateChange}

/></div>
            <label>
              From
              <br />
              <input
                name="init"
                type="date"
                value={date.init}
                onChange={handleInputChange}
              />
            </label>

            <label>
              To
              <br />
              <input
                name="end"
                type="date"
                value={date.end}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <button id="submit" onClick={sendData} type="submit">
              Search
            </button>
          </aside>
          <div className="col-sm-9 grafico">
            {loading ? (
              msg
            ) : (
              <VictoryChart
              height={200} width={400}
          domainPadding={20}
        >

          <VictoryAxis
            style={styles.dependet}
            standalone={false}
            tickValues={arreglo.map(x => x.x)}
            tickFormat={arreglo.map(x => dateToString(x.x)}
            
            //tickFormat={(x) => new Date(x).getFullYear()}
            
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
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;