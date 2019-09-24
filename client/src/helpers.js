import axios from 'axios';

const helpers = {
  getDateFromObjectId:function(objId){
    if(objId) return new Date(parseInt(objId.substring(0, 8), 16) * 1000);
  },
  getAllUsers:function(){
    return new Promise((resolve, reject)=>{
      axios.get('/get-all-users').then((resp)=>{
        let usersObj = {};
        for(let i = 0; i < resp.data.length; i++){
          let user = resp.data[i];
          usersObj[resp.data[i].userId] = user;
        }
        resolve({
          usersById:usersObj,
          usersArr:resp.data
        });
      }).catch(err=>{
        reject(err);
      })
    })
  },
  getActiveCalls:function(){
    return new Promise((resolve, reject)=>{
      axios.get('/get-active-calls').then((resp)=>{
        if(resp.data.error || resp.data._message){
          reject(resp.data);
        } else {
          resolve(resp.data);
        }
      }).catch((err)=>{
        reject(err);
      })
    });
  },
  getCompletedCalls:function(){
    return new Promise((resolve, reject)=>{
      axios.get('/get-completed-calls').then((resp)=>{
        if(resp.data.error || resp.data._message){
          reject(resp.data);
        } else {
          resolve(resp.data);
        }
      }).catch(err=>{
        reject(err);
      })
    })
  },
  getProcedureData:function(){
    return new Promise((resolve, reject)=>{
      axios.get('/get-procedures').then((resp)=>{
        if(resp.data.error || resp.data._message){
          reject(resp.data);
        } else {
          resolve(resp.data);
        }
      }).catch((err)=>{
        reject(err);
      })
    })
  },
  getOptionsData:function(){
    return new Promise((resolve, reject)=>{
      axios.get('/get-options').then((resp)=>{
        if(resp.data.error || resp.data._message){
          reject(resp.data);
        } else {
          let hospitals = resp.data[0];
          let hospitalsById = {};
          resp.data[0].options.forEach(hospital=>{
            hospitalsById[hospital.id] = hospital;
          });
          let orderChanges = resp.data[3];
          let orderChangeById = {};
          resp.data[3].options.forEach(order=>{
            orderChangeById[order.id] = order;
          });
          let statuses = {};
          resp.data[6].options.forEach(status=>{
            statuses[status.id] = status;
          })
          resolve({
            options:resp.data,
            hospitals,
            hospitalsById,
            orderChanges,
            orderChangeById,
            statuses
          })
        }
      }).catch((err)=>{
        reject(err);
      })
    })
  },
  getItemsData:function(){
    return new Promise((resolve, reject)=>{
      axios.get('/get-items').then((resp)=>{
        if(resp.data.error || resp.data._message){
          reject(resp.data)
        } else {
          let items = {};
          resp.data.forEach(item=>{
            items[item.itemId] = item;
          })
          resolve(items);
        }
      }).catch((err)=>{
        reject(err)
      })
    })
  },
  getCallById:function(callId){
    return new Promise((resolve, reject)=>{
      axios.post('/get-call-by-id', {_id:callId}).then(resp=>{
        if(resp.data.error || resp.data._message){
          reject(resp.data);
        } else {
          resolve(resp.data);
        }
      }).catch((err)=>{
        reject(err)
      })
    })
  }
}

export default helpers;