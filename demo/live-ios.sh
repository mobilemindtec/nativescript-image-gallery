#!/bin/bash

xcproj --project "platforms/ios/demo.xcodeproj" touch
xcproj --project "platforms/ios/Pods/Pods.xcodeproj" touch


tns livesync ios --watch --log trace
