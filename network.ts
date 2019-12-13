import {Connection, Neuron, Layer} from './nl';

var l1:Layer;

l1 = new Layer(5, 5);
l1.WireLateral(3, 0.5);
console.log(l1);