var application = require("application");
var dialogs = require("ui/dialogs");
var cameraModule = require("camera");
var imageModule = require("ui/image");
var imageSource = require("image-source");

var RC_GALLERY = 9001

exports.showOptions = function(onImageSelectedCallback, onErrorCallback){
    dialogs.action({
      message: "Selecione uma opção",
      cancelButtonText: "Cancelar",
      actions: ["Nova Foto", "Galeria de Fotos"]
    }).then(function (result) {

        if(result == "Nova Foto")
            takePickture(onImageSelectedCallback, onErrorCallback)
        else
            openGallery(onImageSelectedCallback, onErrorCallback)
    });  
}

function takePickture(onImageSelectedCallback, onErrorCallback){
    
    cameraModule.takePicture({width: 300, height: 300, keepAspectRatio: true}).then(function(picture) {        
        onImageSelectedCallback(picture, null)
    }).catch(function(error){
        console.log("image-gallery.js: takePickture error" + error)
        onErrorCallback(error)
    });
}


exports.takePickture = takePickture

function openGallery(onImageSelectedCallback, onErrorCallback){

    var intent = new android.content.Intent(android.content.Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);    
    
    var previesResult = application.android.onActivityResult 
    
    application.android.onActivityResult = function (requestCode, resultCode, data) {
        
        application.android.onActivityResult  = previesResult

        console.log("image-gallery.js: onActivityResult requestCode=" + requestCode + ", resultCode=" + resultCode)

        
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

                    if(!bitmap){
                        var inputStream = getInputStreamFromUri(imageCaptureUri)
                        if(inputStream)
                            bitmap = android.graphics.BitmapFactory.decodeStream(inputStream)
                    }

                    var names = path.split('/')
                    var picture = imageSource.fromNativeSource(bitmap);
                    onImageSelectedCallback(picture, names[names.length-1])
                }
            }
        }
     }

    application.android.currentContext.startActivityForResult(intent, RC_GALLERY); 
}


exports.openGallery = openGallery;

function getRealPathFromURI(contentUri) {
    var proj = [ "_data" ];
    console.log("############### contentUri=" + contentUri + ", proj=" + proj)

    
    var cursor = application.android.currentContext.managedQuery(contentUri, proj, null, null, null);
    
    if (cursor == null)
        return null;    

    var column_index = cursor.getColumnIndexOrThrow("_data");
    cursor.moveToFirst();
    return cursor.getString(column_index);
}

function getInputStreamFromUri(contentUri){
    if(android.os.Build.VERSION.SDK_INT > 19){
        var resolver = application.android.currentContext.getContentResolver()
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

    var cursor = application.android.currentContext.getContentResolver().query(uri, projection, null, null, null);

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

        filePath =  android.provider.MediaStore.Images.Media.insertImage(
            application.android.currentContext.getContentResolver(), path, name, 'App SigTurismo');
        
        console.log('### create tumbnail in gallery ' + filePath)
    }else{
        console.log('### file founded in gallery ' + filePath)
    }
    
    return filePath
}

function endsWith(text, suffix) {
    return text.indexOf(suffix, text.length - suffix.length) !== -1;
};