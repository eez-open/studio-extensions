"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(task) {
    let sum = 0;
    const xEndIndex = task.xStartIndex + task.xNumSamples;
    for (let i = task.xStartIndex; i < xEndIndex; ++i) {
        const sample = task.getSampleValueAtIndex(i);
        if (!isNaN(sample)) {
            sum += sample * sample;
        }
    }
    task.result = Math.sqrt(sum / task.xNumSamples);
}
exports.default = default_1;
