This is a React Native application built to track devices connected to your phone's Wi-Fi hotspot. It uses a custom native module (written in Java) to read the ARP table and list connected devices. The app provides a simple interface to check hotspot status and view connected device details.

Technologies Used
React Native (TypeScript)

Java (Native Android Module)

Metro Bundler

Android Gradle Build System



Features
Automatically retrieves a list of devices connected to your phone’s hotspot using Android’s ARP table

Displays IP address, MAC address, and device name

Detects if the hotspot is turned off and prompts the user to manually enable it (due to Android OS restrictions)

Clean and minimal UI to refresh and view connected devices

How to Use
Before starting, ensure your React Native development environment is properly set up.

Step 1: Install dependencies and start Metro
bash
Copy
Edit
npm install
npm start
Step 2: Run the app on Android
bash
Copy
Edit
npm run android
App Usage Instructions
Launch the app on your Android device.

If your hotspot is already enabled, the app will automatically detect and display connected devices.

If the hotspot is off, a dialog will appear asking you to turn it on manually.

Once the hotspot is enabled, press the "Refresh" button to scan for devices.

If the data still doesn't appear, restarting the app may help refresh the device list correctly.

Notes
This app works only on Android. iOS does not expose the ARP table, so connected device tracking is not possible on that platform.

Required Android permissions:

android.permission.ACCESS_WIFI_STATE

android.permission.INTERNET

android.permission.ACCESS_NETWORK_STATE

Important Notice
If data does not load correctly after pressing "Refresh", try closing and reopening the app. This usually resolves issues with the ARP table not updating in real-time.

Developer note: Kotlin was initially used as a reference point while building the native module. Since Kotlin is relevant to the development practices at some companies, I’ve started learning it in parallel to strengthen my Android development skills.

Building an APK
To generate a signed release APK:

bash
Copy
Edit
cd android
./gradlew assembleRelease
The APK file will be generated at:



