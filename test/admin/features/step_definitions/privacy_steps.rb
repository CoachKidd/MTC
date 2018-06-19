Then(/^I should be able to go the privacy page from the footer$/) do
  sign_in_page.privacy.click
  expect(privacy_page).to be_displayed
end

Given(/^I am on the privacy page$/) do
  privacy_page.load
end

Then(/^I should be see all the privacy information$/) do
  expect(privacy_page).to be_all_there
end