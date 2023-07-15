import React from "react";
import type { Metadata, State } from "../simple-journey";
import type { ComponentProps } from "../../src";

export default function StepIsNew({ metadata, state, setState, goToNextStep }: ComponentProps<State, Metadata>) {
    const setIsNew = (isNew: boolean) => {
        setState({ ...state, isNew });
        goToNextStep();
    };

    return (
        <>
            <h1>{metadata?.example} Are you a first-timer?</h1>
            <button onClick={() => setIsNew(true)} type="button">
                Yes
            </button>
            <button onClick={() => setIsNew(false)} type="button">
                No
            </button>
        </>
    );
}
