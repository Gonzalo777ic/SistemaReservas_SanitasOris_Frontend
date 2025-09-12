// src/components/common/ErrorMessage.test.js
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("should render the provided error message", () => {
    // 1. Arrange: Define the message we want to display
    const testMessage = "Something went wrong. Please try again.";

    // 2. Act: Render the component with the message as a prop
    render(<ErrorMessage message={testMessage} />);

    // 3. Assert: Check if the message is in the document
    const messageElement = screen.getByText(testMessage);
    expect(messageElement).toBeInTheDocument();
  });
});
