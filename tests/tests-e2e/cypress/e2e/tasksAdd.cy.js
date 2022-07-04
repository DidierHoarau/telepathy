describe("Add 1 Task", () => {
  it("passes", () => {
    cy.login("admin", "admin");
    cy.get("#navigationTaskList").click();
    cy.get("#addTaskButton").click();
    cy.get("#taskName").type("a task");
    cy.get("#taskScript").type("ls");
  });
});
