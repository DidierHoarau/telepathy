describe("Login", () => {
  beforeEach(() => {
    cy.checkInit();
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("Should login", () => {
    cy.visit(`${Cypress.env("WEB_URL")}/users/login`);
    cy.get("#username").type(Cypress.env("ADMIN_USERNAME"));
    cy.get("#password").type(Cypress.env("ADMIN_PASSWORD"));
    cy.get("#loginButton").click();
  });

  it("Should login (with cypress commannd)", () => {
    cy.login();
  });
});
