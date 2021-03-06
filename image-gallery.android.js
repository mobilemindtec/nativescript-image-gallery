var application = require("@nativescript/core/application");
var dialogs = require("@nativescript/core/ui/dialogs");
var cameraModule = require("@nativescript/camera");
var imageSource = require("@nativescript/core/image-source")

var RC_GALLERY = 9001

var errorHandler
var successHandler

function onParams(params) {
  successHandler = params.success || function(data) { console.log("success callback not set")  }
  errorHandler = params.error || function(data) { console.log("error callback not set")  }
  params.mediaTypes = params.mediaTypes || ["video", "image"]
  params.camera = params.camera || {width: 300, height: 300, keepAspectRatio: true}
}

/*
  params = {
    mediaTypes: ["video", "image"],
    camera: {width: 300, height: 300, keepAspectRatio: true},
    error: function
    success: function
  }
*/

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

    cameraModule.takePicture(params.camera).then(function(imageAsset) {

      console.log("image-gallery.js takePhoto: imageAsset=" + imageAsset)

      var splited = imageAsset.android.split("/")
      successHandler({
        imgSrc: imageSource.ImageSource.fromFileSync(imageAsset.android),
        path: imageAsset.android,
        name: splited[splited.length-1]        
      })

    }).catch(function(error){
        console.log("image-gallery.js takePhoto error: " + error)
        errorHandler(error)
    });
}


exports.takePhoto = takePhoto

function openGallery(params){

    onParams(params)

    var ac = application.android.foregroundActivity || application.android.startActivity;
    var intent = new android.content.Intent(android.content.Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
    //pickIntent.setType("image/* video/*");

    var mediaTypes = ""

    if(params.mediaTypes.indexOf("image") > -1)
      mediaTypes = "image/*"

    if(params.mediaTypes.indexOf("video"))
      mediaTypes = " video/*"

    if(mediaTypes.length == 0){
      mediaTypes = "image/* video/*"
    }

    intent.setType(mediaTypes)

    application.android.on("activityResult", function(eventData) {


        if (eventData.requestCode === RC_GALLERY && eventData.resultCode === android.app.Activity.RESULT_OK) {

            var data = eventData.intent
            if(data != null && data.getData() != null){

                var imageCaptureUri = data.getData();

                var bitmap = android.provider.MediaStore.Images.Media.getBitmap(ac.getContentResolver(), imageCaptureUri);

                //console.log("--------")
                //console.log(bitmap)
                var picture = new imageSource.ImageSource(bitmap);
                //console.log(picture)

                var path = imageCaptureUri.getPath()

                //console.log(path)

                var name

                if(path.toLowerCase().indexOf(".png") > -1 || path.toLowerCase().indexOf(".jpg") > -1 || path.toLowerCase().indexOf(".jpeg") > -1){
                    var split = path.split("/")
                    name = split[split.length-1]
                }

                successHandler({
                  imgSrc: picture,
                  name: name,
                  url:  path
                })

                
                /*
                var path = getRealPathFromURI(imageCaptureUri)

                if (imageCaptureUri.toString().indexOf("images") > -1) {
                    //handle image
                } else  if (imageCaptureUri.toString().indexOf("video")) {
                    //handle video
                }

                console.log("real path = " + path)

                if(path == null)
                    path = imageCaptureUri.getPath()

                console.log("##########################")
                console.log("### image path=" + path.toString())
                console.log("##########################")

                var names = path.split('/')

                
                if (imageCaptureUri.toString().indexOf("images") > -1) {
                    var bitmap = android.graphics.BitmapFactory.decodeFile(path.toString())

                    if(!bitmap){
                        var inputStream = getInputStreamFromUri(imageCaptureUri)
                        if(inputStream)
                            bitmap = android.graphics.BitmapFactory.decodeStream(inputStream)
                    }

                    var picture = new imageSource.ImageSource(bitmap);

                    successHandler({
                      imgSrc: picture,
                      name: names[names.length-1],
                      url:  path
                    })
                }else{
                  successHandler({
                    imgSrc: imageSource.ImageSource.fromFileSync(path),
                    name: names[names.length-1],
                    path:  path
                  })
                }*/

            }
        }

    })


 
    ac.startActivityForResult(intent, RC_GALLERY);
}


exports.openGallery = openGallery;

function getRealPathFromURI(contentUri) {

    var cursor

    try{

        var proj = [ android.provider.MediaStore.Images.Media.DATA ];
        console.log("############### contentUri=" + contentUri + ", proj=" + proj)

        var ac = application.android.foregroundActivity || application.android.startActivity;

        cursor = ac.getContentResolver().query(contentUri, proj, null, null, null);

        if (cursor == null)
            return null;

        var column_index = cursor.getColumnIndexOrThrow(android.provider.MediaStore.Images.Media.DATA);
        cursor.moveToFirst();
        var path = cursor.getString(column_index);

        if(path == null && contentUri.getPath().indexOf(":") > -1){

            var documentId = contentUri.getPath().split(":")[1]

            cursor = ac.getContentResolver().query(
                android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI, 
                null, 
                android.provider.MediaStore.Images.Media._ID + " = ? ", 
                [documentId], null)
            cursor.moveToFirst();
            path = cursor.getString(cursor.getColumnIndex(android.provider.MediaStore.Images.Media.DATA));            
        }

        return path

    }finally{
        if(cursor != null)
            cursor.close()
    }
}

function getInputStreamFromUri(contentUri){
    if(android.os.Build.VERSION.SDK_INT > 19){
        var ac = application.android.foregroundActivity || application.android.startActivity;
        var resolver = ac.getContentResolver()
        var parcelFileDescriptor = resolver.openFileDescriptor(contentUri, "r");
        var inputStream = new java.io.FileInputStream(parcelFileDescriptor.getFileDescriptor());
        return inputStream
    }
}

function list(filterByImageNameEquals) {

    var BUCKET_DISPLAY_NAME = "bucket_display_name"
    var DATA = "_data"
    var BUCKET_ID = "bucket_id"
    var DESCRIPTION  = "description"
    var DISPLAY_NAME  = "_display_name"
    var TITLE  = "title"
    var MIME_TYPE = "mime_type"
    var WIDTH = "width"
    var HEIGHT = "height"
    var listOfAllImages = []


    var uri = android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI

    var projection = [
        DATA,
        BUCKET_DISPLAY_NAME,
        DESCRIPTION,
        BUCKET_ID,
        DISPLAY_NAME,
        TITLE,
        MIME_TYPE,
        WIDTH,
        HEIGHT
    ]

    var ac = application.android.foregroundActivity || application.android.startActivity;
    var cursor = ac.getContentResolver().query(uri, projection, null, null, null);

    var column_index_data = cursor.getColumnIndex(DATA);
    //var column_index_folder_name = cursor.getColumnIndex(BUCKET_DISPLAY_NAME);
    var column_index_title = cursor.getColumnIndex(TITLE);
    var column_index_display_name = cursor.getColumnIndex(DISPLAY_NAME);


    while (cursor.moveToNext()) {
        var absolutePathOfImage = cursor.getString(column_index_data)
        var displayName = cursor.getString(column_index_display_name)
        var title = cursor.getString(column_index_title)

        //console.log("## DISPLAY_NAME="+displayName)
        //console.log("## TITLE="+title)


        if(!filterByImageNameEquals){
            listOfAllImages.add(absolutePathOfImage);
        }else{
            if(displayName.toLowerCase() == filterByImageNameEquals.toLowerCase() || title.toLowerCase() == filterByImageNameEquals.toLowerCase())
                return absolutePathOfImage
        }
    }

    if(filterByImageNameEquals)
        return undefined

    return listOfAllImages;
}

exports.list = list

exports.getImageFromMediaStore = function(path, name){

    var filePath = list(name)

    if(!filePath){

        var ac = application.android.foregroundActivity || application.android.startActivity;
        filePath =  android.provider.MediaStore.Images.Media.insertImage(
            ac.getContentResolver(), path, name, 'NativeScript Gallery');

        console.log('### create tumbnail in gallery ' + filePath)
    }else{
        console.log('### file founded in gallery ' + filePath)
    }

    return filePath
}

function endsWith(text, suffix) {
    return text.indexOf(suffix, text.length - suffix.length) !== -1;
};
