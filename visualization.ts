import {render, html, svg} from "lit-html";
import App from "./mini-framework/";
import { Util, Connection, Neuron, Layer, Network } from "./nl";

var settings = {
    radius:4,
    gap:1
};
const layout = {
    start:0,
    scale:(inValue:number) => inValue*(settings.radius+settings.radius+settings.gap) + settings.gap
};

const network = new Network();
network.Layer(20, 20, 1, 0.5);
network.Layer(20, 20, 3, 0.5, 3, 0.6);
network.Layer(20, 20, 3, 0.5, 4, 0.5);
network.IterateAll((inLayer:Layer, inIndex:number) =>
{
    inLayer.Meta.X = layout.start;
    inLayer.Meta.Y = 0;
    inLayer.IterateAll((inNeuron:Neuron, inX:number, inY:number)=>
    {
        inNeuron.Meta.X = layout.scale(inX) + layout.start + inIndex*5;
        inNeuron.Meta.Y = layout.scale(inY);
    });
    layout.start += layout.scale(inLayer.Width);
});

network.Layers[0].IterateAll((inNeuron:Neuron)=>inNeuron.OutputReceptive = -1);
network.Layers[0].IterateRadial(5, 6, 8, (inNeuron:Neuron)=>inNeuron.OutputReceptive = 1);
//network.Update();

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
        },
        Update(inNetwork:Network)
        {
            inNetwork.Update();
        }
    },
    {
        Layout(inModel:any, send:Function, draw:Function)
        {
            return html`
            <div>
                <button @click=${send("Update", inModel.Network)}>update</button>
                <div>
                    ${draw("Selected", null, inModel.Selected)}
                </div>
                <div>
                    ${draw("Network", inModel)}
                </div>
            </div>
            `;
        },
        Selected(inSelected:Neuron, send:Function, draw:Function)
        {
            return html`<p>${inSelected.Output} | ${inSelected.OutputReceptive} | ${inSelected.OutputLateral}</p>`;
        },
        Network(inModel:any, send:Function, draw:Function)
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
            let colors = Util.Colorize(inNeuron.OutputReceptive);
            let style = `fill:rgb(${colors[0]}, 0, ${colors[1]});`;
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
                let colors = Util.Colorize(Util.Sigmoid(inConnection.Weight));
                let rgb = `rgb(${colors[0]}, 0, ${colors[1]})`;
                let style = `stroke:${rgb}; stroke-width:1; pointer-events:none;`;
                
                //
                output.push( svg`
                <line x1=${inNeuron.Meta.X} y1=${inNeuron.Meta.Y} x2=${inConnection.Neuron.Meta.X} y2=${inConnection.Neuron.Meta.Y} style=${style} />
                <circle cx=${inConnection.Neuron.Meta.X} cy=${inConnection.Neuron.Meta.Y} r=${settings.radius/2} style="fill:${rgb};"></circle>
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