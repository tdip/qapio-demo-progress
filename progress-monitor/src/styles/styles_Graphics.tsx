import { Background } from "victory"

export function getStyles() {

  const BLUE_BAR = "#cfdae0ff";
  const BLUE_BARS = "#4472c3ff";
  const TOOLTIP  = "#1e1e1eff";
    return {
      // X
      independent: {
        grid: { strokeWidth: 0},

        axis: { stroke: "white", strokeWidth: 1},
        
        tickLabels: {
          padding: 25,
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
        data: { stroke: "#4472c3ff" },
        labels: {fill:"#cfdae0ff"}
      },

      bars: {
        data: { fill: "#4472c3ff"},
        labels: {fill:"#cfdae0ff"}
      }
    };
  }

