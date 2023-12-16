# useJourney, a React hook for building user journeys

## The problem

Over the years, I've built several different user journeys as part of my work, and as they grow, they always become harder and harder to maintain. Logic between steps starts getting convoluted, and you need to track what step should come next and all the different variables you depend on. It becomes a mess.

I've thought a lot about this and started looking at state machines to deal with it. Libraries like XState seemed appealing but ultimately seemed too divorced from my problem to fit into it (if you disagree, I'd love to hear your opinion!).

## What do we need?

At their core, all journeys have the same need for answers. Based on your state:

- What's the next step?
- Should we even show a next button?
- Which steps are complete?
- Which parts of the journey are available to the user given the answers they've given so far?
- Is this the last step of the journey?
- And so on.

How can you build all this logic into your system in a way that is maintainable, easy to extend, and easy to reason about?

What if it was as simple as:

```tsx
export default function MyJourney() {
    const { CurrentStep } = useJourney(steps, state);
    return <CurrentStep />;
}

```

## How it works

There are two key things you give useJourney: State and Steps. State is easy; it's all the variables that define your journey's current state, including the step the user is currently on. The Steps parameter is where the magic happens; it contains all the information for each step, including any necessary logic.

With that, each step can decide on its own situation, whether it's skipped or complete, whether the user should be allowed to proceed from it, etc. Logic becomes easy to maintain, as each step has full access to the entire state object and the results of decisions by other steps (e.g., mark this step as skipped if Step X is also skipped). It also becomes easy to keep everything organized, as each step (and its component) can be kept in separate files.

The example below shows off a complete journey, including a step that gets skipped based on the user's answer to a previous question.

You define a journey as a map of steps (you can use `getStepsMap` to infer types in TypeScript, which will give you autocomplete in your IDE for all of a step's possible properties), each of which has a slug and any logic that you need to run to determine if the step is complete or skipped.

You can pass metadata to the journey, which is a container object for any data you want to pass to the step's component.

## How to use it

Each step in a journey should be in a different file, so it's straightforward to create huge complex journeys and keep them all neatly organized. In this example, we will define all the steps in the same file to keep it simple.

You can get more documentation at [pocketarc.github.io/use-journey](https://pocketarc.github.io/use-journey/).

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
        * `metadata`: The metadata of the journey.
        * `goToNextStep()`: A function that will take the user to the next step in the journey.
        * `goToPreviousStep()`: A function that will take the user to the previous step in the journey.
        * The type of the props is `ComponentProps<State, Metadata>`. You can use that in your step components (specifying your own `State` and `Metadata` types) to get proper typing.

### You can also customize the logic for each step in the journey by providing the following properties:

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
* `metadata`: The metadata of the journey.
    * This is entirely defined by you (the developer), and can be anything you want.
    * It is passed to the step's component as a prop.
* `CurrentStep`: The React component for the current step in the journey.
    * You can use this component as `<CurrentStep />`.
    * It receives the following props:
        * `state`: The state of the journey.
        * `setState`: A function that will update the state of the journey.
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

You can find further documentation at [pocketarc.github.io/use-journey](https://pocketarc.github.io/use-journey/).

## Getting started

Pretty standard, use [npm](https://www.npmjs.com/) (or yarn, or pnpm) to install use-journey.

```bash
npm install @pocketarc/use-journey
```

## Help and support

If there's anything you need, don't be afraid to ask! This package is still in an early stage of development, and I'm looking for an outside perspective from others trying to build their own journeys, so feel free to raise issues as needed. PRs are welcome, as well.

## Contributing

PRs are welcome! Please open an issue first to discuss what you'd like to change, then open a PR with your changes.

Please update tests as appropriate, and run `npm run test` to ensure everything is working as expected.

## License

This project is licensed under the terms of the [MIT license](https://github.com/pocketarc/use-journey/blob/main/LICENSE);