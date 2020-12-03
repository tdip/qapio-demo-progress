import * as React from "react";
import { getStyles } from "./styles/styles_Graphics";
import {VictoryLine, VictoryChart, VictoryZoomContainer, VictoryAxis,} from "victory";
import ReactLoading from "react-loading";
import * as fa from "react-icons/fa";
import Sidebar from "react-sidebar";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.scss";

const { InfluxDB } = require("@influxdata/influxdb-client");

const token = "RnFz0i1Y6T4DWjSKJycZ60OmIKdC6UijFfA3U0z1dfdI3-ZZHz-rXGh_CSt_VJ43gkQVsuctRkDj-L3Yu1IbWQ==";
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
  const [arreglo, setArreglo] = React.useState<tabla[]>(temp);
  const [styles, setStyles] = React.useState(getStyles());
  const [msg, setMsg] = React.useState(
    <div className="loading">
      <ReactLoading type="spinningBubbles" color="#ffffff" />
    </div>
  );
  const [loading, setLoading] = React.useState(false);
  const [sideBarState, setSideBarState] = React.useState(false);

  const handleInputChange = (event: ReactFormInput) => {
    const element = event.target as HTMLInputElement;
    setDate({
      ...date,
      [element.name]: element.value,
    });
  };

  async function start() {
    console.log("start")
    const qapio = await import("./qapio");

    /*
    Creates an instance to use the qapio API
    */
    const graphRunner = qapio.createGraphRunner();
    const graph = await graphRunner.runGraph([{
        nodes: {
            query: {
                selection: {
                    interface: "Tdip.Qapio.Runtimes.Api.ProcessOutputStreamInterface"
                }
            },
            influx: {
                selection: {
                    interface: "Tdip.Qapio.Services.InfluxDb.FluxQueryApi",
                    query: {
                        "url": "http://influx:8086",
                        "organization": "qapio",
                        "token": 'RnFz0i1Y6T4DWjSKJycZ60OmIKdC6UijFfA3U0z1dfdI3-ZZHz-rXGh_CSt_VJ43gkQVsuctRkDj-L3Yu1IbWQ=='
                    }
                }
            },
            result: {
                selection: {
                    interface: "Tdip.Qapio.Runtimes.Api.ProcessInputStreamInterface"
                }
            }
        },
        edges: [

            {
                from: "query",
                to: "influx"
            },

            {
                from: "influx",
                to: "result"
            }
        ]
    }]);
    const query = graph.getStreamWebsocket('query');
    const result = graph.getStreamWebsocket('result');

    result.onmessage =  (data) => {

        const values = JSON.parse(data.data);
        console.log("nom message")
        console.log(values);
    };

    query.onopen = () => {
        console.log("send")
        query.send(
            `
            from(bucket: "qapio")
            |> range(start: 2020-12-03T00:00:00Z, stop: 2020-12-03T23:59:00Z)
            |> filter(fn: (r) => r._measurement == "go_gc_duration_seconds")
            |> filter(fn: (r) => r._field == "count")
            |> aggregateWindow(fn: mean, every: 5m)
            `
        );
    };

}

  function onSetSidebarOpen(open: boolean) {
    setSideBarState(open);
  }

  const sendData = () => {
    if (date.init !== "" || date.end !== "") {
      setLoading(true);
      //dataInflux();
      console.log("llamada")
      start();
      console.log("despues de llamada")
    }
    setDate({ init: "", end: "" });
  };

  return (
    <Sidebar
      sidebar={<b>qapio</b>}
      open={sideBarState}
      onSetOpen={onSetSidebarOpen}
      styles={styles.sideBar}
    >
      <header id="header">
        <button id="openSideBar" onClick={() => onSetSidebarOpen(true)}>
          <fa.FaBars />
        </button>
      </header>

      <div className="container-fluid gridContainer">
        <div className="row">
          <div className="col-sm-9 grafico">
            {loading ? (
              msg
            ) : (
              <VictoryChart
                scale={{ x: "time" }}
                containerComponent={<VictoryZoomContainer />}
              >
                {arreglo.length <= 1 ? (
                  <></>
                ) : (
                  <VictoryAxis style={styles.dependet} />
                )}
                <VictoryAxis dependentAxis style={styles.independet} />

                <VictoryLine
                  style={{ data: { stroke: "tomato" } }}
                  data={arreglo}
                  animate={{
                    duration: 2000,
                    onLoad: { duration: 1000 },
                  }}
                />
              </VictoryChart>
            )}
          </div>
          <div className="col-sm-3 comands">
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
            <button onClick={sendData} type="submit">
              Search
            </button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

export default App;
