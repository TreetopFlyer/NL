const Util = {
    Sigmoid(inValue:number, inBias:number = Math.E)
    {
        return 1 / (1 + Math.pow(inBias, -inValue));
    },
    Colorize(inSigmoid:number)
    {
        let sig = (inSigmoid * 2) - 1;
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
        return [red, blue];
    }
};

class Connection
{
    Neuron:Neuron
    Weight:number;

    constructor(inNeuron:Neuron, inW:number)
    {
        this.Neuron = inNeuron;
        this.Weight = inW;
    }
}

class Neuron
{
    Receptive:Array<Connection>;
    Lateral:Array<Connection>;
    Output:number;
    OutputReceptive:number;
    OutputLateral:number;
    Meta:any;

    constructor()
    {
        this.Receptive = [];
        this.Lateral = [];
        this.Output = 0;
        this.OutputReceptive = 0;
        this.OutputLateral = 0;
        this.Meta = {};
    }
    Wire(inArray:Array<Connection>, inNeuron:Neuron, inWeight:number)
    {
        inArray.push(new Connection(inNeuron, inWeight));
    }
    WireReceptive(inN:Neuron, inW:number)
    {
        this.Wire(this.Receptive, inN, inW);
    }
    WireLateral(inN:Neuron, inW:number)
    {
        this.Wire(this.Lateral, inN, inW);
    }
    Update()
    {
        let connection:any;

        this.Output = 0;

        this.OutputReceptive = 0;
        for(connection of this.Receptive)
        {
            this.OutputReceptive += connection.Neuron.OutputReceptive * connection.Weight;
        }
        this.OutputReceptive = Util.Sigmoid(this.OutputReceptive, 1.3);

        this.OutputLateral = 0;
        for(connection of this.Lateral)
        {
            this.OutputLateral += connection.Neuron.OutputLateral * connection.Weight;
        }
        this.OutputLateral = Util.Sigmoid(this.OutputLateral, 1.3);
    }
}

class Layer
{
    Members:Array<Array<Neuron>>;
    Width:number;
    Height:number;
    Meta:any;

    constructor(inWidth:number, inHeight:number)
    {
        var x:number, y:number;
        var row:Array<Neuron>;

        this.Members = [];
        for(x=0; x<inWidth; x++)
        {
            row = [];
            this.Members.push(row);
            for(y=0; y<inHeight; y++)
            {
                row.push(new Neuron());
            }
        }

        this.Width = inWidth;
        this.Height = inHeight;
        this.Meta = {};
    }
    IterateAll(inProcessor:Function)
    {
        var x:number, y:number;

        for(x=0; x<this.Width; x++)
        {
            for(y=0; y<this.Height; y++)
            {
                inProcessor(this.Members[x][y], x, y);
            }
        }
    }
    IterateRadial(inX:number, inY:number, inRadius:number, inProcessor:Function)
    {
        var x:number, y:number;
        var minX:number, minY:number, maxX:number, maxY:number;
        var offX:number, offY:number;
        var distance:number;

        inX = Math.floor(inX);
        inY = Math.floor(inY);

        minX = inX - inRadius;
        minY = inY - inRadius;
        maxX = inX + inRadius + 1;
        maxY = inY + inRadius + 1;

        for(x=minX; x<maxX; x++)
        {
            if(x<0 || x>=this.Width)
            {
                continue;
            }
            else
            {
                offX = x - inX;
            }
            
            for(y=minY; y<maxY; y++)
            {
                if(y<0 || y>=this.Height)
                {
                    continue;
                }
                else
                {
                    offY = y - inY;
                    distance = Math.sqrt(offX*offX + offY*offY);
                    if(distance <= inRadius)
                    {
                        inProcessor(this.Members[x][y], x, y, distance);
                    }
                }
            }
        }
    }
    WireLateral(inRadius:number, inPercentage:number)
    {
        this.IterateAll((inCurrent:Neuron, inCX:number, inCY:number)=>
        {
            this.IterateRadial(inCX, inCY, inRadius, (inNeighbor:Neuron, inNX:number, inNY:number, inDistance:number)=>
            {
                // connect each Neighbor to Current
                inCurrent.WireLateral(inNeighbor, inDistance/inRadius > inPercentage ? -1 : 1);
            });
        });
    }
    WireReceptive(inRadius:number, inPercentage:number, inInputLayer:Layer)
    {
        var percX:number, percY:number;

        this.IterateAll((inCurrent:Neuron, inCX:number, inCY:number)=>
        {
            percX = inCX/(this.Width-1);
            percY = inCY/(this.Height-1);

            inInputLayer.IterateRadial(inInputLayer.Width*percX, inInputLayer.Height*percY, inRadius, (inVisible:Neuron, inVX:number, inVY:number, inDistance:number)=>
            {
                // connect each Visible to Current
                inCurrent.WireReceptive(inVisible, inDistance/inRadius > inPercentage ? -1 : 2);
            });
        });
    }
    Update()
    {
        this.IterateAll((inCurrent:Neuron, inCX:number, inCY:number)=>
        {
            inCurrent.Update();
        });
        return;
        this.IterateAll((inCurrent:Neuron, inCX:number, inCY:number)=>
        {
            inCurrent.Output = Util.Sigmoid(inCurrent.Output + inCurrent.SampleLateral());
        });
    }
}

class Network
{
    Layers:Array<Layer>;
    Meta:any;

    constructor()
    {
        this.Layers = [];
        this.Meta = {};
    }
    Layer(
        inWidth:number,
        inHeight:number,
        inLateralRadius:number,
        inLateralPercent:number,
        inReceptiveRadius?:number,
        inReceptivePercent?:number
    )
    {
        let layer = new Layer(inWidth, inHeight);
        layer.WireLateral(inLateralRadius, inLateralPercent);

        if(this.Layers.length != 0)
        {
            layer.WireReceptive(inReceptiveRadius, inReceptivePercent, this.Layers[this.Layers.length-1]);
        }

        this.Layers.push(layer);
    }
    IterateAll(inProcessor:Function)
    {
        this.Layers.forEach((inLayer:Layer, inIndex:number) => inProcessor(inLayer, inIndex));
    }
    Update()
    {
        this.IterateAll((inLayer:Layer, inIndex:number) =>
        {
            if(inIndex != 0)
            {
                inLayer.Update();
            }
        });
    }
}

export {Connection, Neuron, Layer, Network, Util}