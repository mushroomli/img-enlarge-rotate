//判断浏览器类型
const myBrowser = () => {
  let userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
  let isOpera = userAgent.indexOf("Opera") > -1;
  if (isOpera) {
    return "Opera"
  } //判断是否Opera浏览器

  if (userAgent.indexOf("Firefox") > -1) {
    return "FF";
  } //判断是否Firefox浏览器

  if (userAgent.indexOf("Chrome") > -1) {
    return "Chrome";
  }
  if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  } //判断是否Safari浏览器

  if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
    return "IE";
  } //判断是否IE浏览器

  if (userAgent.indexOf("Trident") > -1) {
    return "Edge";
  } //判断是否Edge浏览器
}

//执行保存
const SaveAs5 = (imgURL, name) => {
  let oPop = window.open(imgURL);
  for (; oPop.document && oPop.document.readyState !== "complete";) {
    if (oPop.document.readyState === "complete") break;
  }
  oPop.document.execCommand("SaveAs", true, name);
  oPop.close();
}
export {
  myBrowser,
  SaveAs5
}