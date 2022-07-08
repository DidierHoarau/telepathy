describe("Task Functions", () => {
  beforeEach(() => {
    cy.checkInit();
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login();
  });

  it("Should list Tasks", () => {
    cy.get("#navigationTaskList").click();
  });

  it("Should add a Task", () => {
    cy.get("#navigationTaskList").click();
    cy.get("#addTaskButton").click();
    cy.get("#taskName").type("create/test_0000_c");
    cy.get("#taskScript").type("ls");
    cy.get("#taskSchedule").type("0 0 * * *");
    cy.get("#taskTag").select("Any");
    cy.get("#saveTaskButton").click();
  });

  it("Should add a Task (cypress command)", () => {
    const task = {
      name: "create/test_0001_c",
      command: "ls",
      schedule: "0 0 * * *",
      tag: "Any",
    };
    cy.addTask(task);
  });

  // it("Should delete a Task", () => {
  //   const task = {
  //     name: `delete/test_0000_del_${new Date().getSeconds()}`,
  //     command: "ls",
  //     schedule: "0 0 * * *",
  //     tag: "Any",
  //   };
  //   cy.addTask(task);
  //   cy.get("#navigationTaskList").click();
  //   cy.get("h2").contains(task.name).parents(".taskCard").get("#editButton").click();
  //   cy.get("#deleteButton").click({ force: true });
  // });

  // it("Should delete a Task (cypress command)", () => {
  //   const task = {
  //     name: `test_0000_del_${new Date().getSeconds()}`,
  //     command: "ls",
  //     schedule: "0 0 * * *",
  //     tag: "Any",
  //   };
  //   cy.addTask(task);
  //   cy.deleteTask(task);
  // });
});
