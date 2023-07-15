import type React from "react";

/**
 * The default state type. An object containing the property `currentStep`, which is always required. All state extends this object.
 */
export interface DefaultState {
    currentStep: string;
}

/**
 * The default metadata type. Just an empty object. All metadata extends this object.
 */
export type DefaultMetadata = object;

/**
 * The props passed to every component in the journey.
 */
export interface ComponentProps<State extends DefaultState, Metadata extends DefaultMetadata> {
    metadata?: Metadata;
    state: State;
    setState: (state: State) => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
}

/**
 * A step in the journey, as defined by the developer.
 */
export interface Step<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, Slug extends StepSlugs = StepSlugs> {
    /**
     * The slug of the step. This is used to identify the step and to navigate to it.
     */
    slug: Slug;

    /**
     * The component to render for the step. This is the component that will be rendered when the user is on this step.
     */
    component: React.ComponentType<ComponentProps<State, Metadata>>;

    /**
     * The metadata of the step. This is used to store additional information about the step that you can use in your custom logic.
     * This is not used by useJourney itself.
     */
    metadata?: Metadata;

    /**
     * Whether the step is complete.
     *
     * @default true
     */
    isComplete?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether the step is enabled. If disabled, the step will not show up in the journey.
     * This is useful for steps that are only shown conditionally.
     *
     * @default true
     */
    isEnabled?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether the step is submittable. If not submittable, the 'submit' / 'next' button will not be shown in the journey.
     * This is useful for the last step in the journey. It should not be used to prevent the user from submitting the form if the step is not complete.
     * For that, use `isComplete` instead.
     *
     * @default true
     */
    isSubmittable?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether the step is skipped. If skipped, the step won't be considered when hitting 'previous' or 'next'.
     * This is useful for steps that are only shown conditionally.
     *
     * @default false
     */
    isSkipped?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether this step represents the end of the journey. If so, the 'next' button will not be shown in the journey.
     * This is useful for steps that represent a 'thank you' page or a 'success' page.
     *
     * @default true if the step is the last step in the journey, taking into account skipped steps
     */
    isJourneyEnd?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether to show the 'previous' button in the journey.
     *
     * @default true if the step is not the first step in the journey, taking into account skipped steps
     */
    showPreviousButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether to show the 'next' button in the journey.
     *
     * @default true if the step is not the last step in the journey, taking into account skipped steps
     */
    showNextButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether to show the 'submit' button in the journey.
     *
     * @default true if the step is the last step in the journey, taking into account skipped steps
     */
    showSubmitButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * Whether to enable the 'next' button in the journey. This is different from `showNextButton` in that it only disables the button, but still shows it.
     *
     * @default true if the current step is complete
     */
    enableNextButton?: (state: State, steps: ComputedSteps<StepSlugs, State, Metadata>) => boolean;

    /**
     * The previous step in the journey. This is used to navigate to the previous step when the user clicks the 'previous' button.
     *
     * @default the previous step in the journey, taking into account skipped steps
     */
    previousStep?: (state: State, logicalPreviousStep: StepSlugs | undefined, steps: ComputedSteps<StepSlugs, State, Metadata>) => StepSlugs | undefined;

    /**
     * The next step in the journey. This is used to navigate to the next step when the user clicks the 'next' button.
     *
     * @default the next step in the journey, taking into account skipped steps
     */
    nextStep?: (state: State, logicalNextStep: StepSlugs | undefined, steps: ComputedSteps<StepSlugs, State, Metadata>) => StepSlugs | undefined;
}

/**
 * A map of steps. The key is the slug of the step. The value is the step itself.
 */
export type Steps<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, SpecificSlug extends StepSlugs = StepSlugs> = Map<
    SpecificSlug,
    Step<StepSlugs, State, Metadata, SpecificSlug>
>;

/**
 * A computed step in the journey. This is orchestrated by useJourney.
 * It contains the step itself, as well as the computed values for the step (any functions not provided by the developer, all default values, etc.).
 * This is used internally by useJourney. You will not need to use this type directly.
 */
export interface ComputedStep<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, Slug extends StepSlugs = StepSlugs>
    extends Omit<Step<StepSlugs, State, Metadata, Slug>, "showPreviousButton" | "showNextButton" | "previousStep" | "nextStep"> {
    slug: Slug;
    component: Step<StepSlugs, State, Metadata, Slug>["component"];
    metadata: Metadata;
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

export type ComputedSteps<
    StepSlugs extends string,
    State extends DefaultState,
    Metadata extends DefaultMetadata,
    SpecificSlug extends StepSlugs = StepSlugs,
> = Map<SpecificSlug, ComputedStep<StepSlugs, State, Metadata, SpecificSlug>>;

export interface CurrentStep<StepSlugs extends string, State extends DefaultState, Metadata extends DefaultMetadata, Slug extends StepSlugs> {
    slug: Slug;
    component: Step<StepSlugs, State, Metadata, Slug>["component"];
    metadata: Metadata;
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
