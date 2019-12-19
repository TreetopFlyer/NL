const Util = {
    Sigmoid(inValue:number, inBias:number = Math.E)
    {
        return 1 / (1 + Math.pow(inBias, -inValue));
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
    Meta:any;

    constructor()
    {
        this.Receptive = [];
        this.Lateral = [];
        this.Output = 0;
        this.Meta = {};
    }
    Listen(inArray:Array<Connection>, inNeuron:Neuron, inWeight:number)
    {
        inArray.push(new Connection(inNeuron, inWeight));
    }
    ListenReceptive(inN:Neuron, inW:number)
    {
        this.Listen(this.Receptive, inN, inW);
    }
    ListenLateral(inN:Neuron, inW:number)
    {
        this.Listen(this.Lateral, inN, inW);
    }
    Sample(inArray:Array<Connection>)
    {
        let connection:any, total:number;

        total = 0;
        for(connection of inArray)
        {
            total += connection.Neuron.Output * connection.Weight;
        }
        return total;
    }   
    SampleLateral()
    {
        return this.Sample(this.Lateral);
    }
    SampleReceptive()
    {
        return this.Sample(this.Receptive);
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
        maxX = inX + inRadius;
        maxY = inY + inRadius;

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
                inCurrent.ListenLateral(inNeighbor, inDistance/inRadius > 0.5 ? -1 : 1);
            });
        });
    }
    WireReceptive(inRadius:number, inPercentage:number, inInputLayer:Layer)
    {
        var percX:number, percY:number;

        this.IterateAll((inCurrent:Neuron, inCX:number, inCY:number)=>
        {
            percX = inCX/this.Width;
            percY = inCY/this.Height;

            inInputLayer.IterateRadial(this.Width*percX, this.Height*percY, inRadius, (inVisible:Neuron, inVX:number, inVY:number, inDistance:number)=>
            {
                // connect each Visible to Current
                inCurrent.ListenReceptive(inVisible, inDistance/inRadius > 0.5 ? 1 : -1);
            });
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
        this.Layers.forEach((inLayer, inIndex) => inProcessor(inLayer, inIndex));
    }
}

export {Connection, Neuron, Layer, Network, Util}