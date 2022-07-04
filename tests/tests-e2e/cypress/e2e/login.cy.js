describe("Login", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/users/login");
    cy.get("#username").type("admin");
    cy.get("#password").type("admin");
    cy.get("#loginButton").click();
  });
});

describe("Login & Logout", () => {
  it("passes", () => {
    cy.login("admin", "admin");
    cy.get("#logoutButton").click();
  });
});
