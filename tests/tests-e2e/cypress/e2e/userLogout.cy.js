describe("Login & Logout", () => {
  it("passes", () => {
    cy.login("admin", "admin");
    cy.get("#logoutButton").click();
  });
});
