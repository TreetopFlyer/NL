import {Connection, Neuron, Layer} from './nl';

var l1:Layer, l2:Layer;

l1 = new Layer(5, 5);
l2 = new Layer(5, 5);

l1.WireLateral(3, 0.5);
l2.WireLateral(3, 0.5);
l2.WireReceptive(3, 0.5, l1);

l2.IterateRadial(0.2, -1.2, 3, (inNeuron, inX, inY, inDistance)=>console.log(inNeuron, inX, inY, inDistance));
console.log(l1);