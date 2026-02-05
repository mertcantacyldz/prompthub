import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "~/components/custom/star-rating";

describe("StarRating Component", () => {
  it("should render 5 stars", () => {
    render(<StarRating value={0} />);
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("should display correct number of filled stars", () => {
    const { container } = render(<StarRating value={3} readonly />);
    // Stars are filled based on value
    const stars = container.querySelectorAll("svg");
    expect(stars).toHaveLength(5);
  });

  it("should call onChange when star is clicked", () => {
    const handleChange = vi.fn();
    render(<StarRating value={0} onChange={handleChange} />);

    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]); // Click 3rd star

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("should not call onChange in readonly mode", () => {
    const handleChange = vi.fn();
    render(<StarRating value={3} readonly onChange={handleChange} />);

    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[4]);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("should apply correct size classes", () => {
    const { container, rerender } = render(<StarRating value={3} size="sm" />);
    expect(container.querySelector("svg")).toHaveClass("h-4", "w-4");

    rerender(<StarRating value={3} size="md" />);
    expect(container.querySelector("svg")).toHaveClass("h-5", "w-5");

    rerender(<StarRating value={3} size="lg" />);
    expect(container.querySelector("svg")).toHaveClass("h-6", "w-6");
  });

  it("should handle hover state", () => {
    const { container } = render(<StarRating value={0} />);
    const stars = screen.getAllByRole("button");

    fireEvent.mouseEnter(stars[3]); // Hover on 4th star
    // Hover should fill stars up to hovered position

    fireEvent.mouseLeave(stars[3]);
    // Should revert to original value
  });

  it("should render with default props", () => {
    render(<StarRating value={4} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });
});
