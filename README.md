# nativescript-image-gallery

## IOS

* add at info.plist

```
  <key>NSCameraUsageDescription</key>
	<string>Used to photo take</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>Used to select photo</string>
	<key>NSAppleMusicUsageDescription</key>
	<string>Used to select midia</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>Used to make a video</string>
```

## Adroid

* Enable permissions CAMERA and READ_OWNER_DATA.. use nativescript-permissions plugin

## Usage
```

var GalleryHandler = require("nativescript-image-gallery")
  
  // show a question to open camera or gallery
  GalleryHandler.showOptions({
    camera: {width: 300, height: 300, keepAspectRatio: true},  
    success: function (data) {
      // data { result: picture, name: 'filename.png', url: "path or assets" }
    },
    error: function(error){
      // handler error
    }
  })

  GalleryHandler.openGallery({
    camera: {width: 300, height: 300, keepAspectRatio: true},  
    success: function (data) {
      // data { result: picture, name: 'filename.png', url: "path or assets" }
    },
    error: function(error){
      // handler error
    }
  })
  
  GalleryHandler.takePhoto({
    mediaTypes: ["video", "image"],   
    success: function (data) {
      // data { result: picture, name: 'filename.png', url: "path or assets" }
    },
    error: function(error){
      // handler error
    }
  })

```
