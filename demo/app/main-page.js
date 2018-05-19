var Observable = require("data/observable").Observable;
var dialogs = require("ui/dialogs");
var GalleryHandler = require("nativescript-image-gallery")
var application = require("application")
var imageSource = require("image-source")
var viewModel

exports.loaded = function(args) {
    var page = args.object;

    viewModel = page.bindingContext = new Observable({
      message: '',
      img: undefined
    });

}


exports.onGallery = function(){
  GalleryHandler.openGallery({
    success: function (data) {
      console.log("image name " + JSON.stringify(data))
      if(data.type == "video"){
        showAlert("video selected")
      }else{
        viewModel.set('img', data.result)
      }
    },
    error: function(error){
      showAlert("error on tack a photo: " + error)
    }
  })
}

exports.onPhoto = function(){

  GalleryHandler.takePhoto({
    success: function (data) {
      console.log("image name " + JSON.stringify(data))
      viewModel.set('img', data.result)
    },
    error: function(error){
      showAlert("error on tack a photo: " + error)
    }
  })
}

function showAlert(message) {
  var options = {
    title: "Background Tasks",
    message: message,
    okButtonText: "OK"
  }

  dialogs.alert(options)
}
