// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Login
Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.get("#mat-input-0").type(username);
  cy.get("#mat-input-1").type(password);
  cy.get(".mat-raised-button").click();
});

// Navigate to events page
Cypress.Commands.add("navigateToEvents", () => {
  cy.visit("/events");
});

// Create an event
Cypress.Commands.add("createEvent", (title) => {
  // Don't forget to update the elementName ref accordingly with correct month
  cy.get(".extended-fab-button").click();
  cy.get("#input0").type(title);
  cy.get(
    '#cdk-step-content-0-0 > .createEventForm > .stepper-nav-buttons > [ng-reflect-type="submit"]'
  ).click();
  cy.get("#input1").click();
  let date = new Date().getDate();
  let elementName =
    '[aria-label="October ' +
    date.toString() +
    ', 2020"] > .mat-calendar-body-cell-content'; // change month accordingly
  cy.get(elementName).click();
  cy.get("#mat-select-1 > .mat-select-trigger > .mat-select-value").click();
  cy.get("#mat-option-22 > .mat-option-text").click();
  cy.get("#mat-select-2 > .mat-select-trigger > .mat-select-value").click();
  cy.get("#mat-option-47 > .mat-option-text").click();
  cy.get(
    '#cdk-step-content-0-1 > .createEventForm > .stepper-nav-buttons > [matsteppernext=""]'
  ).click();
  cy.get("#input2").type("ssf");
  cy.get(".mat-flat-button").click();
});
