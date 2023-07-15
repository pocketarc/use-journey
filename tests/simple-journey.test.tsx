import { expect, test } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react";
import SimpleJourney from "../examples/simple-journey";
import React from "react";

test("renders the simple journey as a first-timer", async () => {
    const { queryByText, getByText } = render(<SimpleJourney />);

    expect(queryByText(/start/i)).toBeTruthy();
    fireEvent.click(getByText(/next/i));
    expect(queryByText(/metadata/i)).toBeTruthy();
    expect(queryByText(/first-timer/i)).toBeTruthy();
    fireEvent.click(getByText(/yes/i));
    expect(queryByText(/Imagine if there was an input/i)).toBeTruthy();
    fireEvent.click(getByText(/next/i));
    expect(queryByText(/finish/i)).toBeTruthy();
    fireEvent.click(getByText(/previous/i));
    expect(queryByText(/Imagine if there was an input/i)).toBeTruthy();
});

test("renders the simple journey as not a first-timer", async () => {
    const { queryByText, getByText } = render(<SimpleJourney />);

    expect(queryByText(/start/i)).toBeTruthy();
    fireEvent.click(getByText(/next/i));
    expect(queryByText(/first-timer/i)).toBeTruthy();
    fireEvent.click(getByText(/no/i));
    expect(queryByText(/finish/i)).toBeTruthy();
    fireEvent.click(getByText(/previous/i));
    expect(queryByText(/first-timer/i)).toBeTruthy();
});
