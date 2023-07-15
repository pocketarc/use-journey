import React, { useCallback, useMemo, useRef, useState } from "react";
export function getStepsMap(val) {
    return new Map(val.map((step) => [step.slug, step]));
}
function isStepSlug(val, steps) {
    return val !== undefined && steps.has(val);
}
function computeStep(step) {
    var _a;
    const getPreviousStep = (state, computed) => {
        const keys = Array.from(computed.keys());
        const index = keys.indexOf(step.slug);
        let logicalPreviousStep = undefined;
        for (let i = index - 1; i >= 0; i--) {
            const slug = keys[i];
            if (slug) {
                const previousStep = computed.get(slug);
                if (previousStep && !previousStep.isSkipped(state, computed)) {
                    logicalPreviousStep = previousStep;
                    break;
                }
            }
        }
        if (step.previousStep) {
            const previousStep = step.previousStep(state, logicalPreviousStep === null || logicalPreviousStep === void 0 ? void 0 : logicalPreviousStep.slug, computed);
            return previousStep ? computed.get(previousStep) : undefined;
        }
        else {
            return logicalPreviousStep;
        }
    };
    const getNextStep = (state, computed) => {
        const keys = Array.from(computed.keys());
        const index = keys.indexOf(step.slug);
        let logicalNextStep = undefined;
        for (let i = index + 1; i < keys.length; i++) {
            const slug = keys[i];
            if (slug) {
                const nextStep = computed.get(slug);
                if (nextStep && !nextStep.isSkipped(state, computed)) {
                    logicalNextStep = nextStep;
                    break;
                }
            }
        }
        if (step.nextStep) {
            const nextStep = step.nextStep(state, logicalNextStep === null || logicalNextStep === void 0 ? void 0 : logicalNextStep.slug, computed);
            return nextStep ? computed.get(nextStep) : undefined;
        }
        else {
            return logicalNextStep;
        }
    };
    const isJourneyEnd = (state, computed) => step.isJourneyEnd ? step.isJourneyEnd(state, computed) : false;
    const isComplete = (state, computed) => (step.isComplete ? step.isComplete(state, computed) : true);
    return {
        slug: step.slug,
        component: step.component,
        metadata: (_a = step.metadata) !== null && _a !== void 0 ? _a : {},
        isComplete: isComplete,
        isEnabled: (state, computed) => (step.isEnabled ? step.isEnabled(state, computed) : true),
        isSubmittable: (state, computed) => (step.isSubmittable ? step.isSubmittable(state, computed) : true),
        isSkipped: (state, computed) => (step.isSkipped ? step.isSkipped(state, computed) : false),
        previousStep: getPreviousStep,
        nextStep: getNextStep,
        isJourneyEnd: isJourneyEnd,
        showPreviousButton: (state, computed) => {
            if (step.showPreviousButton) {
                return step.showPreviousButton(state, computed);
            }
            else {
                const previousStep = getPreviousStep(state, computed);
                return previousStep !== undefined && !isJourneyEnd(state, computed);
            }
        },
        showNextButton: (state, computed) => {
            if (step.showNextButton) {
                return step.showNextButton(state, computed);
            }
            else {
                const nextStep = getNextStep(state, computed);
                return nextStep !== undefined && !isJourneyEnd(state, computed);
            }
        },
        showSubmitButton: (state, computed) => {
            if (step.showSubmitButton) {
                return step.showSubmitButton(state, computed);
            }
            else {
                return isJourneyEnd(state, computed);
            }
        },
        enableNextButton: (state, computed) => {
            if (step.enableNextButton) {
                return step.enableNextButton(state, computed);
            }
            else {
                return isComplete(state, computed);
            }
        },
    };
}
export function useJourney(steps, state, setState) {
    const [, updateState] = useState({});
    const forceUpdate = useCallback(() => updateState({}), []);
    const stepsString = JSON.stringify(steps);
    const stateString = JSON.stringify(state);
    const computedSteps = useMemo(() => {
        const computed = new Map();
        for (const step of steps.values()) {
            computed.set(step.slug, computeStep(step));
        }
        return computed;
    }, [stepsString]);
    const pendingStepChange = useRef(undefined);
    const getCurrentStep = (step, state, computed) => {
        const previousStep = step.previousStep(state, computed);
        const nextStep = step.nextStep(state, computed);
        const newCurrentStep = {
            slug: step.slug,
            component: step.component,
            metadata: step.metadata,
            nextStep: nextStep === null || nextStep === void 0 ? void 0 : nextStep.slug,
            previousStep: previousStep === null || previousStep === void 0 ? void 0 : previousStep.slug,
            isComplete: step.isComplete(state, computed),
            isEnabled: step.isEnabled(state, computed),
            isSubmittable: step.isSubmittable(state, computed),
            isSkipped: step.isSkipped(state, computed),
            isJourneyEnd: step.isJourneyEnd(state, computed),
            showPreviousButton: step.showPreviousButton(state, computed),
            showNextButton: step.showNextButton(state, computed),
            showSubmitButton: step.showSubmitButton(state, computed),
            enableNextButton: step.enableNextButton(state, computed),
            hasPreviousStep: step.previousStep(state, computed) !== undefined,
            hasNextStep: step.nextStep(state, computed) !== undefined,
        };
        if (pendingStepChange.current === "previous") {
            pendingStepChange.current = undefined;
            if (isStepSlug(newCurrentStep.previousStep, steps)) {
                const previousStep = computedSteps.get(newCurrentStep.previousStep);
                if (previousStep) {
                    setState(Object.assign(Object.assign({}, state), { currentStep: previousStep.slug }));
                }
            }
        }
        else if (pendingStepChange.current === "next") {
            pendingStepChange.current = undefined;
            if (isStepSlug(newCurrentStep.nextStep, steps)) {
                const nextStep = computedSteps.get(newCurrentStep.nextStep);
                if (nextStep) {
                    setState(Object.assign(Object.assign({}, state), { currentStep: nextStep.slug }));
                }
            }
        }
        return newCurrentStep;
    };
    const currentStep = useMemo(() => {
        const slug = state.currentStep;
        if (isStepSlug(slug, steps)) {
            const computedStep = computedSteps.get(slug);
            if (computedStep) {
                return getCurrentStep(computedStep, state, computedSteps);
            }
            else {
                throw new Error(`currentStep slug doesn't exist: ${slug}`);
            }
        }
        else {
            throw new Error(`Invalid currentStep slug: ${slug}`);
        }
    }, [stateString, stepsString, pendingStepChange.current]);
    const goToPreviousStep = () => {
        pendingStepChange.current = "previous";
        forceUpdate();
    };
    const goToNextStep = () => {
        pendingStepChange.current = "next";
        forceUpdate();
    };
    const previousStep = currentStep.previousStep ? computedSteps.get(currentStep.previousStep) : undefined;
    const nextStep = currentStep.nextStep ? computedSteps.get(currentStep.nextStep) : undefined;
    const CurrentStep = () => {
        const props = {
            metadata: currentStep.metadata,
            state: state,
            setState: setState,
            goToNextStep: goToNextStep,
            goToPreviousStep: goToPreviousStep,
        };
        return React.createElement(currentStep.component, Object.assign({}, props));
    };
    return {
        CurrentStep,
        goToNextStep,
        goToPreviousStep,
        hasNextStep: currentStep.hasNextStep,
        hasPreviousStep: currentStep.hasPreviousStep,
        previousStep: previousStep,
        nextStep: nextStep,
        isComplete: currentStep.isComplete,
        showPreviousButton: currentStep.showPreviousButton,
        showNextButton: currentStep.showNextButton,
        isJourneyEnd: currentStep.isJourneyEnd,
        showSubmitButton: currentStep.showSubmitButton,
        enableNextButton: currentStep.enableNextButton,
        slug: currentStep.slug,
        metadata: currentStep.metadata,
        isEnabled: currentStep.isEnabled,
        isSubmittable: currentStep.isSubmittable,
        isSkipped: currentStep.isSkipped,
    };
}
