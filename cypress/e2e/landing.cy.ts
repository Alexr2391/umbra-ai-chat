//Test unauthorized flow
describe("Landing page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays app title and sign-in prompt", () => {
    cy.contains("h1", "Umbra").should("be.visible");
    cy.contains("Sign in to continue").should("be.visible");
  });

  it("has a visible Google sign-in button", () => {
    cy.contains("button", "Continue with Google").should("be.visible");
  });

  it("sign-in button is inside a form", () => {
    cy.contains("button", "Continue with Google")
      .closest("form")
      .should("exist");
  });
});

describe("Protected route — /chat", () => {
  it("redirects unauthenticated users away from /chat", () => {
    cy.visit("/chat", { failOnStatusCode: false });
    cy.url().should("not.include", "/chat");
  });
});
