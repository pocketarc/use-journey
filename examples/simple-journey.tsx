import { getStepsMap } from "../src";
import { useState } from "react";
import React from "react";
import { useJourney } from "../src";
import StepStart from "./steps/StepStart";
import StepIsNew from "./steps/StepIsNew";
import StepFullName from "./steps/StepFullName";
import StepFinish from "./steps/StepFinish";

export interface State {
    currentStep: string;
    isNew: boolean | undefined;
    fullName: string | undefined;
}

export interface Metadata {
    example: string;
}

const steps = getStepsMap([
    {
        slug: "start",
        component: StepStart,
    },
    {
        slug: "is-new",
        component: StepIsNew,
        isComplete: (state: State) => {
            return state.isNew !== undefined;
        },
    },
    {
        slug: "full-name",
        component: StepFullName,
        isComplete: (state: State) => {
            return state.fullName !== "";
        },
        isSkipped: (state: State) => {
            return state.isNew !== true;
        },
    },
    {
        slug: "finish",
        component: StepFinish,
    },
]);

export default function SimpleJourney() {
    const [state, setState] = useState<State>({
        currentStep: "start",
        isNew: undefined,
        fullName: undefined,
    });

    const metadata = {
        example: "hello, metadata!",
    };

    const { CurrentStep, showPreviousButton, showNextButton, goToNextStep, goToPreviousStep, slug } = useJourney(steps, state, setState, metadata);

    return (
        <>
            <h1>You are on {slug}</h1>
            <CurrentStep />
            {showPreviousButton && (
                <button onClick={goToPreviousStep} disabled={!showPreviousButton}>
                    Previous
                </button>
            )}
            {showNextButton && (
                <button onClick={goToNextStep} disabled={!showNextButton}>
                    Next
                </button>
            )}
        </>
    );
}
