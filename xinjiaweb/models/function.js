//时间戳转日期
exports.formatDateTime = function(inputTime, type){
	inputTime = parseInt(inputTime);
	var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;    
    m = m < 10 ? ('0' + m) : m;    
    var d = date.getDate();    
    d = d < 10 ? ('0' + d) : d;    
    var h = date.getHours();  
    h = h < 10 ? ('0' + h) : h;  
    var minute = date.getMinutes();  
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    if(type == 1){
    	return y + '-' + m + '-' + d+' '+h+':'+minute;    
    }else if(type == 2){
    	return y + '-' + m + '-' + d;
    }else{
    	return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;    
    }
};