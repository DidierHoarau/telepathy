describe("List Tasks", () => {
  it("passes", () => {
    cy.login("admin", "admin");
    cy.get("#navigationTaskList").click();
  });
});
