module.exports.createTaskId = (taskSeries, lastTaskId) => {
    let _lastTaskId = lastTaskId + 1
    let mainId = taskSeries + '-' +  _lastTaskId 
    return mainId;
};