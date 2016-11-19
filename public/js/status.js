//Gets the url params and detects if it has some message or not
function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
         var pair = vars[i].split("=");
         if(pair[0] == variable){return pair[1];}
  }
  return(false);
}
//Function to show a status message any time
function messageStatus(status, type){
  if(status != null){
    document.getElementById('status').style.display = 'flex';
    document.getElementById('status').style.marginTop = "-50px";
    let marginTop = -50;
    let interval = setInterval(() => {
      marginTop += 2;
      document.getElementById('status').style.marginTop = marginTop+"px";
      if(marginTop >= 0){
        clearInterval(interval);
      }
    }, 10);
    if(type == "success"){
      document.getElementById('status').className = 'successStatus';
    }else if(type == "error"){
      document.getElementById('status').className = 'errorStatus';
    }else if(type == "info"){
      document.getElementById('status').className = 'infoStatus';
    }
    document.getElementById('status').innerHTML = status;
    setTimeout(function(){
      document.getElementById('status').style.display = 'none';
    }, 5000);
  }
}
let registerStatus = getQueryVariable("status");
let statusMessage;
if(getQueryVariable("message")){
  statusMessage = getQueryVariable("message").replace(/%20/g, " ");
}

if(registerStatus != false){
  if(registerStatus.toUpperCase() == 'ERROR'){
    document.getElementById('status').className = 'errorStatus';
  }else{
    document.getElementById('status').className = 'successStatus';
  }
  setTimeout(function(){
    document.getElementById('status').style.display = 'none';
  }, 5000);
  document.getElementById('status').innerHTML = registerStatus;
  document.getElementById('status').insertAdjacentHTML('beforeend', ": "+statusMessage);
}
