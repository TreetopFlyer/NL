import {render, html, svg} from "lit-html";
import App from "./mini-framework/";
import { Util, Connection, Neuron, Layer, Network } from "./nl";

var settings = {
    radius:5,
    gap:5
};
const layout = {
    start:0,
    scale:(inValue:number) => inValue*(settings.radius+settings.radius+settings.gap) + settings.gap
};

const network = new Network();
network.Layer(10, 5, 4, 0.5);
network.Layer(3, 10, 4, 0.5, 4, 0.5);
network.Layer(5, 5, 3, 0.5, 4, 0.5);

layout.start = 0;
network.IterateAll((inLayer:Layer, inIndex:number) =>
{
    inLayer.Meta.X = layout.start;
    inLayer.Meta.Y = 0;
    inLayer.IterateAll((inNeuron:Neuron, inX:number, inY:number)=>
    {
        inNeuron.Meta.X = layout.scale(inX) + layout.start;
        inNeuron.Meta.Y = layout.scale(inY);
    });
    layout.start += layout.scale(inLayer.Width);
});

App(
    {
        Network:network,
        Selected:[]
    },
    {
        Select(inNeuron:Neuron, model:any, event:Event)
        {
            model.Selected.forEach(element => {
                element.Meta.Selected = false;
            });
            model.Selected = [inNeuron];
            inNeuron.Meta.Selected = true;
        }
    },
    {
        Layout(inModel:any, send:Function, draw:Function)
        {
            return svg`
            <svg width="800" height="800" viewBox="0 0 600 500">
                ${draw("Layer", null, inModel.Network.Layers)}
                ${draw("ConnectionsLateral", null, inModel.Selected)}
            </svg>`;
        },
        Layer(inLayer:Layer, send:Function, draw:Function)
        {
            let output = [];
            inLayer.IterateAll( (inNeuron, inX, inY) =>
            {
                output.push(draw("Neuron", inNeuron));
            });
            return svg`
            ${output}
            `;
        },
        Neuron(inNeuron:Neuron, send:Function)
        {
            let style = inNeuron.Meta.Selected ? "fill:#ffaa00" : "fill:#000000";
            return svg`
            <circle
                cx=${inNeuron.Meta.X}
                cy=${inNeuron.Meta.Y}
                r=${settings.radius}
                style=${style}
                @mouseover=${send("Select", inNeuron)}
            ></circle>
            `;
        },

        ConnectionsLateral(inNeuron:Neuron, send:Function, draw:Function)
        {
            let output = [];
            let drawConnection = (inConnection:Connection) =>
            {
                let sig = (Util.Sigmoid(inConnection.Weight) * 2) - 1;
                let red = 0;
                let blue = 0;
                if(sig >= 0)
                {
                    red = 255 * sig;
                }
                else
                {
                    blue = 255 * -sig;
                }
                let style = `stroke:rgb(${red}, 0, ${blue}); stroke-width:1; pointer-events:none;`;
                
                //
                output.push( svg`
                <line x1=${inNeuron.Meta.X} y1=${inNeuron.Meta.Y} x2=${inConnection.Neuron.Meta.X} y2=${inConnection.Neuron.Meta.Y} style=${style} />
                <circle cx=${inConnection.Neuron.Meta.X} cy=${inConnection.Neuron.Meta.Y} r=${settings.radius/2} style="fill:rgb(${red}, 0, ${blue});"></circle>
                ` );
            };

            inNeuron.Lateral.map(drawConnection);
            inNeuron.Receptive.map(drawConnection);

            return output;
        }
    },
    "Layout",
    document.querySelector("#App")
);