Cypress.Commands.add("login", () => {
  cy.env(["TEST_EMAIL", "TEST_NAME"]).then((vars) => {
    const { TEST_EMAIL: email, TEST_NAME: name } = vars as Record<
      string,
      string
    >;

    cy.session(
      email,
      () => {
        cy.task<string>("generateAuthToken", { email, name }).then((token) => {
          cy.visit("/", { failOnStatusCode: false });
          cy.setCookie("__Secure-authjs.session-token", token, {
            secure: true,
            httpOnly: true,
            sameSite: "lax",
          });
          cy.visit("/chat");
          cy.url().should("include", "/chat");
        });
      },
      {
        cacheAcrossSpecs: true,
        validate() {
          cy.getCookie("__Secure-authjs.session-token").should("exist");
        },
      },
    );
  });
});
