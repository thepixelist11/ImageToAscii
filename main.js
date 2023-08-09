// ---------- Utils
function lerp(A, B, t) {
  return A + (B - A) * t;
}

function getIntersection(A, B, C, D) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }

  return null;
}

function polysIntersection(poly1, poly2) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(poly1[i], poly1[(i + 1) % poly1.length], poly2[j], poly2[(j + 1) % poly2.length]);
      if (touch) {
        return true;
      }
    }
  }
  return false;
}

function getRGBA(value) {
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = R;
  const B = value > 0 ? 0 : 255;
  return 'rgba(' + R + ',' + G + ',' + B + ',' + alpha + ')';
}

function swap(arr, firstIndex, secondIndex) {
  var temp = arr[firstIndex];
  arr[firstIndex] = arr[secondIndex];
  arr[secondIndex] = temp;
}
function sort(arraytest) {
  var len = arraytest.length,
    i,
    j,
    stop;
  for (i = 0; i < len; i++) {
    for (j = 0, stop = len - i; j < stop; j++) {
      if (arraytest[j] > arraytest[j + 1]) {
        swap(arraytest, j, j + 1);
      }
    }
  }
  return arraytest;
}

class col {
  constructor(r, g, b, a = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
class aARect{
  constructor(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.update()
  }

  update(){
    this.points = [
      [this.x, this.y],
      [this.x + this.width, this.y],
      [this.x + this.width, this.y + this.height],
      [this.x, this.y + this.height],
    ]
  }
}

function drawPoint(x, y, radius, ctx, color = new col(0, 0, 0)) {
  ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawLine(x1, y1, x2, y2, width, ctx, color = new col(0, 0, 0)){
  ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  ctx.lineWidth = width
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPoly(points, ctx, borderWidth, color = new col(0, 0, 0), filled = false, fillCol = new col(0, 0, 0)){
  if(!filled){
    //Draw the edges of the polygon
    for(let i = 0; i < points.length - 1; i++){
      drawLine(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], borderWidth, ctx, color)
    }
    drawLine(points[points.length - 1][0], points[points.length - 1][1], points[0][0], points[0][1], borderWidth, ctx, color)
  } else {
    ctx.lineWidth = borderWidth
    ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    ctx.fillStyle = `rgb(${fillCol.r}, ${fillCol.g}, ${fillCol.b}, ${fillCol.a})`
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    //Add verticies
    for(let i = 1; i < points.length; i++){
      ctx.lineTo(points[i][0], points[i][1])
    }
    ctx.lineTo(points[0][0], points[0][1])
    ctx.fill();
    ctx.stroke();
  }
}

function deg2rad(x){
  return x * Math.PI / 180
}

function rad2deg(x){
  return x * 180 / Math.PI
}

function index2coords(index, width){
  return {
    x: index % width,
    y: Math.floor(index / width - 1) + 1
  }
}

function coords2index(x, y, width){
  return x + (y * width)
}

function snapToGrid(x, y, width, height){
  const retX = Math.floor(x / width)
  const retY = Math.floor(y / height)

  return {
    x: retX,
    y: retY
  }
}
function drawGrid(backgroundCol, lineCol, ctx, countX, countY, lineWidth = 2){
  ctx.fillStyle = `rgb(${backgroundCol.r}, ${backgroundCol.g}, ${backgroundCol.b})`
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for(let i = 1; i < countX; i++){
    drawLine(i * ctx.canvas.width / countX, 0, i * ctx.canvas.width / countX, ctx.canvas.height, lineWidth, ctx, lineCol)
  }
  for(let i = 1; i < countY; i++){
    drawLine(0, i * ctx.canvas.height / countY, ctx.canvas.height, i * ctx.canvas.height / countY, lineWidth, ctx, lineCol)
  }
}

function expand(s){
  let sets = s.split(',')
  let ret = []
  for(let i = 0; i < sets.length; i++){
    const quant = parseInt(sets[i].split(':')[0])
    const val = sets[i].split(':')[1]
    for(let j = 0; j < quant; j++){
      ret.push(val)
    }
  }
  return ret
}

/**
 * 
 * @param {any[]} a 
 * @returns {String}
 */
function compress(a){
  let lastVal = null
  let currentQuant = 0
  let currentVal = null
  let ret = ''
  for(let i = 0; i < a.length; i++){
    if(i == 0){
      currentVal = a[0]
      currentQuant = 0
      lastVal = a[0]
    }
    if(a[i] != lastVal){
      ret = ret.concat(`${currentQuant}:${currentVal},`)
      currentVal = a[i]
      lastVal = a[i]
      currentQuant = 1
    } else {
      currentQuant++
    }
  }
  ret = ret.concat(`${currentQuant}:${currentVal},`)
  return ret
}

/**
 * 
 * @param {any[]} array 1D Array to find neighbours in
 * @param {*} value Value to search for
 * @param {Number} index Index in the array to get the neighbours of
 * @param {Number} width Width of the array
 * @returns {Number}
 * Find the number of neighbouring elements of a certain value in a 1D array used as a grid.
 */
function getNumberOfNeighbours(array, value, index, width) {
  // Convert the 1D index to 2D coordinates
  const { x, y } = index2coords(index, width);

  // Define the relative coordinates of the neighbors
  const relativeCoords = [
    { dx: -1, dy: -1 }, // Top-left
    { dx: 0, dy: -1 },  // Top
    { dx: 1, dy: -1 },  // Top-right
    { dx: -1, dy: 0 },  // Left
    { dx: 1, dy: 0 },   // Right
    { dx: -1, dy: 1 },  // Bottom-left
    { dx: 0, dy: 1 },   // Bottom
    { dx: 1, dy: 1 }    // Bottom-right
  ];

  // Count the neighbors with the specified value
  let count = 0;
  for (const coord of relativeCoords) {
    const newX = x + coord.dx;
    const newY = y + coord.dy;
    if (newX >= 0 && newX < width && newY >= 0 && newY < array.length / width) {
      const newIndex = coords2index(newX, newY, width);
      if (array[newIndex] === value) {
        count++;
      }
    }
  }

  return count;
}

/**
 * 
 * @param {Number} x Left position
 * @param {Number} y Top position
 * @param {Number} width 
 * @param {Number} height 
 * @returns {Boolean}
 * Find if the mouse position is within a certain area.
 */
function mouseInArea(x, y, width, height){
  return mouse.x > x && mouse.x < x + width && mouse.y > y && mouse.y < y + height
}

/**
 * @param {Number} start The startpoint of the cut
 * @param {Number} end The endpoint of the cut
 * @returns {String}
 */
String.prototype.cut = function(start, end = this.length){
  let val = this.split('')
  val = val.splice(0, start).join('') + val.splice(end, this.length).join('')
  return val
}

// -------- Event Listeners
document.onmousemove = evt => {
  const rect = canvas.getBoundingClientRect()
  mouse.x = evt.clientX - rect.left
  mouse.y = evt.clientY - rect.top
}
document.onkeydown = evt => {
  if(!keys.includes(evt.key)){
    keys.push(evt.key)
  }
}
document.onkeyup = evt => {
  if(keys.includes(evt.key)){
    keys.splice(keys.indexOf(evt.key), 1)
  }
}
document.onblur = evt => {
  keys = []
  mouseDown = []
}
document.onmousedown = evt => {
  if(!mouseDown.includes(evt.button)){
    mouseDown.push(evt.button)
  }
}
document.onmouseup = evt => {
  if(mouseDown.includes(evt.button)){
    mouseDown.splice(mouseDown.indexOf(evt.button))
  }
}
document.oncontextmenu = evt => {
  evt.preventDefault()
}

// -------- General Functions
function toAscii(){
  realCols = getColArray()
  data = colArrayToData(toGrayscale(getColArray()))
  state = 'ascii'
  document.querySelector('label').style.display = 'none'
  document.getElementById('ascii').style.display = 'none'
  document.getElementById('download').style.display = 'block'
  document.getElementById('scale').style.display = 'none'
  document.getElementById('invert').style.display = 'none'
  document.getElementById('keepCol').style.display = 'none'
  document.querySelector('button').style.display = 'none'
}

function getColArray(){
  const rd = ctx.getImageData(0, 0, image.width, image.height).data
  let ret = []
  for(let i = 0; i < rd.length; i+=4){
    ret.push(new col(rd[i], rd[i + 1], rd[i + 2], rd[i + 3]))
  }
  return ret
}

function dataToColArray(rd){
  let ret = []
  for(let i = 0; i < rd.length; i+=4){
    ret.push(new col(rd[i], rd[i + 1], rd[i + 2], rd[i + 3]))
  }
  return ret
}

function toGrayscale(a){
  let ret = []
  for(let i = 0; i < a.length; i++){
    let v = colToValue(a[i]) * 255
    ret.push(new col(v, v, v))
  }
  return ret
}

function colArrayToData(a){
  let ret = new Uint8ClampedArray(a.length * 4)
  let addLoc = 0
  for(let i = 0; i < a.length; i++, addLoc += 4){
    ret[addLoc] = a[i].r
    ret[addLoc + 1] = a[i].g
    ret[addLoc + 2] = a[i].b
    ret[addLoc + 3] = 255
  }
  return new ImageData(ret, image.width, image.height)
}

function colToValue(col){
  if(col.r === 255 && col.g === 255 & col.b === 255){
    return 1
  }
  return (0.299 * col.r / 255) + (0.587 * col.g / 255) + (0.114 * col.b / 255)
}

function renderAscii(bgCol = new col(255, 255, 255), txtCol = new col(0, 0, 0), keepCol = false){
  const size = canvas.width / image.width
  ctx.fillStyle = `rgb(${bgCol.r},${bgCol.g},${bgCol.b})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = `${size}px bold georgia`
  canvas.style.imageRendering = 'auto'
  const colArr = dataToColArray(data.data)
  for(let i = 0; i < colArr.length; i++){
    if(!keepCol){
      ctx.fillStyle = `rgb(${txtCol.r}, ${txtCol.g}, ${txtCol.b})`
    } else {
      ctx.fillStyle = `rgb(${realCols[i].r}, ${realCols[i].g}, ${realCols[i].b})`
    }
    ctx.fillText(chars[Math.floor(lerp(0, chars.length - 1, colToValue(colArr[i]) / 1))], index2coords(i, image.width).x * size, index2coords(i, image.width).y * size)
  }
}

function downloadCanvas() {
  const fullName = document.getElementById('fileInput').files[0].name
  var link = document.createElement('a')
  link.download = `${fullName.cut(fullName.indexOf('.'), fullName.length - 1)}-ASCII.png`
  link.href = canvas.toDataURL()
  link.click()
}

function rescaleImage(size){
  const c = document.createElement('canvas')
  const cContext = c.getContext('2d')
  c.width = image.width * size
  c.height = image.height * size
  c.style.width = `${image.width}px`
  c.style.height = `${image.height}px`
  cContext.drawImage(image, 0, 0, image.width * size, image.height * size)
  c.style.width = `${image.width * size}px`
  c.style.height = `${image.height * size}px`
  image.src = c.toDataURL()
}

function updateImgSize(){
  image.src = originSrc
  rescaleImage(document.getElementById('imgSize').value)
}

function updateScaleDisplay(){
  document.getElementById('scaleDisplay').innerHTML = `${document.getElementById('imgSize').value}x`
  document.getElementById('dimensionsDisplay').innerHTML = `${image.width} x ${image.height}`
}

// -------- Variables and Constants
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let mouse = {x: 0, y: 0}
let mouseDown = []
let keys = []

const image = document.createElement('img')
let originSrc

let data

let state = 'selecting'
let loop = true
let invert = false
let keepImgCols = false

let realCols = []

/*
  CHARSETS
'@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\'.` '
'▒░ '
'@ '
'WGQOKHXYFCCBMTNEARHTNEAbdeousnr^\\JLZvyjyqpkhfa-t\"t<>}{)(][I'.,:-_*!|i1l!;:., '
'@BW*boapwmQOLct/|(1-_+:^\'.` '
*/

let chars = '@BW*boapwmQOLct/|(1-_+:^\'.` '.split('')

// -------- Main
main()

document.getElementById('fileInput').onchange = function (evt) {
  var tgt = evt.target,
    files = tgt.files

  if (FileReader && files && files.length) {
    var fr = new FileReader()
    fr.onload = function () {
      image.src = fr.result
    }
    fr.readAsDataURL(files[0])
  }
}

function main(){
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  document.getElementById('dimensionsDisplay').innerHTML = `${image.width} x ${image.height}`
  
  if(image.src){
    if(originSrc === undefined){
      originSrc = image.src
      document.getElementById('dimensionsDisplay').innerHTML = `${image.width} x ${image.height}`
      document.getElementById('scale').style.display = 'inline-flex'
      document.getElementById('invert').style.display = 'inline-flex'
      document.getElementById('keepCol').style.display = 'inline-flex'
      document.querySelector('button').style.display = 'block'
    }
    const aspectRatio = image.width / image.height
    canvas.style.width = `${400 * aspectRatio}px`
    canvas.style.height = `${400}px`
    canvas.width = image.width
    canvas.height = image.height
    if(state === 'selecting'){
      ctx.drawImage(image, 0, 0)
    } else {
      canvas.width = 600 * aspectRatio
      canvas.height = 600
      if(invert){
        chars.reverse()
        renderAscii(new col(0, 0, 0), new col(255, 255, 255), keepImgCols)
      } else {
        renderAscii(new col(255, 255, 255), new col(0, 0, 0), keepImgCols)
      }
      loop = false
    }
  }
  if(loop){
    requestAnimationFrame(main)
  }
}