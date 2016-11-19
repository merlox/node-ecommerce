let Mongo = require('mongodb').MongoClient,
  fs = require('fs'),
  path = require('path'),
  MongoUrl = 'mongodb://localhost:27017/ecommerce';

let buscarProducto = function(permalink, callback){
  Mongo.connect(MongoUrl, (err, db) => {
    if(err){
      db.close();
      return res.send('Error, could not connect to the database', null);
    }
    db.collection('productos').findOne({
      'permalink': permalink
    }, (err, result) => {
      db.close();
      if(err){
        return callback('Error, could not find that product', null);
      }else{
        return callback(null, result);
      }
    });
  });
};
//Función para conseguir todos los productos y copiar la primera imagen de cada uno al public uploads
let getAllProducts = function(callback){
  Mongo.connect(MongoUrl, (err, db) => {
    if(err){
      db.close();
      return callback('Err, could not connect to the db: '+err, null);
    }
    db.collection('productos').find({}).toArray((err, results) => {
      db.close();
      if(err){
        return callback('Err, error searching products: '+err, null);
      }
      if(results != undefined && results.length > 0){
        //Acceder a la carpeta título y copiar la 1º imagen
        for(let i = 0; i<results.length; i++){
          let folderServer = path.join(__dirname, '/uploads/', results[i].titulo);
          let folderClient = path.join(__dirname, '../public/public-uploads/');
          fs.readdir(folderServer, (err, imagesInFolder) => {
            if(err) return callback(err, null);
            let firstImageInFolder = path.join(folderServer, imagesInFolder[0]);
            copyFile(firstImageInFolder, folderClient, imagesInFolder[0], (err) => {
              console.log('Imagen copiadas a public-uploads ', firstImageInFolder);
              if(err){
                return callback(err, null);
              }else{
                return callback(null, 'Copied image to public uploads');
              }
            });
          });
        }
      }else{
        return callback('Err, no products found', null);
      }
    });
  });
};
let render = function(page, dataObject, cb){
  fs.readFile(page, (err, content) => {
    if(err) throw err;
    let resultado = content.toString();
    resultado = resultado.replace(/\t*/gm, '');
    for(let propiedad in dataObject){
      let re = new RegExp("{{"+propiedad+"}}+", "gm");
      //Loop de una key
      let reItem = new RegExp("{{loop "+propiedad+" [^-]+}}" ,"gm");
      //Empieza el loop por el key indicado
      let reTotalItem = new RegExp("{{loop "+propiedad+" -.*-}}" ,"gm");
      let reTotal = new RegExp("{{loop "+propiedad+"}}" ,"gm");
      let reLoopKey = new RegExp("{{loopKey "+propiedad+"}}", "gm");

      if(re.test(resultado)){
        resultado = resultado.replace(re, dataObject[propiedad]);
      }

      if(reItem.test(resultado)){
        let loopObject = dataObject[propiedad];
        for(let key in loopObject){
          let reItemFind = new RegExp("{{loop "+propiedad+" [^-]?"+key+"[^-]?}}" ,"gm");
          resultado = resultado.replace(reItemFind, loopObject[key]);  
        }
      }

      if(reLoopKey.test(resultado)){
        let loopObject = dataObject[propiedad];
        let reKeyWithTagsBig = new RegExp("^(.*){{loopKey "+propiedad+"}}(.*)([\\s\\S]*){{\\/loopKey "+propiedad+"}}.*$", "gm");
        let reArrayWithTags = new RegExp("^([\\s\\S]*)\n(.*){{loopArray "+propiedad+"}}(.*)([\\s\\S]*)$", "gm");
        let matchKeyBig;
        let matchArray; 
        let textoFinal = "";
        matchKeyBig = reKeyWithTagsBig.exec(resultado);
        matchArray = reArrayWithTags.exec(matchKeyBig[3]);
        for(let key in loopObject){
          
          textoFinal += matchKeyBig[1]+key+matchKeyBig[2]+'\n';
          //Lo que hay antes del <option> es matcharray[1]
          textoFinal += matchArray[1];
          for(let i = 0; i<loopObject[key].length; i++){
            let itemArray = matchArray[2]+loopObject[key][i]+matchArray[3]+"\n";
            textoFinal += itemArray;
          }
          //Lo que hay despues del <option> es matcharray[4]
          textoFinal += matchArray[4];
        }
        resultado = resultado.replace(reKeyWithTagsBig, textoFinal);
        textoFinal = "";
      }

      if(reTotalItem.test(resultado)){
        let loopObject = dataObject[propiedad];
        let reTotalWithTags = new RegExp("^(.*){{loop "+propiedad+" -(.*)-}}(.*)$" ,"gm");
        let match = reTotalWithTags.exec(resultado);
        let textoFinal = "";
        let doneWaiting = false;
        for(let key in loopObject){
          //en match[2] se encuentra la key por la que empezar 
          if(key == match[2] || doneWaiting){
            doneWaiting = true;
            if(match != null && loopObject[key] != undefined) textoFinal += match[1]+loopObject[key]+match[3]+"\n";
          }
        }
        resultado = resultado.replace(reTotalWithTags, textoFinal);
        textoFinal = "";
      }

      if(reTotal.test(resultado)){
        let loopObject = dataObject[propiedad];
        reTotal = new RegExp("^(.*){{loop "+propiedad+"}}(.*)$" ,"gm");
        let match = reTotal.exec(resultado);
        let textoFinal = "";
        for(let key in loopObject){
          if(match != null && loopObject[key] != undefined) textoFinal += match[1]+loopObject[key]+match[2]+"\n";
        }
        resultado = resultado.replace(reTotal, textoFinal);
        textoFinal = "";
      } 
    }
    return cb(null, resultado);
  });
};
let copyFile = function(origin, end, fileName, callback){
  let callbackCalled = false;
  let readStream = fs.createReadStream(origin);
  readStream.on('error', (err) => {
    done(err);
  });
  let finalName = path.join(end, fileName);
  let writeStream = fs.createWriteStream(finalName);
  writeStream.on('error', (err) => {
    done(err);
  });
  writeStream.on('close', (ex) => {
    done();
  });
  readStream.pipe(writeStream);

  function done(err){
    if(!callbackCalled){
      callback(err);
      callbackCalled = true;
    }
  }
};
let guardarCategorias = function(categorias, callback){
  Mongo.connect(MongoUrl, (err, db) => {
    if(err){
      db.close();
      return res.send('Error, could not connect to the database', null);
    }
    //1º Buscamos el array
    //2º Lo actualizamos, categorias es un param de la funcion
    //3º Si no existe, crear uno nuevo
    //4º Callback
    db.collection('categorias').update({
      'arrayCategorias': {$exists : true}
    }, {
      'arrayCategorias': categorias
    }, {
      upsert: true
    }, (err, countFilesModified, result) => {
      db.close();
      if(err){
        return callback('Error, could not update categories', null);
      }else{
        return callback(null, 'Categories saved correctly');
      }
    });
  });
};
let getCategories = function(callback){
  Mongo.connect(MongoUrl, (err, db) => {
    if(err){
      db.close();
      return callback('Err, could not connect to the db.', null);
    }
    db.collection('categorias').findOne({
      'arrayCategorias': {$exists : true}
    }, (err, result) => {
      console.log(result);
      if(err){
        return callback('Err, could not find the categories.', null);
      }else{
        return callback(null, result);
      }
    });
  });
}
let copyDirectory = function(origin, end, callback){
  if(callback == undefined){
    callback = () => {};
  }
  let callbackCalled = false;
  fs.stat(origin, (err, stats) => {
    if(err) done(err);
    if(stats.isDirectory()){
      //Check if end exists and create directory
      fs.stat(end, (err, stats) => {
        if(err){
          fs.mkdir(end, (err) => {
            if(err){
              console.log(err);
            }
          });
        }
      });
      //Copy the files from origin to end
      fs.readdir(origin, (err, files) => {
        console.log('1'+files);
        if(err){
          done(err);
        }else if(files.length > 0){
          files.forEach((file) => {
            copyFile(path.join(origin, file), end, file, (err) => {
              if(err){
                done(err);
              }else{
                done(null);
              }
            });
          });
        }else{
          done('Error copying images, there are no files to be copied');
        }
      });
    }else{
      done('Error copying images, your origin is not a directory');
    }
  });

  function done(err){
    if(!callbackCalled){
      callback(err);
      callbackCalled = true;
    }
  }
};

exports.buscarProducto = buscarProducto;
exports.render = render;
exports.copyFile = copyFile;
exports.copyDirectory = copyDirectory;
exports.guardarCategorias = guardarCategorias;
exports.getCategories = getCategories;
exports.getAllProducts = getAllProducts;