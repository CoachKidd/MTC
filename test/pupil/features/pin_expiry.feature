@pin_expiry
Feature:
  Pin expiry after check has started

  Scenario: Pin is not expired when pupil is on the practice complete page
    Given I am on the warm up complete page using a real pupil
    Then I should still have a valid pin
    When I start the check
    And I should see the check start time is recorded

  @local_storage
  Scenario: Pin is expired when pupil has started the check
    Given I have completed the check with a real user using the numpad
    Then I should have an expired pin
    Then I should see a check started event in the audit log

  @wip
  Scenario: Check start failure event is recorded in to the audit log
    Given I have lost my local storage
    When I completed the check anyway
    Then I should see a check start failure event recorded in the audit log
