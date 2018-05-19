var application = require("application");
var dialogs = require("ui/dialogs");
var cameraModule = require("camera");
var imageModule = require("ui/image");
var imageSource = require("image-source");

var errorHandler
var successHandler

/*
  params = {
    mediaTypes: ["video", "image"],
    camera: {width: 300, height: 300, keepAspectRatio: true},
    error: function
    success: function
  }
*/

function onParams(params) {
  successHandler = params.success || function(data) { console.log("success callback not set")  }
  errorHandler = params.error || function(data) { console.log("error callback not set")  }
  params.mediaTypes = params.mediaTypes || ["video", "image"]
  params.camera = params.camera || {width: 300, height: 300, keepAspectRatio: true}
}

exports.showOptions = function(params){

    onParams(params)

    dialogs.action({
      message: "Selecione uma opção",
      cancelButtonText: "Cancelar",
      actions: ["Nova Foto", "Galeria de Fotos"]
    }).then(function (result) {

        if(result == "Nova Foto")
            takePhoto(params)
        else
            openGallery(params)
    });
}

function takePhoto(params){

    onParams(params)

    cameraModule.takePicture(params.camera).then(function(picture) {

      successHandler({
        result: picture,
        name: null,
        url: null
      })

    }).catch(function(error){
        console.log("image-gallery.js takePhoto error: " + error)
        errorHandler(error)
    });
}

exports.takePhoto = takePhoto

var ImagePickerControllerDelegate = (function(_super){

   __extends(ImagePickerControllerDelegate, _super)

  function ImagePickerControllerDelegate() {
    _super.applay(this, arguments)
  }

  ImagePickerControllerDelegate.prototype.imagePickerControllerDidCancel = function(picker){    
    picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
  }

  ImagePickerControllerDelegate.prototype.imagePickerControllerDidFinishPickingMediaWithInfo = function(picker, info){

    console.log(info)

    var midiaType = info.objectForKey("UIImagePickerControllerMediaType")
    var name

    var image = info.objectForKey("UIImagePickerControllerOriginalImage")
    var asset = info.objectForKey("UIImagePickerControllerReferenceURL")
    var path = info.objectForKey("UIImagePickerControllerMediaURL")

    if(asset)
      asset = asset + ""

    if(path)
      path = path + ""

    if(asset && asset.indexOf("assets-library://") > -1){
      var splited = asset.split("?")
      var names = splited[1].split("&")

      name = names[0].split("=")[1] + "." + names[1].split("=")[1]
    }

    if(image){
      image = imageSource.fromNativeSource(image)
    }

    //"assets-library://asset/asset.JPG?id=2EFB75E5-3820-488D-83D7-EE86C88EAFCB&ext=JPG"

    successHandler({
      result: image,
      name: name,
      url: path || asset,
      type: midiaType == "public.movie" ? "video" : "image"
    })

    picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);

  }

  ImagePickerControllerDelegate.ObjCProtocols = [UIImagePickerControllerDelegate, UINavigationControllerDelegate];

  return ImagePickerControllerDelegate

})(NSObject)

function openGallery(params){

  onParams(params)

  if(UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceTypePhotoLibrary)) {

    var mediaTypes = []

    if(params.mediaTypes.indexOf("image") > -1)
      mediaTypes.push("public.image")

    if(params.mediaTypes.indexOf("video") > -1)
      mediaTypes.push("public.movie")

    if(mediaTypes.length == 0){
      mediaTypes.push("public.image")
      mediaTypes.push("public.movie")
    }

    try {
      var picker = UIImagePickerController.new()
      var obj = ImagePickerControllerDelegate.new()
      picker.delegate = obj

      picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary


      picker.mediaTypes = mediaTypes

      application.ios.rootController.presentViewControllerAnimatedCompletion(picker, true, null)

    } catch (e) {
      errorHandler(e + "")
    }
  }else{
    errorHandler("not source type available")
  }
}

exports.openGallery = openGallery;

/*

  args = {
    assetUrl
    error
    success
  }

*/
exports.fromAsset = function(args){
  //var url = "assets-library://asset/asset.JPG?id=2EFB75E5-3820-488D-83D7-EE86C88EAFCB&ext=JPG"

  var assetLibrary = ALAssetsLibrary.new()

  var url = NSURL.URLWithString(args.assetUrl)

  assetLibrary.assetForURLResultBlockFailureBlock(url, function(asset) {

    var rep = asset.defaultRepresentation()
    var iref = rep.fullResolutionImage()
    if (iref) {
      var img = UIImage.imageWithCGImage(iref)
      args.success(img)
    }else {
      args.error("error on get asset: full resolution image return null")
    }

  }, function(error){
     args.error("error on get asset: " + error.localizedDescription())
  })
}
