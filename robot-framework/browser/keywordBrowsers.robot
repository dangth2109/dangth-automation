*** Settings ***
Library     SeleniumLibrary


*** Keywords ***
Open Browser With Profile
    [Arguments]    ${url}    ${path_chrome}    ${profile}
    Open Browser    ${url}    chrome    options=add_argument("user-data-dir=${path_chrome}")
    ...    options=add_argument("profile-directory=${profile}")
    ...    options=add_argument("--start-maximized")
    # ...    options=add_argument("--auto-open-devtools-for-tabs")
    # ...    options=add_argument("--load-extension=${path_extension}")
