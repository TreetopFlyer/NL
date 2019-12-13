
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
    X:number;
    Y:number;
    Receptive:Array<Connection>;
    Lateral:Array<Connection>;

    constructor()
    {
        this.Receptive = [];
        this.Lateral = [];
    }
    ListenReceptive(inN:Neuron, inW:number)
    {
        this.Receptive.push(new Connection(inN, inW));
    }
    ListenLateral(inN:Neuron, inW:number)
    {
        this.Lateral.push(new Connection(inN, inW));
    }
}

class Layer
{
    Members:Array<Array<Neuron>>;
    Width:number;
    Height:number;

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
                inCurrent.ListenLateral(inNeighbor, inDistance/inRadius > 0.5 ? 1 : -1);
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

