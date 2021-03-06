@generate_pupil_pins @reset_all_pins @reset_checks
Feature: Generate Pupil PINs

  @reset_all_pins
  Scenario: Generate Pins Landing page displays heading and info section
    Given I have signed in with teacher2
    When I navigate to generate pupil pins page
    Then I should see a heading for the Generate Pupil Pins
    And I can see the info message for generating the pupil pin

  Scenario Outline: Generate Pins Pupil List Page displays lists of Pupils
    Given I have signed in with <teacher>
    And I navigate to generate pupil pins page
    When I click Generate PINs button
    Then I should see a list of pupils sorted by surname in 'ascending' order on Generate Pins List Page

  Examples:
  | teacher  |
  | teacher1 |
  | teacher2 |
  | teacher3 |
  | teacher4 |

  Scenario: Generate Pins Pupil List page do not display pupil with active pin
    Given I am logged in
    And I have a pupil with active pin
    And I am on the generate pupil pins page
    When I click Generate PINs button
    Then I cannot see this pupil in the list of Pupil on Generate Pin list page

  Scenario: Generate Pins Pupil List Page do not display pupil not taking check
    Given I have a pupil not taking the check
    And I am on the generate pupil pins page
    When I click Generate PINs button
    Then I cannot see this pupil in the list of Pupil on Generate Pin list page

  Scenario: Sorting Pupil list on Generate Pins page
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I click on the Pupil heading
    Then I should see a list of pupils sorted by surname in 'descending' order on Generate Pins List Page

  Scenario: Pupils can be selected by a checkbox on Generate Pin page
    Given I am logged in
    And I am on Generate pins Pupil List page
    Then I should be able to select them via a checkbox on Generate Pin page

  Scenario: Teachers can select all pupils on Generate Pin page
    Given I am logged in
    And I am on Generate pins Pupil List page
    Then I should have a option to select all pupils on Generate Pin page

  Scenario: Sticky banner is not displayed on on Generate Pin page if no pupil are selected
    Given I am logged in
    And I am on Generate pins Pupil List page
    Then I should not see a sticky banner

  Scenario: Sticky banner is displayed on on Generate Pin page when a pupil is selected
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I select a Pupil from Generate Pin page
    Then I should see a sticky banner

  Scenario: Sticky banner is not displayed if I deselect all pupil
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I deselect all pupils from Generate Pin Page
    Then I should not see a sticky banner

  Scenario: Sticky banner displays pupil count on Generate Pin page
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I select multiple pupils from Generate Pin Page
    Then the sticky banner should display the pupil count

  Scenario: Sticky banner displays total pupil count for Generate Pins when all pupil is selected
    Given I am logged in
    And I am on Generate pins Pupil List page
    When I select all pupils for Generate pin
    Then the sticky banner should display the total pupil count on Generate Pin Page

  @reset_all_pins
  Scenario: Cancel returns user to Generate Pupil Pin Landing page if there are no pupil with pins
    Given I am logged in
    And I am on Generate pins Pupil List page
    And I select a Pupil from Generate Pin page
    When I choose to cancel
    Then I should be taken to Generate Pupil Pins Page

  @wip @remove-this-when-22408-isReady
  Scenario: Cancel returns user to Generated Pin page if there are pupils with activepins
    Given I have generated a pin for a pupil
    And I select a Pupil to Generate more pins
    When I choose to cancel
    Then I should be taken to Generated Pins Page

  @wip @remove-this-when-22408-isReady
  Scenario: Check Form is assigned when Pin is generated and the Pin consist of 4 characters
    Given I have generated a pin for a pupil
    Then the pin should consist of 4 characters
    And the pin should be stored against the pupil
    And check form should be assigned to the pupil

  @reset_all_pins @bug_18993 @wip @remove-this-when-22408-isReady
  Scenario: Pupil pins must be generated from the specified pool of characters
    Given I have generated pin for all pupil
    Then all pupil pins should be generated from the specified pool of characters

  @reset_all_pins @wip @remove-this-when-22408-isReady
  Scenario: Multiple pins can be generated simultaneously
    Given I have generated pins for multiple pupils
    Then each pin should be displayed next to the pupil its assigned to

  @wip
  Scenario: Pupil pin is unique across all of the school's pupil records at the time it is generated
    Given I have generated a pin for a pupil
    Then the pupil pin should be unique

  @wip @remove-this-when-22408-isReady
  Scenario: Generated Pin Page is displayed as per the design
    Given I have generated a pin for a pupil
    Then I should see generated pin page as per design
    And the displayed school password is generated as per the requirement
    
  Scenario: Pin is expired when pupil is not taking the check
    Given I have generated a pin for a pupil
    When I decide the pupil should not be taking the check
    Then the status of the pupil should be Not taking the Check
    And the pin should be expired

  @reset_all_pins @remove_all_groups @pupil_not_taking_check @wip @remove-this-when-22408-isReady
  Scenario: Pupils can be filtered by group
    Given I have a group of pupils
    When I choose to filter via group on the generate pins page
    Then I should only see pupils from the group
    And I should be able to see a count of pupils
    And I should be able to generate pins for all pupils in this group

  @reset_all_pins @remove_all_groups @pupil_not_taking_check @wip @remove-this-when-22408-isReady
  Scenario: Pupils not taking the check should not be in filtered group list
    Given I have a pupil not taking the check
    And that pupil is apart of a group
    When I choose to filter via group on the generate pins page
    Then I should only see pupils available for taking the check
    And I should be able to generate pins for all pupils in this group

  @reset_all_pins @remove_all_groups @wip @remove-this-when-22408-isReady
  Scenario: Group is no longer present in the filter when all pupils in the group have had a pin generated
    Given I have generated pins for all pupils in a group
    Then I can no longer use this group to filter on the generate pins page

  @reset_all_pins @remove_all_groups @pupil_not_taking_check @wip
  Scenario: Groups reappear when their are available pupils for pin generation
    Given I have generated pins for all pupils in a group
    When a pupil becomes available for pin generation again
    Then I should be able to filter by groups on the generate pins page

  @no_active_check_window
  Scenario: Generate Pin Overview page display error if there is no active check window
    Given I have signed in with teacher2
    When I navigate to generate pupil pins page
    Then I should see an error message to contact helpdesk

  @wip @remove-this-when-22408-isReady
  Scenario: Generate pins page has related content
    Given I have signed in with teacher2
    When I navigate to generate pupil pins page
    Then I should see related content on the generate pins page