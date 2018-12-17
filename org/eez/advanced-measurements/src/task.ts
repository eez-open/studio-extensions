export interface IChart {
    data: number[];
    samplingRate: number;
    xAxes: {
        unit: string;
    };
    yAxes: {
        minValue?: number;
        maxValue?: number;
        unit: string;
    };
}

export interface IInput {
    // no. of samples per second
    samplingRate: number;
    getSampleValueAtIndex(index: number): number;
}

export interface IMeasureTask extends IInput {
    // x value of the first sample (at xStartIndex)
    xStartValue: number;
    // index of the first sample to use for measurement
    xStartIndex: number;
    // total number of samples to use for measurement
    xNumSamples: number;

    // inputs in case when arity is > 1
    inputs: IInput[];

    parameters?: any;

    // store measurement result to this property
    result: number | string | IChart | null;
}
