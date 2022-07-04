describe("Login", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/users/login");
    cy.get("#username").type("admin");
    cy.get("#password").type("admin");
    cy.get("#loginButton").click();
  });
});
