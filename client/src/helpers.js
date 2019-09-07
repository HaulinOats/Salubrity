const helpers = {
  getDateFromObjectId:function(objId){
    if(objId) return new Date(parseInt(objId.substring(0, 8), 16) * 1000);
  }
}

export default helpers;