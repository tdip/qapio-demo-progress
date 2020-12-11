import { Background } from "victory"

export function getStyles() {

  const BASE_COLOR = "#4472c3ff";
  const BASE_COLOR_LIGTH = "#cfdae0ff";

    return {
      //victoryChart
      chart: {
        padding: { top: 10, bottom: 65, left: 35, right: 15 },
        height:300,
        width:700
      },
      // X
      independent: {
        grid: { strokeWidth: 0},

        axis: { stroke: "white", strokeWidth: 1},
        
        tickLabels: {
          padding: 32,
          fill: "white",
          fontFamily: "inherit",
          fontSize: 12,
          angle: -90
        }
      },

      // Y
      dependent: {
        grid: {
          stroke: "#ffffff",
          strokeWidth: 0.7
        },
        axis: { stroke: "#ffffff", strokeWidth: 0 },
        ticks: { strokeWidth: 0 },
        tickLabels: {
          fill: "#ffffff",
          fontFamily: "inherit",
          fontSize: 13
        }
      },

      dependentNull: {
        grid: {
          stroke: "#ffffff",
          strokeWidth: 0.7
        },
        axis: { stroke: "#ffffff", strokeWidth: 0 },
        ticks: { strokeWidth: 0 },
        tickLabels: {
          fill: "#ffffff",
          fontFamily: "inherit",
          fontSize: 0
        }
      },

      line: { 
        data: { stroke: BASE_COLOR },
        labels: {fill: BASE_COLOR_LIGTH}
      },

      bars: {
        data: { fill: BASE_COLOR},
        labels: {fill: BASE_COLOR_LIGTH}
      }
    };
  }

