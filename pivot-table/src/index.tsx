import * as React from "react"
import * as ReactDom from "react-dom"

import { MainComponent } from "./pivot-table"
import {MyUI} from "./pivot-table";

const start = async () => {

/*    const qapio = await import("./qapio");

    const graphRunner = qapio.createGraphRunner();
    const graph = await graphRunner.runGraph([{
        nodes: {
            prices: {
                selection: {
                    interface: "Tdip.Qapio.Services.Core.SubInterface",
                    query: {
                        topic: "price-events"
                    }
                }
            },
            input: {
                selection: {
                    interface: "Tdip.Qapio.Runtimes.Api.ProcessInputStreamInterface"
                }
            }
        },
        edges: [
            {
                from: "prices",
                to: "input"
            }
        ]
    }]);

    const ws = graph.getStreamWebsocket('input');*/

    ReactDom.render(
        <MyUI /*feed={ws} *//>,
        document.getElementById("root")
    );

    // console.log("hello", graph);
}

start();