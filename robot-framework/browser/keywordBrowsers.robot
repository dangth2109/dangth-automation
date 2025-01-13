*** Settings ***
Library     SeleniumLibrary    run_on_failure=None

# *** Variables ***
# ${path_chrome}    
# ${profile}    
# ${options}         add_argument("--start-maximized")
# ...               ;add_argument("profile-directory=${profile}")
# ...               ;add_argument("user-data-dir=${path_chrome}")
# ...               ;add_argument("--auto-open-devtools-for-tabs")
# ...               ;add_argument("--load-extension=${path_extension}")


*** Keywords ***
Open Browser With Profile
    [Arguments]    ${url}    ${path_chrome}    ${profile}
    Open Browser    ${url}    chrome    options=add_argument("profile-directory=${profile}");add_argument("user-data-dir=${path_chrome}")



*** Test Cases ***
open
    # Open Browser With Profile    google.com    C://Users//thd21//AppData//Local//Google//Chrome//User Data    Default
    # Sleep    10
    Open Browser    google.com    chrome    options=add_argument("profile-directory=Default");add_argument("user-data-dir=C://Users//thd21//AppData//Local//Google//Chrome//User Data")