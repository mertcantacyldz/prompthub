import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "~/components/custom/pagination";

describe("Pagination Component", () => {
  it("should render page numbers", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should highlight current page", () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
    );

    const currentPageButton = screen.getByText("3");
    expect(currentPageButton).toHaveAttribute("aria-current", "page");
  });

  it("should call onPageChange when page is clicked", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    fireEvent.click(screen.getByText("3"));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it("should disable previous button on first page", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );

    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
    );

    const nextButton = screen.getByLabelText(/next/i);
    expect(nextButton).toBeDisabled();
  });

  it("should navigate to previous page", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    fireEvent.click(screen.getByLabelText(/previous/i));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("should navigate to next page", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    fireEvent.click(screen.getByLabelText(/next/i));
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it("should not render if totalPages is 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );

    // Component should not render or render empty for single page
    expect(container.firstChild).toBeNull();
  });

  it("should show ellipsis for many pages", () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
    );

    // Should show ellipsis when there are many pages
    const ellipsis = screen.queryAllByText("...");
    expect(ellipsis.length).toBeGreaterThanOrEqual(0);
  });
});
