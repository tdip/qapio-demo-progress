type ResponseEntry = {
    readonly accept: (value: QapioGraphInstance) => any,
    readonly reject: (error: any) => any
}

const K_GRAPH_ID = "graphId";
const K_GRAPH = "graph";

export class QapioGraphInstance {

    private readonly endpoint : string = "ws://localhost:8080/graphStream"

    constructor(
        private readonly graphId: string) {}

    public getStreamWebsocket(name: string) {

        return new WebSocket(
            `${this.endpoint}?graphId=${this.graphId}&streamId=${name}`
        )
    }
}

export class QapioGraphRunner {

    private readonly endpoint : string = "ws://localhost:8080/graphRun";

    private readonly websocket : WebSocket;

    private readonly awaitWebsocketConnect : Promise<any>;

    private readonly pendingResponses : {[key: string]: ResponseEntry} = {};

    constructor() {
        this.websocket = new WebSocket(this.endpoint);
        this.awaitWebsocketConnect = new Promise(
            (accept, reject) => {

                this.websocket.onopen = event => {
                    accept();
                };

                this.websocket.onerror = event => {
                    reject(event);
                };
            }
        );

        this.websocket.onmessage = (event) => {

            const result = JSON.parse(event.data);
            const graphId = result[K_GRAPH_ID];
            const entry = this.pendingResponses[graphId];

            if(entry) {
                entry.accept(
                    new QapioGraphInstance(graphId)
                );
                delete this.pendingResponses[graphId];
            }
        };
    }

    private getResponsePromise(uid: string) : Promise<QapioGraphInstance> {

        return new Promise<QapioGraphInstance>(
            (accept, reject) => {

                this.pendingResponses[uid] = { accept, reject };
            }
        );
    }

    public async runGraph(graph: {}) : Promise<QapioGraphInstance> {

        const {v4: uuid} = await import("uuid");
        const graphId = uuid();
        await this.awaitWebsocketConnect;
        const result = this.getResponsePromise(graphId);

        this.websocket.send(
            JSON.stringify({
                graphId,
                graph
            })
        );

        return result;
    }
}

export function createGraphRunner() : QapioGraphRunner {

    return new QapioGraphRunner();
}