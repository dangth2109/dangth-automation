*** Settings ***
Library     AppiumLibrary


*** Variables ***
${REMOTE_URL_DEVICE}    http://127.0.0.1:4723/wd/hub
${PLATFORM_NAME}        Android
${APP_PACKAGE}          com.android.settings
${APP_ACTIVITY}         com.android.settings.Settings
${UUID_DEVICE}          emulator-5554


*** Keywords ***
Open Mobile Application
    Open Application
    ...    ${REMOTE_URL_DEVICE}
    ...    platformName=${PLATFORM_NAME}
    ...    udid=${UUID_DEVICE}
    ...    appPackage=${APP_PACKAGE}
    ...    appActivity=${APP_ACTIVITY}
