import type React from "react";
export interface DefaultState {
    currentStep: string;
}
export type DefaultMetadata = object;
export interface ComponentProps<State extends DefaultState, Metadata extends DefaultMetadata> {
    metadata: Metadata;
    state: State;
    setState: (state: State) => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
}
export interface Step<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, Slug extends StepSlugs = StepSlugs> {
    slug: Slug;
    component: React.ComponentType<ComponentProps<State, Metadata>>;
    isComplete?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isEnabled?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isSubmittable?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isSkipped?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isJourneyEnd?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    showPreviousButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    showNextButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    showSubmitButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    enableNextButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    previousStep?: (state: State, logicalPreviousStep: StepSlugs | undefined, steps: ComputedSteps<StepSlugs, State, Metadata>) => StepSlugs | undefined;
    nextStep?: (state: State, logicalNextStep: StepSlugs | undefined, steps: ComputedSteps<StepSlugs, State, Metadata>) => StepSlugs | undefined;
}
export type Steps<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, SpecificSlug extends StepSlugs = StepSlugs> = Map<SpecificSlug, Step<StepSlugs, State, Metadata, SpecificSlug>>;
export interface ComputedStep<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, Slug extends StepSlugs = StepSlugs> extends Omit<Step<StepSlugs, State, Metadata, Slug>, "showPreviousButton" | "showNextButton" | "previousStep" | "nextStep"> {
    slug: Slug;
    component: Step<StepSlugs, State, Metadata, Slug>["component"];
    isComplete: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isEnabled: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isSubmittable: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isSkipped: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    isJourneyEnd: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    showPreviousButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    showNextButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    showSubmitButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    enableNextButton: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => boolean;
    previousStep: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => ComputedStep<StepSlugs, State, Metadata> | undefined;
    nextStep: (state: State, computed: ComputedSteps<StepSlugs, State, Metadata>) => ComputedStep<StepSlugs, State, Metadata> | undefined;
}
export type ComputedSteps<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, SpecificSlug extends StepSlugs = StepSlugs> = Map<SpecificSlug, ComputedStep<StepSlugs, State, Metadata, SpecificSlug>>;
export interface CurrentStep<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, Slug extends StepSlugs> {
    slug: Slug;
    component: Step<StepSlugs, State, Metadata, Slug>["component"];
    isComplete: boolean;
    isEnabled: boolean;
    isSubmittable: boolean;
    isSkipped: boolean;
    isJourneyEnd: boolean;
    showPreviousButton: boolean;
    showNextButton: boolean;
    showSubmitButton: boolean;
    enableNextButton: boolean;
    previousStep: Slug | undefined;
    nextStep: Slug | undefined;
    hasPreviousStep: boolean;
    hasNextStep: boolean;
}
