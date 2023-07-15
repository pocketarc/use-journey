export function getStepsMap(val) {
    return new Map(val.map((step) => [step.slug, step]));
}
export function isStepSlug(val, steps) {
    return val !== undefined && steps.has(val);
}
