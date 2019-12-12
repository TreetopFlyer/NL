
class Connection
{
    Neuron:Neuron;
    Weight:number;

    constructor(inN:Neuron, inW:number)
    {
        this.Neuron = inN;
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
        inN.Receptive.push(new Connection(this, inW));
    }
    ListenLateral(inN:Neuron, inW:number)
    {
        inN.Lateral.push(new Connection(this, inW));
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
                        inProcessor(this.Members[x][y]);
                    }
                }
            }
        }
    }
    WireLateral(inRadius:number, inPercentage:number)
    {

    }
    WireReceptive(inRadius:number, inPercentage:number, inLayer:Layer)
    {

    }
}

