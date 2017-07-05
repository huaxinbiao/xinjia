//阻止IE7以下访问
//var $ = layui.jquery;
var layer = layui.layer;
var form = layui.form();
var util = layui.util;
var device = layui.device();
var element = layui.element();
var flow = layui.flow; //流加载
var laypage = layui.laypage;//分页
var laytpl = layui.laytpl;
if (device.ie && device.ie < 9) {
    layer.alert('最低支持ie9，您当前使用的是古老的 IE' + device.ie + ',为了更好的浏览体验请升级您的浏览器。');
}
