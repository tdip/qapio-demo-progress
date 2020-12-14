import * as React from "react";
import logo from './logo.svg'; //logo in header

import {VictoryLine, VictoryBar, VictoryChart, VictoryVoronoiContainer, VictoryAxis, VictoryTooltip} from "victory";
import ReactLoading from "react-loading";
import { DateRange, DateRangePicker } from "@blueprintjs/datetime";
import { Classes} from "@blueprintjs/core";
//styles
import { getStyles } from "./styles/styles_Graphics";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.scss";

//INFLUX API
const { InfluxDB } = require("@influxdata/influxdb-client");

const token = "TV5r7CtALtoRh8JnTAfH-fsF-ByvIpz2cWibe0ElhK_ou-WO6PTD_xn95RkSzh4T3DVxyE14TCUukCzl8d60cQ==";
const org = "qapio";
const bucket = "qapio";
const client = new InfluxDB({ url: "http://localhost:8086", token: token });

//types
interface tabla {x: Date; y: number;}
type ReactFormSelect = React.FormEvent<HTMLSelectElement>;

function App() {

  const [dateRange, setDateRange] = React.useState([null, null]); //saves the date range in the calendar
  const [arreglo, setArreglo] = React.useState<tabla[]>([]);// saves all data from inlux to the graphic
  const [styles, setStyles] = React.useState(getStyles());// get the styles from the graphics
  const [loading, setLoading] = React.useState({graphic:false, factor:false, measurement:false, id:false});// is used to show the loading screen when it's true
  const [id, setId] = React.useState([]);// save the ids in a date range
  const [equidList, setEquid] = React.useState([]);// saves the measurements from a chonsen factor
  const [factorList, setFactor] = React.useState([]);// saves the factor from a chonsen id
  const [info, setInfo] = React.useState({id: "", factor: "", measur: "", graphic: "bars"});// save the name from id, factor, measurement and graphic to do a query
  const [msg, setMsg] = React.useState( //is the loading screen 
    <div className="loading">
      <ReactLoading className="charge" type="spinningBubbles" color="#ffffff"/>
    </div>
  );
  const tooltip = ( // is the style of label in the graphic when mouse is on a point
  <VictoryTooltip
  flyoutStyle={{
    stroke: "none", fill:"#1e1e1eff"}}
  />);

//GET WINDOW DIMENSIONS--------------------------
  function getWindowDimensions() { //get the window dimension, is used for resize the graphic when window is samall, only work when reload the screen in the dimension you want
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  }
  
    const [windowDimensions, setWindowDimensions] = React.useState(getWindowDimensions());
  
    React.useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
//-----------------------------------------------  

  //HANDLE DATA CHANGE
  //when one date  is change, reboot all to search data in new date range
  const handleDateChange = (dateRange: DateRange) => {
    setDateRange( dateRange );
    setInfo({id: "", factor: "", measur:"", graphic: info.graphic});
    setArreglo([]);
    setId([])
    setFactor([]);
    setEquid([]);
    if(dateRange[0] !== null && dateRange[1] !== null){ //run when have a range, query only ask for the _screeningModelingId that exist in the date range
      var queryId = `from(bucket: "qapio") 
        |> range(start: ${dateToString(new Date(dateRange[0]))}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]))}T23:59:00Z)
        |> columns()
        |> keep(columns: ["_screeningModelId"])
        |> group(columns: ["_screeningModelId"])
        |> distinct()`;
      
      setLoading({graphic:false, factor:false, measurement:false, id:true});// the only loading screen is in the id
      dataInflux(queryId, 2); //number 2 is to save data in variable hook "id" 
    }
  };
  //HANDLE ID CHANGE
  //this not reboot the data range, and the graph type remains
  //the data will be in the drop down menu Factor
  const handleID = (event:any) =>{
    const element = event.target as HTMLLIElement;
    setInfo({id: element.innerText, factor: "", measur:"", graphic: info.graphic});// save the id selected
    setArreglo([]);
    setFactor([]);
    setEquid([]);
    //query ask for factors in the range and must have the id selected in _screeningModelId tag
    var queryFactorList = `from(bucket: "qapio") 
        |> range(start: ${dateToString(new Date(dateRange[0]))}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]))}T23:59:00Z)
        |> filter(fn: (r) => r._screeningModelId == "${element.innerText}")
        |> columns()
        |> keep(columns: ["_field"])
        |> group(columns: ["_field"])
        |> distinct()`;
    setLoading({graphic:false, factor:true, measurement:false, id:false});// only factor will show a loading screen
    dataInflux(queryFactorList, 3);//number 3 is to save data in variable hook "factor ist"
  }

  //HANDLE IN SLECT FACTOR
  //reboot graphic's data and the measurements
  //the data will be in drop down menu Measurement
  const handleSelect = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    setArreglo([]);
    setEquid([]);
    if(element.value !== ""){ //query ask for factors in the range and must have the id and selected in _screeningModelId tag and factor selected in _field
    const queryEquid = `from(bucket: "${bucket}")
      |> range(start: ${dateToString(new Date(dateRange[0]))}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]))}T23:59:00Z)
        |> filter(fn: (r) => r._field == "${element.value}")
        |> filter(fn: (r) => r._screeningModelId == "${info.id}")
        |> columns()
        |> keep(columns: ["_measurement"])
        |> group(columns: ["_measurement"])
        |> distinct()
      `;
    setLoading({graphic: false, factor: false, measurement: true, id: false});// the loading screen will be measurement
    dataInflux(queryEquid, 4);// number 4 is to save data in "equidList" hook variable 
    setInfo({id: info.id, factor: element.value, measur: "", graphic: info.graphic});//save the factor selected
    }
  }

  //HANDLE MEASUREMENT CANGE
  //only reboot the graphic's data
  //this ask for the graphic's data
  const handleMeasurement = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    if(element.value !== ""){
      setArreglo([])
      //query ask data for graphic with filters saves in "info" hook variable
    const queryEquid = `from(bucket: "${bucket}")
      |> range(start: ${dateToString(new Date(dateRange[0]))}T00:00:00Z, stop: ${dateToString(new Date(dateRange[1]))}T23:59:00Z)
      |> filter(fn: (r) => r._measurement == "${element.value}")
      |> filter(fn: (r) => r._field == "${info.factor}")
      |> filter(fn: (r) => r._screeningModelId == "${info.id}")
      |> aggregateWindow(fn: mean, every: 1d)
      `;
    setLoading({graphic:true, factor:false, measurement:false, id: false})//show loading screen in graphic's sapace
    dataInflux(queryEquid, 1); //number 1 saves data in "arreglo" hook varialbe
    
    setInfo({id: info.id, factor: info.factor, measur: element.value, graphic:info.graphic})//all data saved
    }
  }

  //CHANGE GRAPHIC'S TYPE
  //only show two type of graphics, bars and line
  const handleChangeGraphic = (event: ReactFormSelect) => {
    const element = event.target as HTMLSelectElement;
    setInfo({id: info.id, factor: info.factor, measur: info.measur, graphic: element.value}) //change graphic's type
    if(element.value !== ""){
      if(element.value === "bars"){
        setGraphic(defaultGraphic);
      }else{
        setGraphic(lineGraphic);
      }
    }
  }

  //INFLUX API
  const dataInflux = (query:string, option: number) => {
    const queryApi = client.getQueryApi(org);

    queryApi.queryRows(query, {
      next(row: any, tableMeta: any) {
        const o = tableMeta.toObject(row);
        switch(option){
          case 1: // save data in arreglo with type "tabla"
            var nume = parseFloat(`${o._value}`);
            var fecha = o._time;
            if (nume >= 0 || nume < 0) {
              setArreglo((arreglo) => [
                ...arreglo,
                { x: new Date(fecha.toString()), y: nume },
              ]);
            }
            break;

            case 2: //save the id's
              setId((id) => [...id, o._screeningModelId]);
            break;

            case 3://save factors in id selected
              setFactor((factorList) => [...factorList, o._field]);
            break;

            case 4://save measurement in factor selected
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
        //!!!-------------------------------
        //this line stops the loading screen, must be after finishing saving data in variables
        setLoading({graphic:false, factor:false, measurement:false, id:false}) 
        console.log("\\nFinished SUCCESS");
      },
    });
  };

  //CREATE STRING DATA TO SEND INFLUX
  //this is used to make a date that influx syntax accept
  function dateToString(date: Date){
    var year = (date.getFullYear()).toString();
    var month = (date.getMonth() + 1).toString();

    if(date.getDate() <= 9){
      var day = "0" + (date.getDate()).toString();
    }else{
      var day = (date.getDate()).toString();
    }

    return (year + "-" + month + "-" + day).toString();
  }

  //VICTORY BARS
  const defaultGraphic = (
    <VictoryChart
      height={windowDimensions.width <= 650 ? 290 : styles.chart.height} width={windowDimensions.width <= 650 ? 400 : styles.chart.width}
      padding={styles.chart.padding}
      domainPadding={45}
    >
      <VictoryAxis
        style={styles.independent}
        tickValues={arreglo.map(x => x.x)}
        tickFormat={arreglo.map(x => x.x.toLocaleDateString())}
      />
      {/*if arreglo is empty only show  horizontal lines*/ }
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
  
  //VICTORY LINE
  const lineGraphic = (
    <VictoryChart
      scale={{ x: "time" }}
      height={windowDimensions.width <= 650 ? 290 : styles.chart.height} width={windowDimensions.width <= 650 ? 400 : styles.chart.width}
      padding={styles.chart.padding}
      containerComponent={<VictoryVoronoiContainer/>}
    >
      <VictoryAxis style={styles.independent} />

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

  const [graphic, setGraphic] = React.useState(defaultGraphic); //This contain the graphic selected, Bars is default

  //when graphic's data change, this will update graphic with actual data
  //if only have 1 point and graphic "Line" is selected, this will change to bars
  //VictoryLine can't show only 1 point
  React.useEffect(() => {
    if(info.graphic === "bars"){
      setGraphic(defaultGraphic);
    }
    if(info.graphic === "line" && arreglo.length > 1){
      setGraphic(lineGraphic);
    }else{
      setGraphic(defaultGraphic);
      setInfo({id: info.id, factor: info.factor, measur: info.measur, graphic: "bars"})
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

          <aside className="col-md-3 col-sm-12 comands">
            <div className="IDBox">
              <header>ID</header>
              <div>
              {loading.id ? (<label><br/><ReactLoading className="charge" height={70} width={80} type="bubbles" color="#000000" /></label>) : 
              (id.map((x, index) => (<a key={index} onClick={handleID} href={"#" + x} id={x} className="target">{x}</a>)))}
              </div>
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

          <section className="col-md-9 col-sm-12 ">
            <article className="information">
              <div id="dates">
                {dateRange[0] !== null && dateRange[1] !== null ? (<h5 id="initDate">{new Date(dateRange[0]).toDateString()}</h5>) : (<></>)}
                {dateRange[0] !== null && dateRange[1] !== null ? (<h5 id="endDate">{new Date(dateRange[1]).toDateString()}</h5>) : (<></>)}
              </div>
            </article>

            <article className="grafico">
            {loading.graphic ? (msg) : (
              graphic
            )}
            <br></br>
            </article>

            <article className="graphicOption">
            <div id="selectFactor">
              <select className="selectFactor" onChange={handleSelect} disabled={loading.factor} value={info.factor}>
                <option key={0} value="">Factor</option>
                {factorList.map((x, index) => <option key={index + 1} value={x}>{x}</option>)}
              </select>
              {loading.factor ? (<ReactLoading className="charge" height={20} width={40} type="bubbles" color="#ffffff" />) : (<></>)}
            </div>
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
                  <option value="line" disabled={arreglo.length <= 1 ? true : false}>Line Graphic</option>
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