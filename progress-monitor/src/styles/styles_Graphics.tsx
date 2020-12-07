import { Background } from "victory"

export function getStyles() {

  const BLUE_BAR = "#cfdae0ff";
  const BLUE_BARS = "#4472c3ff";
    return {
      parent: {
        background: "transparent",
        boxSizing: "border-box",
        display: "inline",
        padding: 0,
        fontFamily: "'Fira Sans', sans-serif"
      },
      // X
      dependet: {
        grid: { strokeWidth: 0},

        axis: { stroke: "white", strokeWidth: 1},
        
        tickLabels: {
          padding: 25,
          fill: "white",
          fontFamily: "inherit",
          fontSize: 9,
          angle: -90
        }
      },

      // Y
      independet: {
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

      sideBar: {
        sidebar: { background: BLUE_BARS }
      }
    };
  }

