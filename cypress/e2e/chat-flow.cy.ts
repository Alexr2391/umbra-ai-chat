//Test if the user can login with google OAUTH then creates a new conversation with the agent
before(() => {
  cy.env(["TEST_EMAIL", "TEST_NAME"]).then((vars) => {
    const { TEST_EMAIL: email, TEST_NAME: name } = vars as Record<
      string,
      string
    >;
    cy.task("seedTestUser", { email, name });
  });
});

describe("Flow 1 — send message, get assistant response, check side nav", () => {
  const TEST_MESSAGE = "Reply with exactly one word: hello";

  beforeEach(() => {
    cy.login();
    cy.visit("/chat");
  });

  it("redirects to a conversation URL after sending the first message", () => {
    cy.get("textarea").type(TEST_MESSAGE);
    cy.get('button[aria-label="Send message"]').click();

    cy.url({ timeout: 10000 }).should("match", /\/chat\/[0-9a-f-]{36}$/);
  });

  it("shows an assistant reply once the stream finishes", () => {
    cy.get("textarea").type(TEST_MESSAGE);
    cy.get('button[aria-label="Send message"]').click();

    cy.get('[class*="assistant"]', { timeout: 30000 })
      .should("exist")
      .invoke("text")
      .should("have.length.greaterThan", 0);
  });

  it("shows the new conversation in the side nav under Recent", () => {
    cy.get("textarea").type(TEST_MESSAGE);
    cy.get('button[aria-label="Send message"]').click();

    const expectedTitle = TEST_MESSAGE.slice(0, 60);
    cy.contains("a", expectedTitle, { timeout: 15000 }).should("be.visible");
  });
});
