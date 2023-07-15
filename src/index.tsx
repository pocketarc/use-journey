import React, { useCallback, useMemo, useRef, useState } from "react";
import type { ComponentProps, ComputedStep, ComputedSteps, CurrentStep, DefaultMetadata, DefaultState, Step, Steps } from "./types";

export type { ComponentProps, Step, Steps, ComputedStep, ComputedSteps, DefaultState, DefaultMetadata };

/**
 * A helper function to create a typed map of steps.
 * By wrapping your steps in this function, TypeScript will automatically infer the type of the steps (slugs, state, etc) without you having to set it yourself.
 */
export function getStepsMap<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata>(
    val: Step<StepSlugs, State, Metadata>[],
): Steps<StepSlugs, State, Metadata> {
    return new Map(val.map((step) => [step.slug, step]));
}

function isStepSlug<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata>(
    val: string | undefined,
    steps: Steps<StepSlugs, State, Metadata>,
): val is StepSlugs {
    return val !== undefined && steps.has(val as StepSlugs);
}

function computeStep<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata>(
    step: Step<StepSlugs, State, Metadata, StepSlugs>,
): ComputedStep<StepSlugs, State, Metadata> {
    const getPreviousStep = (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>): ComputedStep<StepSlugs, State, Metadata> | undefined => {
        const keys = Array.from(computed.keys());
        const index = keys.indexOf(step.slug);
        let logicalPreviousStep: ComputedStep<StepSlugs, State, Metadata> | undefined = undefined;

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
            const previousStep = step.previousStep(state, logicalPreviousStep?.slug, computed);
            return previousStep ? computed.get(previousStep) : undefined;
        } else {
            return logicalPreviousStep;
        }
    };

    const getNextStep = (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>): ComputedStep<StepSlugs, State, Metadata> | undefined => {
        const keys = Array.from(computed.keys());
        const index = keys.indexOf(step.slug);
        let logicalNextStep: ComputedStep<StepSlugs, State, Metadata> | undefined = undefined;

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
            const nextStep = step.nextStep(state, logicalNextStep?.slug, computed);
            return nextStep ? computed.get(nextStep) : undefined;
        } else {
            return logicalNextStep;
        }
    };

    const isJourneyEnd = (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) =>
        step.isJourneyEnd ? step.isJourneyEnd(state, computed) : false;
    const isComplete = (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => (step.isComplete ? step.isComplete(state, computed) : true);

    return {
        slug: step.slug,
        component: step.component,
        metadata: step.metadata ?? ({} as Metadata),
        isComplete: isComplete,
        isEnabled: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => (step.isEnabled ? step.isEnabled(state, computed) : true),
        isSubmittable: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => (step.isSubmittable ? step.isSubmittable(state, computed) : true),
        isSkipped: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => (step.isSkipped ? step.isSkipped(state, computed) : false),
        previousStep: getPreviousStep,
        nextStep: getNextStep,
        isJourneyEnd: isJourneyEnd,
        showPreviousButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => {
            if (step.showPreviousButton) {
                return step.showPreviousButton(state, computed);
            } else {
                const previousStep = getPreviousStep(state, computed);
                return previousStep !== undefined && !isJourneyEnd(state, computed);
            }
        },
        showNextButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => {
            if (step.showNextButton) {
                return step.showNextButton(state, computed);
            } else {
                const nextStep = getNextStep(state, computed);
                return nextStep !== undefined && !isJourneyEnd(state, computed);
            }
        },
        showSubmitButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => {
            if (step.showSubmitButton) {
                return step.showSubmitButton(state, computed);
            } else {
                return isJourneyEnd(state, computed);
            }
        },
        enableNextButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => {
            if (step.enableNextButton) {
                return step.enableNextButton(state, computed);
            } else {
                return isComplete(state, computed);
            }
        },
    } satisfies ComputedStep<StepSlugs, State, Metadata>;
}

export function useJourney<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata>(
    steps: Steps<StepSlugs, State, Metadata>,
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>,
) {
    const [, updateState] = useState({});
    const forceUpdate = useCallback(() => updateState({}), []);
    const stepsString = JSON.stringify(steps);
    const stateString = JSON.stringify(state);
    const computedSteps = useMemo(() => {
        const computed: ComputedSteps<StepSlugs, State, Metadata> = new Map();

        for (const step of steps.values()) {
            computed.set(step.slug, computeStep(step));
        }

        return computed;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepsString]);
    const pendingStepChange = useRef<"previous" | "next" | undefined>(undefined);
    const getCurrentStep = (
        step: ComputedStep<StepSlugs, State, Metadata>,
        state: State,
        computed: ComputedSteps<StepSlugs, State, Metadata>,
    ): CurrentStep<StepSlugs, State, Metadata, StepSlugs> => {
        const previousStep = step.previousStep(state, computed);
        const nextStep = step.nextStep(state, computed);

        const newCurrentStep = {
            slug: step.slug,
            component: step.component,
            metadata: step.metadata,
            nextStep: nextStep?.slug,
            previousStep: previousStep?.slug,
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
        } satisfies CurrentStep<StepSlugs, State, Metadata, StepSlugs>;

        if (pendingStepChange.current === "previous") {
            pendingStepChange.current = undefined;
            if (isStepSlug<StepSlugs, State, Metadata>(newCurrentStep.previousStep, steps)) {
                const previousStep = computedSteps.get(newCurrentStep.previousStep);
                if (previousStep) {
                    setState({
                        ...state,
                        currentStep: previousStep.slug,
                    });
                }
            }
        } else if (pendingStepChange.current === "next") {
            pendingStepChange.current = undefined;
            if (isStepSlug<StepSlugs, State, Metadata>(newCurrentStep.nextStep, steps)) {
                const nextStep = computedSteps.get(newCurrentStep.nextStep);
                if (nextStep) {
                    setState({
                        ...state,
                        currentStep: nextStep.slug,
                    });
                }
            }
        }

        return newCurrentStep;
    };
    const currentStep = useMemo(() => {
        const slug = state.currentStep;
        if (isStepSlug<StepSlugs, State, Metadata>(slug, steps)) {
            const computedStep = computedSteps.get(slug);
            if (computedStep) {
                return getCurrentStep(computedStep, state, computedSteps);
            } else {
                throw new Error(`currentStep slug doesn't exist: ${slug}`);
            }
        } else {
            throw new Error(`Invalid currentStep slug: ${slug}`);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        return <currentStep.component {...props} />;
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
