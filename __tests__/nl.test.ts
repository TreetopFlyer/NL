import * as NL from "../nl";

let nReceptive:NL.Neuron, nLateral:NL.Neuron, nTest:NL.Neuron;
let wLateral:number, wReceptive:number;
let oLateral:number, oReceptive:number

beforeAll(()=>
{
});

describe("Neuron", ()=>
{
    test("Should be able to create and connect Neurons", ()=>
    {
        nTest = new NL.Neuron();
        nLateral = new NL.Neuron();
        nReceptive = new NL.Neuron();

        wLateral = -0.5;
        wReceptive = 0.5;
        oLateral = 12;
        oReceptive = 5;

        nTest.ListenLateral(nLateral, wLateral);
        nTest.ListenReceptive(nReceptive, wReceptive);

        expect(nTest.Lateral.length).toBe(1);
        expect(nTest.Receptive.length).toBe(1);
    });
    test("a neuron should be able to sample outputs from other neurons", ()=>
    {
        nLateral.Output = oLateral;
        nReceptive.Output = oReceptive;

        expect(nTest.SampleLateral()).toBe(oLateral * wLateral);
        expect(nTest.SampleReceptive()).toBe(oReceptive * wReceptive);
    });
});