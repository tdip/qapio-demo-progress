import * as React from "react";
import Iframe from 'react-iframe';

export class MyUI extends React.Component<any, any> {
    public render() {
        return <div><Iframe url="http://www.youtube.com/embed/xDMP3i36naA"
        width="450px"
        height="450px"
        id="myId"
        className="myClassname"
        display="initial"
        position="relative"/></div>
    }
}