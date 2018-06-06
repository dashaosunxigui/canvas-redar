//data：雷达图所依据的数据
var data      = {
  scoreData : [
    { text : '攻击', value : '45' },
    { text : '力量', value : '23' },
    { text : '体质', value : '67' },
    { text : '精神', value : '89' },
    { text : '敏捷', value : '17' },
    { text : '防御', value : '49' },
    { text : '速度', value : '88' },
    { text : '属性', value : '17' },
    { text : '爱咋咋', value : '49' }
  ],
  //option    : '' //自定义样式
  option : {
    polygonBgColor : ['#f97683', '#bf93d8', '#44909e'],//多边形背景色
  }
}
let init = {
  id            : document.querySelector('#redarCanvas'),
  canvasW       : '560', //自定义canvas 宽度
  canvasH       : '560', //自定义canvas 高度
  animationLoop : '',
  animation     : '',
  start         : '',
  defaultStyle  : {
    polygonBgColor : ['orange', 'red', 'skyblue'],//多边形背景色
    Bgshadow       : {
      color      : '',
      shadowBlur : 0
    },
    translate      : {
      x : 1,
      y : 8/9
    }, //图像偏移量(相对于中心点的倍数)
    rayLine        : {// 辐射线样式
      color : '#B7AB72'
    },
    pointLine      : {// 连接分数点线条样式
      color : 'rgba(255,255,255,.1)'
    },
    points         : {// 分数点样式
      size : 1/25
    },
    tipText        : {
      color : 'rgb(75,66,66)', //Array || String
      fontSize : '64'
    },
    alpha : 0.3,
    Reminder       : { //右下角标注样式
      bgColor    : [
        '#f97683',
        '#bf93d8',
        '#44909e'
      ],
      text       : [
        '高',
        '中',
        '低'
      ],
      color      : 'rgba(119,119,119,1)',
      width      : .04,
      fontSize   : 1,
      coordinate : {
        x : 1/7,
        y : 1.05
      }
    }
  }
}

function objAssign(source, target) {
  try {
    var json   = JSON.parse(JSON.stringify(source))
    var assign = function(source, target) {
      for (var key in target) {
        if (key in source) {
          if (Object.prototype.toString.call(target[key])==='[object Object]') {
            assign(source[key], target[key])
          } else {
            if (target[key]!==source[key]) {
              source[key] = target[key]
            }
          }
        }
      }
    }
    assign(json, target)
    console.log(json)
    return json
  } catch (e) {
    console.error(e)
    return {}
  }
}

let myCanvas   = init.id
let    ctx        = myCanvas.getContext('2d')

var pointScore = []
var pointText  = []

data.scoreData.sort(function(x, y) {
  return x.value-y.value
})

data.scoreData.forEach(function(e) {
  pointText.push(e.text)
  pointScore.push(e.value)
})
if (data.option) {
  var polygonStyle = objAssign(init.defaultStyle, data.option)
} else {
  var polygonStyle = init.defaultStyle
}

if (pointScore.length==3) {
  polygonStyle.translate.y           = 1/2
  //polygonStyle.Reminder.coordinate.y = 1.6
}
/*设置画布宽高*/
myCanvas.width  =  init.canvasW
myCanvas.height = init.canvasH

let width  = myCanvas.width,
    height = myCanvas.height
//根据设备的DPR设置画布的宽高
if (window.devicePixelRatio) {
  myCanvas.style.width  = width+'px'
  myCanvas.style.height = height+'px'
  myCanvas.height       = height*window.devicePixelRatio
  myCanvas.width        = width*window.devicePixelRatio
}
let polygonArr = []//存放多边形实例

let Radius = myCanvas.height/2.6

let numofSide = pointScore.length //n边形(n>=3)

var maxScore = Math.max.apply(Math, pointScore)

var end = false

//闪烁
var twinkleSpeed = 1
var shadowBlur   = 0

/*多边形构造函数*/
function Polygon(option, ctx) {
  this.option         = option
  this.pointY         = option.pointY || 0
  this.pointX         = option.pointX || 0
  this.translateX     = this.pointX
  this.translateY     = this.pointY
  this.lengthofSide   = option.lengthofSide
  this.numofSide      = option.numofSide || 3
  this.animationFrame = 0
  this.scaleRate      = 0 // 缩放比例
  this.radian         = 360/this.numofSide/2*Math.PI/180
  this.shadow         = option.shadow || undefined
  //多边形外接圆的半径 cos(360/numofside/2) = L/2/r;
  if (this.lengthofSide) {
    this.r = this.lengthofSide/2/Math.sin(this.radian)
  } else {
    this.r = option.r
  }

  this.isFill        = option.isFill || false
  this.strokeStyle   = option.strokeStyle || '#fff'
  this.fillStyle     = option.fillStyle || '#000'
  this.ctx           = ctx
  this.isScale       = option.isScale
  this.line          = 0
  this.drawlineSpeed = 5
  this.progress      = 0
  polygonArr.push(this)
}

Polygon.prototype.draw = function() {
  this.pointY = this.isScale ? 0 : this.option.pointY
  this.pointX = this.isScale ? 0 : this.option.pointX
  this.ctx.beginPath()
  this.ctx.strokeStyle = this.strokeStyle
  this.ctx.setLineDash([])
  var startX = this.pointX+this.r*Math.sin(2*Math.PI*0/this.numofSide)
  var startY = this.pointY+this.r*Math.cos(2*Math.PI*0/this.numofSide)
  this.ctx.moveTo(startX, startY)
  for (var i = 1; i <= this.numofSide; i++) {
    var X = this.pointX+this.r*Math.sin(2*Math.PI*i/this.numofSide)
    var Y = this.pointY+this.r*Math.cos(2*Math.PI*i/this.numofSide)
    this.ctx.lineTo(X, Y)
  }
  if (this.shadow) {
    this.ctx.shadowColor   = this.shadow.color
    this.ctx.shadowBlur    = 40
    this.ctx.shadowOffsetY = 30
  } else {
    this.ctx.shadowBlur    = 0
    this.ctx.shadowColor   = 'none'
    this.ctx.shadowOffsetY = 0
    this.ctx.shadowOffsetX = 0
  }
  if (this.isFill) {
    this.ctx.fillStyle = this.fillStyle
    this.ctx.fill()
  }
  this.ctx.closePath()
  this.ctx.stroke()
}

Polygon.prototype.update = function() {
  var t          = this.animationFrame*16/1000
  this.scaleRate = -1/2*Math.pow(Math.E, (-6*t/1.5))*(-2*Math.pow(Math.E, (6*t/1.5))+Math.sin(12*t/1.5)+2*Math.cos(12*t/1.5))
  this.animationFrame += 1
}

Polygon.prototype.scale = function() {
  this.ctx.save()
  this.ctx.translate(this.translateX, this.translateY)
  this.ctx.scale(this.scaleRate, this.scaleRate)
  this.draw()
  this.ctx.restore()
}

//右下角标注
Polygon.prototype.drawReminder = function(text, color, x, y, height, width, bgColor, alpha) {
  var fontSize = width*polygonStyle.Reminder.fontSize
  this.ctx.beginPath()
  this.ctx.fillStyle = bgColor
  this.ctx.fillRect(x, y, width, height)
  this.ctx.textAlign    = 'start'
  this.ctx.font         = fontSize+'px 微软雅黑'
  this.ctx.fillStyle    = 'rgba(75,66,66,'+alpha+')'
  this.ctx.textBaseline = 'middle'
  this.ctx.fillText(text, x+width*1.4, y+height/2)
  this.ctx.closePath()
}
//绘制辐射线
Polygon.prototype.drawLine = function(callback) {
  this.ctx.beginPath()
  for (var i = 1; i <= this.numofSide; i++) {
    this.ctx.lineWidth   = myCanvas.height*.002
    this.ctx.strokeStyle = polygonStyle.rayLine.color
    this.ctx.setLineDash([5, 10])
    this.ctx.moveTo(this.pointX, this.pointY)
    var X = this.pointX+this.r*Math.sin(2*Math.PI*i/this.numofSide)
    var Y = this.pointY+this.r*Math.cos(2*Math.PI*i/this.numofSide)
    this.ctx.lineTo(X, Y)
  }
  this.ctx.stroke()
  this.ctx.closePath()
}

Polygon.prototype.drawPoint = function(callback) {
  if (this.progress >= maxScore) {
    this.progress===maxScore
    callback && callback()
  } else {
    this.progress += .4
  }

  /*连接分数点*/
  this.ctx.beginPath()
  this.ctx.shadowBlur  = 0
  this.ctx.shadowColor = ''
  this.ctx.strokeStyle = polygonStyle.pointLine.color
  this.ctx.setLineDash([])
  this.ctx.lineWidth = '2'
  this.ctx.moveTo(
    this.pointX+0.92*(this.progress*pointScore[0]/maxScore/100*this.r-this.r*polygonStyle.points.size)*Math.sin(2*Math.PI*0/this.numofSide),
    this.pointY+0.92*(this.progress*pointScore[0]/maxScore/100*this.r-this.r*polygonStyle.points.size)*Math.cos(2*Math.PI*0/this.numofSide))
  for (var j = 1; j < this.numofSide; j++) {
    let len = this.progress*pointScore[j]/maxScore/100*this.r
    this.ctx.lineTo(this.pointX+0.9*(len-this.r*polygonStyle.points.size)*Math.sin(2*Math.PI*j/this.numofSide), this.pointY+
                                                                                                                0.9*(len-this.r*polygonStyle.points.size)*Math.cos(2*Math.PI*j/this.numofSide))
  }
  this.ctx.fillStyle = 'rgba(255, 0, 0, 0.05)'
  this.ctx.fill()
  this.ctx.closePath()
  this.ctx.stroke()

  /*绘制分数点*/
  for (var i = 0; i < this.numofSide; i++) {
    if (pointScore[i]==maxScore && this.progress >= maxScore) {
      this.ctx.shadowBlur  = shadowBlur
      this.ctx.shadowColor = '#FCF3DF'
      if (shadowBlur >= 40) {
        twinkleSpeed = -.2
      }
      if (shadowBlur <= 1) {
        twinkleSpeed = .2
      }
      shadowBlur += twinkleSpeed
    }
    this.ctx.beginPath()
    this.ctx.strokeStyle = 'white'
    this.ctx.setLineDash([])
    this.ctx.lineWidth = myCanvas.height*.004
    var r              = this.r*polygonStyle.points.size
    if (maxScore===0) {
      this.ctx.arc(this.pointX, this.pointY, r, 0, 2*Math.PI, false)
    } else {
      this.ctx.arc(this.pointX+this.progress*pointScore[i]*0.94/maxScore/100*this.r*Math.sin(2*Math.PI*i/
                                                                                             this.numofSide), this.pointY+this.progress*pointScore[i]*0.94/maxScore/100*this.r*
                                                                                                              Math.cos(2*Math.PI*i/this.numofSide), r, 0, 2*Math.PI, false)
    }
    this.ctx.fillStyle = '#FCF3DF'
    this.ctx.fill()
    this.ctx.stroke()
  }
}

Polygon.prototype.render = function(callback) {
  if (this.animationFrame >= 1000/16*1.5 || this.isScale===false) {
    this.isScale = false
    this.draw()
    callback && callback()
  } else {
    this.update()
    this.scale()
  }
}

Polygon.prototype.drawTip = function(text, color, x, y, fontSize, alpha) {
  this.ctx.beginPath()
  this.ctx.font      = fontSize+'px 微软雅黑'
  this.ctx.fillStyle = 'rgba(75,66,66,'+alpha+')'
  this.ctx.textAlign = 'center'
  this.ctx.fillText(text, x, y)
  this.ctx.closePath()
}

var layer1 = new Polygon({
  pointX      : myCanvas.width/2*polygonStyle.translate.x,
  pointY      : myCanvas.height/2*polygonStyle.translate.y,
  numofSide   : numofSide,
  //      lengthofSide: 100,
  r           : myCanvas.width/3.5,
  strokeStyle : polygonStyle.polygonBgColor[0],
  fillStyle   : polygonStyle.polygonBgColor[0],
  isFill      : true,
  isScale     : true,
  shadow      : polygonStyle.Bgshadow
}, ctx)
var layer2 = new Polygon({
  pointX      : myCanvas.width/2*polygonStyle.translate.x,
  pointY      : myCanvas.height/2*polygonStyle.translate.y,
  numofSide   : numofSide,
  r           : myCanvas.width/3.5*2/3,
  fillStyle   : polygonStyle.polygonBgColor[1],
  strokeStyle : polygonStyle.polygonBgColor[1],
  isFill      : true,
  isScale     : true
}, ctx)
var layer3 = new Polygon({
  pointX      : myCanvas.width/2*polygonStyle.translate.x,
  pointY      : myCanvas.height/2*polygonStyle.translate.y,
  numofSide   : numofSide,
  r           : myCanvas.width/3.5*1/3,
  fillStyle   : polygonStyle.polygonBgColor[2],
  strokeStyle : polygonStyle.polygonBgColor[2],
  isFill      : true,
  isScale     : true
}, ctx)

var totalFrame     = 0
var change         = 8
var alpha          = 0
var change2        = 8
var alpha2         = 0
init.animationLoop = function() {
  totalFrame++
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height)
  for (var i = 0, len = polygonArr.length; i < len; i++) {
    if (totalFrame > 1000/16*1.5*1/5*i) {
      polygonArr[i].render()
      if (i===len-1) {
        polygonArr[i].render(function() {
          polygonArr[0].drawLine()
          for (var i = 2; i >= 0; i--) {
            let bgColor = polygonStyle.Reminder.bgColor[i], text = polygonStyle.Reminder.text[i],
                specX                                            = 0,
                color                                            = polygonStyle.Reminder.color,
                y                                                = (polygonStyle.Reminder.coordinate.y*polygonStyle.translate.y)*myCanvas.height+myCanvas.height/8*change/8,
                width                                            = polygonStyle.Reminder.width*myCanvas.height
            if (i===0) {
              specX = width*polygonStyle.Reminder.fontSize
            }
            let x = polygonStyle.Reminder.coordinate.x*myCanvas.width+(2-i)*myCanvas.width*1/4+specX
            polygonArr[0].drawReminder(text, color, x, y, width, width, bgColor, alpha)
            if (change > 0) {
              change -= 8/60
              alpha += 1/30
            }
          }
          for (var i = 0, len = pointScore.length; i < len; i++) {
            var restR    = Radius*1/30
            var x        = myCanvas.width/2*polygonStyle.translate.x+(Radius)*Math.sin(2*Math.PI*i/pointScore.length) -10
            var y        = myCanvas.height/2*polygonStyle.translate.y+(Radius)*Math.cos(2*Math.PI*i/pointScore.length)+myCanvas.height/8*change2/8 + 25
            var fontSize = init.defaultStyle.tipText.fontSize
            if (Array.isArray(polygonStyle.tipText.color)) {
              var color = polygonStyle.tipText.color[i]
            } else {
              var color = polygonStyle.tipText.color
            }
            polygonArr[0].drawTip(pointText[i], color, x, y, fontSize, alpha2)
            if (change2 > 0) {
              change2 -= 8/60
              alpha2 += 1/30
            } else {
              polygonArr[0].drawPoint()
            }
          }
        })
      }
    }
  }
  if (true) {
    init.animation = requestAnimationFrame(init.animationLoop)
  }
}
requestAnimationFrame(init.animationLoop)

