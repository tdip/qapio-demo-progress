async function start() {

    const qapio = await import("./qapio");

    /*
    Creates an instance to use the qapio API
    */
    const graphRunner = qapio.createGraphRunner();

    /*
    Qapio allows for the consturction of graphs through which data flows.
    A graph is simply a set of nodes that are connectd in a particular way.
    Nodes are units that perform some type of work. The nodes section
    identifies the nodes that will be part of the graph and the edges
    describes how the nodes are connected.

    The behavior of the node is described by interfaces. There exists many
    different interfaces in Qapio and each perform a different function.
    */
    const graph = await graphRunner.runGraph([{
        nodes: {

            /*
            The "Tdip.Qapio.Runtimes.Api.ProcessOutputStreamInterface" interface is used
            to allow a HTML page to write data into Qapio.
            */
            query: {
                selection: {
                    interface: "Tdip.Qapio.Runtimes.Api.ProcessOutputStreamInterface"
                }
            },

            /*
            The "Tdip.Qapio.Services.InfluxDb.FluxQueryApi" allow sending queries to influx
            and will output the results.
            */
            influx: {
                selection: {
                    interface: "Tdip.Qapio.Services.InfluxDb.FluxQueryApi",
                    query: {
                        "url": "http://localhost:8086",
                        "organization": "qapio",
                        "token": 'eq7dSOgd_afLSeNPXsmbh05BtT-YgSOavpv7up0dR4wpxV6QHNMIiQPfCaokprFL3mQqazQSmiq9NisyTlnPog=='
                    }
                }
            },

            /*
            The "Tdip.Qapio.Runtimes.Api.ProcessInputStreamInterface" allows reading data from
            qapio into the web page.
            */
            result: {
                selection: {
                    interface: "Tdip.Qapio.Runtimes.Api.ProcessInputStreamInterface"
                }
            }
        },
        edges: [

            /*
            We connect the query node where the webpage will write queries to the input of
            the influx node. So that way we can send queries to the influx node from our
            website.
            */
            {
                from: "query",
                to: "influx"
            },

            /*
            The output of the influx node is written to the result node. This allows the
            web page to read the values that influx produces.
            */
            {
                from: "influx",
                to: "result"
            }
        ]
    }]);

    /*
    Get a websocket that allows writing data to the query node of the graph
    */
    const query = graph.getStreamWebsocket('query');

    /*
    GEt a websocket that allows reading results from influx
    */
    const result = graph.getStreamWebsocket('result');

    result.onmessage =  (data) => {

        const values = JSON.parse(data.data);

        console.log(values);
    };

    query.onopen = () => {

        query.send(
            `
            from(bucket: "qapio")
            |> range(start: 2020-12-01T00:00:00Z, stop: 2020-12-02T23:59:00Z)
            |> filter(fn: (r) => r._measurement == "go_gc_duration_seconds")
            |> filter(fn: (r) => r._field == "count")
            |> aggregateWindow(fn: mean, every: 5m)
            `
        );
    };

}

window.addEventListener('load', start);