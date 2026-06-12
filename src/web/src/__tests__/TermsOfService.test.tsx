import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TermsOfService from "../components/TermsOfService";

describe("TermsOfService", () => {
  it("renders the Terms of Service heading", () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /terms of service/i }),
    ).toBeInTheDocument();
  });

  it("renders the Back to Browse link", () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /back to browse/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders all required sections", () => {
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /site usage terms/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /disclaimer of warranties/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /limitation of liability/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /governing law/i }),
    ).toBeInTheDocument();
  });
});
