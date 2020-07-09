/**
 * 图片放大镜参数列表
 * 必需：minImg-缩略图
 * 可选：maxImg-大图，默认和缩略图是同一张
 * 可选：scale:放大倍数，默认是4
 * 可选：width：组件宽，默认600
 * 可选：height：组件高，默认400
 * 可选：mouseBlockSize：放大小块大小，默认100
 * 可选：hideACW：隐藏逆时针功能
 * 可选：hideCW：隐藏顺时针功能
 * 可选：hideDownload：隐藏图片下载功能
 * 可选：index放置在轮播或者多图时
 */
import React, {Component} from "react";
import {render} from "react-dom";
import './assets/iconfont/iconfont.css';
import cssStyle from './index.module.scss';
import demoImg from './assets/image/demo.jpg';
import {myBrowser, SaveAs5} from './assets/funcs/index';

export default class ImgEnlargeAndRotate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      magnifierOff: false,// 是否显示放大图片容器
      // 图片加载情况
      imgLoad: false,
      mouseBlockStyle: {},//移动小方块的样式（主要是位置）
      enlargeStyle: {},//放大图片的样式（主要是放大的位置和旋转）

      minImgStyle: {},//原图片的样式（主要是放大的位置）

      maskBlockStyle: {},//遮罩的样式（为了实现小滑块在图片上移动的效果）
      rotateNum: 0,//旋转次数
    };
  }

  // 鼠标移入
  mouseEnter = () => {
    const {index = ''} = this.props;
    let imgPosition = document.getElementById(`minImg${index}`).getBoundingClientRect();
    this.setState({
      magnifierOff: true,
      maskBlockStyle: {width: imgPosition.width, height: imgPosition.height},//改变遮罩的大小保持和图片一致
    });
  };

  // 鼠标移除
  mouseLeave = () => {
    this.setState({
      magnifierOff: false
    });
  };

  // 鼠标移动
  mouseMove = event => {
    let e = event.nativeEvent;
    this.calculationBlock(e.offsetX, e.offsetY);
  };

  // 计算相关参数
  calculationBlock = (offsetX, offsetY) => {
    const {scale = 4, width = 600, height = 400, mouseBlockSize = 100, index = ''} = this.props;
    let {enlargeStyle, rotateNum} = this.state;

    let newEnlargeStyle = JSON.parse(JSON.stringify(enlargeStyle));
    let newMouseBlockStyle = {};

    //放置原始图片的容器
    let imgDivPosition = document.getElementById(`minImgDiv${index}`).getBoundingClientRect();
    //原始图片位置和宽高
    let imgPosition = document.getElementById(`minImg${index}`).getBoundingClientRect();
    //放大图片的位置和宽和高
    let maxImgPosition = document.getElementById(`maxImg${index}`).getBoundingClientRect();

    //图片的左边原点
    let oLeft = imgPosition.left - imgDivPosition.left;
    let oTop = imgPosition.top - imgDivPosition.top;
    //图片的宽和高
    const imgWidth = imgPosition.width;
    const imgHeight = imgPosition.height;
    //图片的宽和高
    const maxImgWidth = maxImgPosition.width;
    const maxImgHeight = maxImgPosition.height;

    /* 小方块位置 小滑块宽高是mouseBlockSize，这里-mouseBlockSize/2*/
    //方块一半的大小
    const halfBlockSize = mouseBlockSize / 2;

    // 防止鼠标移动过快导致计算失误，只要小于或者大于对应值，直接设置偏移量等于最小值或者最大值
    if (offsetX < halfBlockSize) {
      offsetX = halfBlockSize;
    }
    if (offsetX > imgWidth - halfBlockSize) {
      offsetX = imgWidth - halfBlockSize;
    }
    if (offsetY < halfBlockSize) {
      offsetY = halfBlockSize;
    }
    if (offsetY > imgHeight - halfBlockSize) {
      offsetY = imgHeight - halfBlockSize;
    }

    //滑块位置
    newMouseBlockStyle.left = parseFloat(oLeft + offsetX - halfBlockSize) + "px";
    newMouseBlockStyle.top = parseFloat(oTop + offsetY - halfBlockSize) + "px";

    /* 计算图片放大位置 */
    if (Math.abs(rotateNum) % 4 === 0) {
      newEnlargeStyle.left = parseFloat(-(offsetX - halfBlockSize) * scale) + "px";
      newEnlargeStyle.top = parseFloat(-(offsetY - halfBlockSize) * scale) + "px";

    } else if (Math.abs(rotateNum) % 4 === 1) {

      newEnlargeStyle.left = rotateNum < 0 ?
        parseFloat(-(offsetX - halfBlockSize) * scale) + "px" :
        parseFloat(maxImgWidth - (offsetX - halfBlockSize) * scale) + "px";

      newEnlargeStyle.top = rotateNum < 0 ?
        parseFloat((height - offsetY + halfBlockSize) * scale) + "px" :
        parseFloat(-(offsetY - halfBlockSize) * scale) + "px";

    } else if (Math.abs(rotateNum) % 4 === 2) {

      newEnlargeStyle.left = parseFloat((width - (offsetX - halfBlockSize)) * scale) + "px";
      newEnlargeStyle.top = parseFloat(maxImgHeight - (offsetY - halfBlockSize) * scale) + "px";

    } else if (Math.abs(rotateNum) % 4 === 3) {

      newEnlargeStyle.left = rotateNum < 0 ?
        parseFloat(maxImgWidth - (offsetX - halfBlockSize) * scale) + "px" :
        parseFloat(-(offsetX - halfBlockSize) * scale) + "px";

      newEnlargeStyle.top = rotateNum < 0 ?
        parseFloat(-(offsetY - halfBlockSize) * scale) + "px" :
        parseFloat((height - (offsetY - halfBlockSize)) * scale) + "px";
    }


    //初始化时没有放大倍数，在此添加
    if (!newEnlargeStyle.transform) {
      newEnlargeStyle.transform = `scale(${scale})`
    }

    this.setState({
      mouseBlockStyle: newMouseBlockStyle,//滑块样式
      enlargeStyle: newEnlargeStyle,//放大的图片位置
    });
  }

  //旋转图片
  rotateImg = (type) => {
    const {width = 600, height = 400, scale = 4, index = ''} = this.props;

    let newMinImgStyle = {};
    let {rotateNum, enlargeStyle, maskBlockStyle} = this.state;
    //旋转圈数
    const rounds = type === 'antiClock' ? rotateNum - 1 : rotateNum + 1;

    //放大图片的样式
    let newEnlargeStyle = JSON.parse(JSON.stringify(enlargeStyle));
    //蒙版样式
    let newMaskBlockStyle = JSON.parse(JSON.stringify(maskBlockStyle));


    //改变旋转后的（原图和放大的图宽高）适应原容器

    newMinImgStyle.maxWidth = newEnlargeStyle.maxWidth = Math.abs(rounds) % 2 === 0 ? width : height;
    newMinImgStyle.maxHeight = newEnlargeStyle.maxHeight = Math.abs(rounds) % 2 === 0 ? height : width;

    //旋转原图
    newMinImgStyle.transform = `rotate(${90 * (rounds % 4)}deg)`;
    //旋转放大的图
    newEnlargeStyle.transform = `rotate(${90 * (rounds % 4)}deg) scale(${scale})`;


    this.setState({
      minImgStyle: newMinImgStyle,//原图样式
      enlargeStyle: newEnlargeStyle,//放大的图片样式
      rotateNum: rounds
    }, () => {
      //原始图片旋转后的位置和宽高
      let imgPosition = document.getElementById(`minImg${index}`).getBoundingClientRect();
      newMaskBlockStyle.width = imgPosition.width;
      newMaskBlockStyle.height = imgPosition.height;
      //旋转且平移回去
      const halfHeight = imgPosition.height / 2;
      const halfWidth = imgPosition.width / 2;

      if (Math.abs(rounds) % 4 === 1) {
        newMinImgStyle.transform = rounds < 0 ?
          `rotate(${90 * (rounds % 4)}deg) translate(${halfWidth}px, -${halfHeight}px)` :
          `rotate(${90 * (rounds % 4)}deg) translate(-${halfWidth}px, ${halfHeight}px)`;

        newMaskBlockStyle.transform = `translate(-${halfWidth}px, -${halfHeight}px)`;

      } else if (Math.abs(rounds) % 4 === 2) {
        newMinImgStyle.transform = `rotate(${90 * (rounds % 4)}deg) translate(${halfWidth}px, ${halfHeight}px)`;
        newMaskBlockStyle.transform = '';

      } else if (Math.abs(rounds) % 4 === 3) {
        newMinImgStyle.transform = rounds < 0 ?
          `rotate(${90 * (rounds % 4)}deg) translate(-${halfWidth}px, ${halfHeight}px)` :
          `rotate(${90 * (rounds % 4)}deg) translate(${halfWidth}px, -${halfHeight}px)`;
        newMaskBlockStyle.transform = rounds < 0 ? `translate(-${halfWidth}px, ${-halfHeight}px)` : '';

      } else if (Math.abs(rounds) % 4 === 0) {
        newMinImgStyle.transform = `rotate(${90 * (rounds % 4)}deg) translate(-${halfWidth}px, -${halfHeight}px)`;
        newMaskBlockStyle.transform = rounds < 0 ? `translate(-${halfWidth}px, ${-halfHeight}px)` : '';

      }

      this.setState({
        minImgStyle: newMinImgStyle,
        maskBlockStyle: newMaskBlockStyle
      })
    })
  }


  saveImg = (url, name) => {
    let browser = myBrowser();
    let odownLoad = document.getElementById('oDownload');
    if (browser === "IE" || browser === "Edge") {
      //IE
      odownLoad.href = "#";
      let oImg = document.createElement("img");
      oImg.src = url;
      oImg.id = "downImg";
      let odown = document.getElementById("down");
      odown.appendChild(oImg);
      SaveAs5(document.getElementById('downImg').src, name)
    } else {
      //!IE
      odownLoad.href = url;
      odownLoad.download = "";
    }
  }


  // 图片加载情况
  handleImageLoaded(e) {
    this.setState({imgLoad: true});
  }

  // 图片加载中
  handleImageErrored() {
    this.setState({imgLoad: false});
  }

  render() {
    const {magnifierOff, imgLoad, mouseBlockStyle, enlargeStyle, minImgStyle, maskBlockStyle} = this.state;

    const {
      width = 600, height = 400, background = '#eee', mouseBlockSize = 100, scale = 4,
      minImg = demoImg, maxImg = minImg, imgName = '图片',
      hideACW, hideCW, hideDownload, index = '', toolPosition = 'top'
    } = this.props;

    return (
      <div style={{display: "inline-block"}}>
        {/*工具：旋转，下载*/}
        {
          toolPosition === 'top' ? <div className={cssStyle.toolDiv} style={{width}}>
            <span className={cssStyle.noticeText}>鼠标移入图片区域可局部放大</span>
            {
              hideACW ? null :
                <i className={`iconfont im-nishizhen ${cssStyle.toolBtn}`}
                   title='逆时针旋转90度'
                   onClick={() => this.rotateImg('antiClock')}/>
            }
            {
              hideCW ? null :
                <i className={`iconfont im-shunshizhen ${cssStyle.toolBtn}`}
                   title='顺时针旋转90度'
                   onClick={() => this.rotateImg()}/>
            }
            {
              hideDownload ? null : <a id='oDownload'>
                <i className={`iconfont im-xiazai ${cssStyle.toolBtn}`}
                   title='下载图片到本地'
                   onClick={() => this.saveImg(maxImg, imgName)}/>
              </a>
            }


          </div> : null
        }


        <div className={cssStyle.enlargeImg}>

          {/*原始图片容器*/}
          <div id={`minImgDiv${index}`} className={cssStyle.imgContainer} style={{width, height, background}}>
            <img id={`minImg${index}`} className={cssStyle.imgStyle} src={minImg} alt=""
                 style={{maxWidth: width, maxHeight: height, ...minImgStyle}}
            />
            <div className={cssStyle.maskBlock}
                 style={{width, height, ...maskBlockStyle}}
                 onMouseEnter={this.mouseEnter}
                 onMouseLeave={this.mouseLeave}
                 onMouseMove={this.mouseMove}/>
            {/*移动小方块*/}
            {magnifierOff && <div className={cssStyle.mouseBlock}
                                  style={{...mouseBlockStyle, width: mouseBlockSize, height: mouseBlockSize}}/>}
          </div>


          {/*大图容器*/}
          {magnifierOff && (
            <div className={cssStyle.magnifierContainer}
                 style={{left: width, width: mouseBlockSize * scale, height: mouseBlockSize * scale}}>
              <img
                id={`maxImg${index}`}
                className={cssStyle.largerImg}
                style={{maxWidth: width, maxHeight: height, ...enlargeStyle}}
                src={maxImg}
                onLoad={this.handleImageLoaded.bind(this)}
                onError={this.handleImageErrored.bind(this)}
                alt=""
              />
              {!imgLoad && "failed to load"}
            </div>
          )}
        </div>


        {/*工具：旋转，下载*/}
        {
          toolPosition === 'bottom' ? <div className={cssStyle.toolDiv} style={{width}}>
            <span className={cssStyle.noticeText}>鼠标移入图片区域可局部放大</span>
            {
              hideACW ? null :
                <i className={`iconfont im-nishizhen ${cssStyle.toolBtn}`}
                   title='逆时针旋转90度'
                   onClick={() => this.rotateImg('antiClock')}/>
            }
            {
              hideCW ? null :
                <i className={`iconfont im-shunshizhen ${cssStyle.toolBtn}`}
                   title='顺时针旋转90度'
                   onClick={() => this.rotateImg()}/>
            }
            {
              hideDownload ? null : <a id='oDownload'>
                <i className={`iconfont im-xiazai ${cssStyle.toolBtn}`}
                   title='下载图片到本地'
                   onClick={() => this.saveImg(maxImg, imgName)}/>
              </a>
            }


          </div> : null
        }

      </div>

    );
  }
}

// render(<ImgEnlargeAndRotate/>, document.getElementById('root'))