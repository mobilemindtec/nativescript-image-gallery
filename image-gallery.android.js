var applicationModule = require("application");
var _AndroidApplication = applicationModule.android;
var dialogs = require("ui/dialogs");
var cameraModule = require("camera");
var imageModule = require("ui/image");
var imageSource = require("image-source");

var RC_GALLERY = 9001

exports.showOptions = function(onImageSelectedCallback){
    dialogs.action({
      message: "Selecione uma opção",
      cancelButtonText: "Cancelar",
      actions: ["Nova Foto", "Galeria de Fotos"]
    }).then(function (result) {
        console.log("######################## Dialog result: " + result)

        if(result == "Nova Foto")
            takePickture(onImageSelectedCallback)
        else
            openGallery(onImageSelectedCallback)
    });  
}

function takePickture(onImageSelectedCallback){
    
    cameraModule.takePicture({width: 300, height: 300, keepAspectRatio: true}).then(function(picture) {
        
        var image = new imageModule.Image();
        image.imageSource = picture;

        onImageSelectedCallback(image, null)
    });
}


exports.takePickture = takePickture

function openGallery(onImageSelectedCallback){

    var intent = new android.content.Intent(android.content.Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
    
    var previousResult = _AndroidApplication.onActivityResult;

  _AndroidApplication.onActivityResult = function (requestCode, resultCode, data) {
 
       _AndroidApplication.onActivityResult = previousResult;
        
        if (requestCode === RC_GALLERY && resultCode === android.app.Activity.RESULT_OK) {
                
            if(data != null && data.getData() != null){

                var imageCaptureUri = data.getData();
                var path = getRealPathFromURI(imageCaptureUri)



                if(path == null)
                    path = imageCaptureUri.getPath()

                console.log("##########################")
                console.log("### image path=" + path.toString())
                console.log("##########################")

                if(path != null){
                    var bitmap = android.graphics.BitmapFactory.decodeFile(path.toString())
                    var names = path.split('/')
                    var image = imageSource.fromNativeSource(bitmap);
                    console.log("############ image name =" + names[names.length-1])
                    onImageSelectedCallback(image, names[names.length-1])
                }
            }
        }
     }

    _AndroidApplication.currentContext.startActivityForResult(intent, RC_GALLERY); 
}


exports.openGallery = openGallery;

function getRealPathFromURI(contentUri) {
    var proj = [ "_data" ];
    console.log("############### contentUri=" + contentUri + ", proj=" + proj)
    var cursor = _AndroidApplication.currentContext.managedQuery(contentUri, proj, null, null, null);

    if (cursor == null) {
        return null;
    }

    var column_index = cursor.getColumnIndexOrThrow("_data");

    cursor.moveToFirst();

    return cursor.getString(column_index);
}