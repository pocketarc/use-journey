import React from "react";
import type { ComponentProps, ComputedStep, ComputedSteps, DefaultMetadata, DefaultState, Step, Steps } from "./types";
import { getStepsMap } from "./types";
export type { ComponentProps, Step, Steps, ComputedStep, ComputedSteps, DefaultState, DefaultMetadata };
export { getStepsMap };
export declare function useJourney<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata>(steps: Steps<StepSlugs, State, Metadata>, state: State, setState: (state: State) => void): {
    CurrentStep: () => React.JSX.Element;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    hasNextStep: boolean;
    hasPreviousStep: boolean;
    previousStep: ComputedStep<StepSlugs, State, Metadata, StepSlugs> | undefined;
    nextStep: ComputedStep<StepSlugs, State, Metadata, StepSlugs> | undefined;
    isComplete: boolean;
    showPreviousButton: boolean;
    showNextButton: boolean;
    isJourneyEnd: boolean;
    showSubmitButton: boolean;
    enableNextButton: boolean;
    slug: StepSlugs;
    metadata: Metadata;
    isEnabled: boolean;
    isSubmittable: boolean;
    isSkipped: boolean;
};