import * as React from "react";

import logo from './logo.svg';

import {VictoryLine, VictoryBar, VictoryChart, VictoryZoomContainer, VictoryVoronoiContainer, VictoryAxis, VictoryTooltip} from "victory";
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

  const [dateRange, setDateRange] = React.useState([null, null]);
  const [arreglo, setArreglo] = React.useState<tabla[]>([]);
  const [styles, setStyles] = React.useState(getStyles());
  const [loading, setLoading] = React.useState({graphic:false, factor:false, measurement:false});
  const [equidList, setEquid] = React.useState([]);
  const [factorList, setFactor] = React.useState([]);
  const [info, setInfo] = React.useState({factor: "", measur: "", graphic: "bars"})
  const [msg, setMsg] = React.useState(
    <div className="loading">
      <ReactLoading className="charge" type="spinningBubbles" color="#ffffff"/>
    </div>
  );
  const tooltip = (
  <VictoryTooltip
  flyoutStyle={{
    stroke: "none", fill:"#1e1e1eff"}}
  />)

  //CREATE FACTOR'S LIST -- Selection range date
  const handleDateChange = (dateRange: DateRange) => {
    setDateRange( dateRange );
    setInfo({factor: "", measur:"", graphic: info.graphic})
    setArreglo([]);
    if(dateRange[0] !== null && dateRange[1] !== null){
      setFactor([]);
      setEquid([]);
      
      var queryFactorList = `from(bucket: "qapio") 
        |> range(start: ${dateToString(new Date(dateRange[0]), true)}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]), true)}T23:59:00Z)
        |> columns()
        |> keep(columns: ["_field"])
        |> group(columns: ["_field"])
        |> distinct()`;
      setLoading({graphic:false, factor:true, measurement:false})
      dataInflux(queryFactorList, 2);
    }
  };

  //CREATE MEASUREMENTE LIST -- Selecting a Factor
  const handleSelect = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    setEquid([]);
    if(element.value !== ""){
      setLoading({graphic: false, factor: false, measurement: true})
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
    setInfo({factor: element.value, measur: "", graphic: info.graphic})
    }
  }

  //GET DATE FOR GRAPHIC -- selecting a measurement
  const handleMeasurement = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    if(element.value !== ""){
      setArreglo([])
    const queryEquid = `from(bucket: "${bucket}")
      |> range(start: ${dateToString(new Date(dateRange[0]), true)}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]), true)}T23:59:00Z)
      |> filter(fn: (r) => r._measurement == "${element.value}")
      |> filter(fn: (r) => r._field == "${info.factor}")
      |> aggregateWindow(fn: mean, every: 1d)
      `;
    setLoading({graphic:true, factor:false, measurement:false})
    dataInflux(queryEquid, 1);
    
    setInfo({factor: info.factor, measur: element.value, graphic:info.graphic})
    }
  }

  //Change graphic's type
  const handleChangeGraphic = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    setInfo({factor: info.factor, measur: info.measur, graphic: element.value})
    if(element.value !== ""){
      if(element.value === "bars"){
        setGraphic(defaultGraphic);
      }else{
        setGraphic(lineGraphic);
      }
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
        setLoading({graphic:false, factor:false, measurement:false})
        console.log("\\nFinished SUCCESS");
      },
    });
  };

  //create a string date to send influx
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

  //VictoryBars
  const defaultGraphic = (
    <VictoryChart
      height={300} width={700}
      domainPadding={45}
      padding={{ top: 10, bottom: 55, left: 35, right: 15 }}
    >

      <VictoryAxis
        style={styles.independent}
        tickValues={arreglo.map(x => x.x)}
        tickFormat={arreglo.map(x => x.x.toLocaleDateString())}
      />
      <VictoryAxis
        dependentAxis
        style={arreglo.length >= 1 ? styles.dependent : styles.dependentNull}
      />
      <VictoryBar
        labelComponent={tooltip}
        data={arreglo}
        labels={arreglo.map(x => (x.y).toFixed(2))}
        style={styles.bars}
        animate={{
          duration: 2000,
          onLoad: { duration: 1000 }
        }}
      />
    </VictoryChart>
  )
  
  //victoryLine
  const lineGraphic = (
    <VictoryChart
      scale={{ x: "time" }}
      height={300} width={700}
      padding={{ top: 10, bottom: 55, left: 35, right: 15 }}
      containerComponent={<VictoryVoronoiContainer/>}
    >
      {arreglo.length <= 1 ? (
        <></>
      ) : (
        <VictoryAxis style={styles.independent} />
      )}
      <VictoryAxis dependentAxis 
      style={arreglo.length >= 1 ? styles.dependent : styles.dependentNull}/>

      <VictoryLine
      
        labelComponent={tooltip}
        style={styles.line}
        data={arreglo}
        labels={arreglo.map(x => (x.y).toFixed(2))}
        animate={{
          duration: 2000,
          onLoad: { duration: 1000 },
        }}
        
      />
    </VictoryChart>
  )

  const [graphic, setGraphic] = React.useState(defaultGraphic)

  React.useEffect(() => {
    if(info.graphic === "bars"){
      setGraphic(defaultGraphic);
    }
    if(info.graphic === "line" && arreglo.length > 1){
      setGraphic(lineGraphic);
    }else{
      setGraphic(defaultGraphic);
      setInfo({factor: info.factor, measur: info.measur, graphic: "bars"})
    }
  }, [arreglo])

  return (
    <React.Fragment>

      <header id="header">
        <div className="logo">
          <img src={logo} alt=""/>
        </div>
      </header>

      <div className="container-fluid gridContainer">
        <div className="row">

          <aside className="col-sm-3 comands">
            <div className="factor">
              <select className="selectFactor" onChange={handleSelect} disabled={loading.factor} value={info.factor}>
                <option key={0} value="">Factor</option>
                {factorList.map((x, index) => <option key={index + 1} value={x}>{x}</option>)}
              </select>
              {loading.factor ? (<ReactLoading className="charge" height={20} width={40} type="bubbles" color="#ffffff" />) : (<></>)}
            </div>
            <br/>
            <div className="datePicker">
              <div className={Classes.DARK}>
                <DateRangePicker
                shortcuts={false}
                singleMonthOnly={true}
                onChange={handleDateChange}
                />
              </div>
            </div>
          </aside>

          <section className="col-sm-9">
            <article className="information">
              <div id="dates">
                {dateRange[0] !== null && dateRange[1] !== null ? (<h5 id="initDate">{new Date(dateRange[0]).toDateString()}</h5>) : (<></>)}
                {dateRange[0] !== null && dateRange[1] !== null ? (<h5 id="endDate">{new Date(dateRange[1]).toDateString()}</h5>) : (<></>)}
              </div>
            </article>

            <div className="grafico">
            {loading.graphic ? (msg) : (
              graphic
            )}
            <br></br>

            </div>

            <article className="graphicOption">
              <div id="selectMeasurement">
              <select className="selectEquid" onChange={handleMeasurement} disabled={loading.measurement} value={info.measur}>
                <option key={0} value="">Measurement</option>
                {equidList.map((x, index) => <option key={index + 1} value={x}>{x}</option>)}
              </select>
              {loading.measurement ? (<ReactLoading className="charge" height={20} width={40} type="bubbles" color="#ffffff" />) : (<></>)}
              </div>
              <div id="selectGraphic">
                <select className="selectGraphic" onChange={handleChangeGraphic} value={info.graphic}>
                  <option value="bars">Bar Graphic</option>
                  <option value="line" disabled={arreglo.length <= 0 ? true : false}>Line Graphic</option>
                </select>
              </div>
            </article>
          </section>

        </div>
      </div>
    </React.Fragment>
  );
}

export default App;