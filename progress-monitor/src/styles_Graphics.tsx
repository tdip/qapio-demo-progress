export function getStyles() {

    return {
      // Y
      dependet: {
        axis: { stroke: "white", strokeWidth: 1},
        
        tickLabels: {
          fill: "white",
          fontFamily: "inherit",
          fontSize: 16
        }
      },

      // X
      independet: {
        grid: {
          stroke: ({ tick }) =>
            tick === -10 ? "transparent" : "#ffffff",
          strokeWidth: 0.5
        },
        axis: { stroke: "#ffffff", strokeWidth: 0 },
        ticks: { strokeWidth: 0 },
        tickLabels: {
          fill: "#ffffff",
          fontFamily: "inherit",
          fontSize: 16
        }
      }
    };
  }

