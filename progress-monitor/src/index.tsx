import * as React from "react"
import * as ReactDom from "react-dom"

function MainComponent(props: {}) {

    return (
        <div>
            ALO!
        </div>
    );
}

const start = async (event) => {

    ReactDom.render(
        <MainComponent />,
        document.getElementById("root")
    );
}

window.addEventListener('load', start);
