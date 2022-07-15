module.exports.convertDays = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    return d
    }