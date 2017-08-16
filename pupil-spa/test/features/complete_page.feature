@wip
#  wip because we would have to wait for 20 questions to complete before asserting the complete page
#  once we can answer the questions we can speed up the time taken to get to the complete page. Then these tests will be
#  reinstated

Feature: Complete page

  Scenario: Completion page has a heading
    Given I am on the complete page
    Then I should see a complete page heading

  Scenario: Complete page has text
    Given I am on the complete page
    Then I should see some text stating i have completed the check

  Scenario: Complete page allows users to restart the check
    Given I am on the complete page
    Then I should be able to sign out

  Scenario: Choosing to restart the check takes you back to the start page
    Given I am on the complete page
    When I choose to sign out
    Then I should be taken back to the sign in page