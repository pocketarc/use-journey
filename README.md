# useJourney, a React hook for building user journeys

## Why?

Over the years, I’ve built several different user journeys as part of my work, and as they grow they always end up becoming harder and harder to maintain. Logic starts getting convoluted between different steps, you lose track of what step should come next, all the different variables you’re depending on, and it becomes a bit of a mess.

I’ve thought about this a fair bit and started looking at state machines to deal with it. XState seemed the most appealing, but ultimately seemed a bit too divorced from my problem to really fit into it (if you disagree, I’d love to hear your opinion!).

## What do we need?

At their core, all journeys have more or less the same need for answers. Based on your state:

- What’s the next step?
- Should we even show a next button?
- Which steps are complete?
- Which parts of the journey are available to the user given the answers they’ve given so far?
- Is this the last step of the journey?
- And so on.

How can you build all this logic into your system in a way that is maintainable, easy to extend, and easy to reason about?

## How it works

There are two key things you give useJourney: State, and Steps. State is easy; it’s all the variables that define your journey’s current state, including the step the user is currently on. The Steps parameter is where the magic happens; it contains all the information for each step, including any of the step’s necessary logic.

The example below shows off a complete journey, including a step that is skipped based on the user’s answer to a previous question.

The journey is defined as a map of steps (getStepsMap is used to infer types correctly in TypeScript), each of which has a slug, metadata, and any logic that needs to be run to determine if the step is complete or skipped.

The metadata is just a container for any data you want to pass to the step’s component, and all logic is just functions that take the state and use it to make decisions.

## How to use it

Each of the steps below -could- be in a different file, so it would be very easy for you to create huge complex journeys and keep them all neatly organised.

You can get more documentation in [docs/index.html](https://github.com/pocketarc/use-journey/blob/main/docs/index.html).

```tsx

// First, define the steps.
const steps = getStepsMap([
    {
        slug: "start",
        component: StepStart
    },
    {
        slug: "is-new",
        component: StepIsNew,
        isComplete: (state: State) => {
            return state.isNew !== undefined;
        }
    },
    {
        slug: "full-name",
        component: StepFullName,
        isComplete: (state: State) => {
            return state.fullName !== "";
        },
        isSkipped: (state: State) => {
            return state.isNew !== true;
        }
    },
    {
        slug: "finish",
        component: StepFinish
    }
]);

// Then, use the journey.
export default function SimpleJourney() {
    const [state, setState] = useState<State>({
        currentStep: "start",
        isNew: undefined,
        fullName: undefined
    });
    const { CurrentStep, showPreviousButton, showNextButton, goToNextStep, goToPreviousStep, slug } = useJourney(steps, state, setState);

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
```

## Documentation

### To define a step in your journey, you need to provide:

* `slug`: A string that uniquely identifies the step in the journey.
* `component`: A React component that will be rendered when the user is on this step in the journey.
    * It receives the following props:
        * `state`: The state of the journey.
        * `setState`: A function that will update the state of the journey.
        * `metadata`: The metadata of the current step in the journey.
        * `goToNextStep()`: A function that will take the user to the next step in the journey.
        * `goToPreviousStep()`: A function that will take the user to the previous step in the journey.
        * The type of the props is `ComponentProps<State, Metadata>`. You can use that in your step components (specifying your own `State` and `Metadata` types) to get proper typing.

### You can also customise the logic for each step in the journey by providing:

* `metadata` (optional): The metadata of the step in the journey.
    * This is entirely defined by you (the developer), and can be anything you want.
    * It is passed to the step's component as a prop.
* `isComplete` (optional): A function that determines whether the step is complete.
* `isEnabled` (optional): A function that determines whether the step is enabled.
* `isSubmittable` (optional): A function that determines whether the step is submittable.
* `isSkipped` (optional): A function that determines whether the step is skipped.
* `isJourneyEnd` (optional): A function that determines whether the step is the end of the journey.
* `showPreviousButton` (optional): A function that determines whether to show the 'previous' button in the journey.
* `showNextButton` (optional): A function that determines whether to show the 'next' button in the journey.
* `showSubmitButton` (optional): A function that determines whether to show the 'submit' button in the journey.
* `enableNextButton` (optional): A function that determines whether to enable the 'next' button in the journey.
* `previousStep` (optional): A function that determines the previous step in the journey.
* `nextStep` (optional): A function that determines the next step in the journey.

### `useJourney()` exposes the following properties:

* `slug`: The slug of the current step in the journey.
* `metadata`: The metadata of the current step in the journey.
    * This is entirely defined by you (the developer), and can be anything you want.
    * It is passed to the step's component as a prop.
* `CurrentStep`: The component for the current step in the journey.
    * This is a React component, so you can just render it as `<CurrentStep />`.
    * It receives the following props:
        * `state`: The state of the journey.
        * `setState`: A function that will update the state of the journey.
        * `metadata`: The metadata of the current step in the journey.
        * `goToNextStep()`: A function that will take the user to the next step in the journey.
        * `goToPreviousStep()`: A function that will take the user to the previous step in the journey.
* `goToNextStep()`: A function that will take the user to the next step in the journey.
* `goToPreviousStep()`: A function that will take the user to the previous step in the journey.
* `hasNextStep`: A boolean that indicates whether there is a next step in the journey.
    * default: `true` if the step is not the last step in the journey, taking into account skipped steps
* `hasPreviousStep`: A boolean that indicates whether there is a previous step in the journey.
    * default: `true` if the step is not the first step in the journey, taking into account skipped steps
* `previousStep`: The slug of the previous step in the journey, taking into account skipped steps.
* `nextStep`: The slug of the next step in the journey, taking into account skipped steps.
* `isComplete`: A boolean that indicates whether the current step is complete (useful for deciding whether the user should be allowed to proceed in the journey).
* `showPreviousButton`: A boolean that indicates whether the previous button should be shown.
    * default: `true` if the step is not the first step in the journey, taking into account skipped steps
* `showNextButton`: A boolean that indicates whether the next button should be shown.
    * default: `true` if the step is not the last step in the journey, taking into account skipped steps
* `isJourneyEnd`: A boolean that indicates whether the current step is the last step in the journey.
    * default: `true` if the step is the last step in the journey, taking into account skipped steps
* `showSubmitButton`: A boolean that indicates whether the submit button should be shown.
    * default: `true` if the step is the last step in the journey, taking into account skipped steps
* `enableNextButton`: A function that enables the next button.
    * default: `true` if the current step is complete
* `isEnabled`: A boolean that indicates whether the current step is enabled.
    * default: `true`
* `isSubmittable`: A boolean that indicates whether the current step is submittable.
    * default: `true`
* `isSkipped`: A boolean that indicates whether the current step is skipped.
    * default: `false`

You can find further documentation in [docs/index.html](https://github.com/pocketarc/use-journey/blob/main/docs/index.html).

If there's anything missing, or anything is unclear, please open an issue and I'll get it fixed! I'm also happy to accept PRs for documentation.

## Getting started / Installation

Pretty standard, use [npm](https://www.npmjs.com/) (or yarn, or pnpm) to install use-journey.

```bash
npm install @pocketarc/use-journey
```

## Contributing

PRs are welcome! Please open an issue first to discuss what you'd like to change, and then open a PR with your changes.

Please make sure to update tests as appropriate, and run `npm run test` to make sure everything is working as expected.

## License

This project is licensed under the terms of the [MIT license](https://github.com/pocketarc/use-journey/blob/main/LICENSE);