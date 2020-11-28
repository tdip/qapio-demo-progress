import * as React from "react"
import * as ReactDom from "react-dom"

function MainComponent(props: {}) {

    return (
        <div>
            Hello! Good Monrning, How Are you! I am the Sun!
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
