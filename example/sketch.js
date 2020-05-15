//------------------------------------------------------------
console.log('ml5 version:', ml5.version);


// let bodypix;
// let cam;
// let segmentation;
let particles = [];
let img;

let picture;
let leftpattern;
let TPleftpattern;
let lefttracking = [];
let cutDone = false;
let cutX;
let cutY;

let video;
let poseNet;
let poses;

let Point = [];
let Location = [];

let isHit;
let wasHitRect = false;
let wasHit = false;

let v1;
let v2;
let a1;
let b1;
let angle;
let centerX;
let centerY;
let x1;
let y1;
let x2;
let y2;
let n;
const options = {
  outputStride: 8, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5
  }
  let quickdraw = [];
//------------------------------------------------------------
let imgTitle;
let categoryName;
//------------------------------------------------------------
let x,y;
let strokeIndex = 0;
let index = 0;
let currentDrawing;
let prevx, prevy;
let myCanvas;
let phase;
let pgs = [];
//let pg;
let lastData;
let currentDrawingStrokeCount;
let totalStroke = 0;
let judge = true;
let m = 1;
//------------------------------------------------------------
//bouncing constants
let xSurface = 0;
let ySurface = 0;
let xspeed;
let yspeed;
//------------------------------------------------------------

function preload() {
  imgTitle = loadImage('img/word.png');
  leftpattern = loadImage("pics/leftwrist.png");
  TPleftpattern = loadImage("pics/TPleftwrist.png");
}
function setup() {
  
  myCanvas = createCanvas(window.innerWidth+300, window.innerHeight);
  
  categoryName = createInput("cat");
  categoryName.style('font-size', '30px', 'color', '#4CAF50');
  categoryName.style('width', '500px'); 
  //categoryName.style('border', '3px', 'color', '#4CAF50');
  categoryName.position(550,300);
//------------------------------------------------------------
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();   

  poseNet = ml5.poseNet(video, modelReady);
poseNet.on('pose', function (results) {
poses = results;
});

img = createImage(width,height);
picture = loadImage('pics/test.jpg');

// cam = createCapture(cam);
// cam.size(width,height);
// cam.hide();

// bodypix = ml5.bodyPix(cam, modelReady);
//------------------------------------------------------------
  var btn = document.createElement("BUTTON");
  document.body.appendChild(btn);

  // button = createButton("Draw");
  // button.mousePressed(requestCategory);
  // button.position(150, height);

  requestCategory();

  //------------
  // pg = createGraphics(255,255);
  //------------
  pixelDensity(1);
  leftpattern.loadPixels();
  loadPixels();
}

function requestCategory() {
  loadJSON(
    `http://localhost:8080/drawing/${encodeURI(categoryName.value())}`,
    drawCategory,
    (err) => alert("No such drawing. Please use lower case or change one:)")
  );
}

function drawCategory(data) {
  clear();
  if (data.code == 404) {
    alert("No such drawing. Please use lower case or change one:)");
    return;
  }
  noFill();

//------------------------------------------------------------


currentDrawing = data.drawing;
m=1;
pg = createGraphics(255,255);

//------------------------------------------------------------
  // data.drawing.forEach(([xs, ys]) => {
  //   beginShape();
  //   xs.forEach((x, i) => vertex(x, ys[i]));
  //   endShape(CLOSE);
  // });

}

function draw(){
  //image(imgTitle, 0, 0);
  clear();
  
  leftwrist();
  image(imgTitle, 600, 100,imgTitle.width/2,imgTitle.height/2);
  index = 0
  strokeIndex = 0
  
  if(currentDrawing){
    for(d=0;d<currentDrawing.length;d++){
      
        totalStroke = totalStroke+currentDrawing[d][0].length-1;
      
    }
    
  }

//console.log(totalStroke);

//if(frameCount % 10 === 0){
  m++;
//}
  
      for (let k=0;k<m;k++){
        drawNextStroke();
      }
  
  //m = 1;
  for(let i = 0;i<pgs.length;i++){
    //console.log('in loop');
    image(pgs[i],pgs[i][0],pgs[i][1]);
    //console.log(pgs[i]);
    pgs[i][0]+=pgs[i][2];
    pgs[i][1]+=pgs[i][3];
    if (pgs[i][0] > window.innerWidth - 127.5 || pgs[i][0] < 127.5) {
      pgs[i][2] = -pgs[i][2];
    }
    if (pgs[i][1] > window.innerHeight - 127.5 || pgs[i][1] < 127.5) {
      pgs[i][3] = -pgs[i][3];
    }
  }
//------------------------------------------------------------

bodyPose();

if (cutDone){
  // noStroke();
  //   fill(196,214,219);
  //   ellipse(cutX,cutY,16);
    //-----------
    
    let p = new Particle();
    
    particles.push(p);
  
    
      for(m=0;m<particles.length;m++){
        if (particles.length <200){
        particles[m].update();
        particles[m].show();
        }else{
          cutDone = false;
          particles.splice(0,particles.length);
        }
    }
    
} 


  //------------------------------------------------------------
}

class Particle{

  constructor(){
    this.x = cutX+127.5;
    this.y = cutY+127.5;
    this.vx = random(-0.3,0.3);
    this.vy = random(0,1);
    this.alpha = 225;
    this.r = 10;
  }

  update(){
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 2;
    this.r += 1;
  }

  show(){
    stroke(196,214,219,this.alpha);
    fill(196,214,205,this.alpha);
    ellipse(this.x, this.y, this.r);

  }
}
function bodyPose(){
//   image(picture,width/2, height/2, 255, 255); 
// let centerX = (width+255)/2;
// let centerY = (height+255)/2;
// image(video, 0, 0);

if (poses != undefined ) {
  // if (poses[0] != undefined){
  for (let i = 0; i < poses.length; i++) {
    // console.log( poses[i].pose.keypoints ); // take a look at this first

    for (let j=0; j< poses[i].pose.keypoints.length; j++) {

      // console.log( poses[0].pose.keypoints[9] );
      // console.log( poses[0].pose.keypoints[10] );
      let partname1 = poses[0].pose.keypoints[9].part; //-->leftwrist
      let partname2 = poses[0].pose.keypoints[10].part; //-->rightwrist
      let score1 = poses[0].pose.keypoints[9].score;
      let score2 = poses[0].pose.keypoints[10].score;
      x1 = poses[0].pose.keypoints[9].position.x;
      y1 = poses[0].pose.keypoints[9].position.y;
      x2 = poses[0].pose.keypoints[10].position.x;
      y2 = poses[0].pose.keypoints[10].position.y;
      
      
      

      if (score1 > 0 || score2 > 0) {
        noStroke();
        fill(0,255,0);
        ellipse(a1,b1,5,5);
        ellipse(x2,y2,5,5);
        // text(partname1, x1 + 10, y1 + 10);
        // text(partname2, x2 + 10, y2 + 10);
        // text(nf(score1, 0, 2), x1 + 10, y1 + 30);
        // text(nf(score2, 0, 2), x2 + 10, y2 + 30);
      }
    
    // }
    for (n = 0;n<pgs.length;n++){
      centerX = pgs[n][0]+127.5;
      centerY = pgs[n][1]+127.5;
      slice();
      
    }
    
    
    
  }
  
  }
}



// if (segmentation !== undefined) {
    
//     let w = segmentation.raw.width;
//     let h = segmentation.raw.height;
//     let data = segmentation.raw.data;
    
    
    
    
    img.loadPixels();
    
    // for (let y = 0; y < h; y++) {
    //   for (let x = 0; x < w; x++) {
    //     let index = x + y*w; // ***
        

    //     if ( data[index] == 21 || data[index] == 23) {
    //       // if "rightHand" and "leftHand", set the color red
    //       img.pixels[index*4 + 0] = 255;
    //       img.pixels[index*4 + 1] = 255;
    //       img.pixels[index*4 + 2] = 255;
    //       img.pixels[index*4 + 3] = 100;
    //     }
    //     else {
    //       // transparent
    //       img.pixels[index*4 + 0] = 0;
    //       img.pixels[index*4 + 1] = 0;
    //       img.pixels[index*4 + 2] = 0;
    //       img.pixels[index*4 + 3] = 0;
    //     }
    //   }
    // }
    // img.updatePixels();}
    image(img, 0, 0, width, height);  
}
// a1 = lerp(a1,x1,0.3);


function slice(){
  noFill();
  rect(centerX-127.5,centerY-127.5,255,255);
  isHit = collidePointRect(x1,y1,centerX-127.5,centerY-127.5,255,255);
  if (isHit == true){
    console.log("slice");
    scatter();
  }
}
// function slice(){
//   isHit = collidePointLine(x1,y1,centerX*2-255,centerY*2-255,centerX*2,centerY*2-255,0.3) ||
//     collidePointLine(x1,y1,centerX*2,centerY*2-255,centerX*2,centerY*2,0.3) ||
//     collidePointLine(x1,y1,centerX*2,centerY*2,centerX*2-255,centerY*2,0.3) ||
//     collidePointLine(x1,y1,centerX*2-255,centerY*2,centerX*2-255,centerY*2-255,0.3); // hint: cannot be redefined
  
 
//     if (isHit == true && wasHit == false){
//       wasHit = true;
      
//         console.log("enter the picture!");         
//         v1 = createVector(x1-centerX, y1-centerY); 
//         console.log(x1-centerX, y1-centerY);
//         scatter();        
//     } else if (wasHit == true && isHit == true ){
     
//       v2 = createVector(x1-centerX,y1-centerY);
 
//       angle = abs(degrees(v1.angleBetween(v2)));
//           if(angle>90){ 
            
//             // scatter();
//             // console.log("slice!");
//             // console.log("New location is: " + (x1-centerX,y1-centerY));
//             // console.log("angle is" + angle);
//             wasHit = false;
            
//           } 
//           // isHit == false; 
        
//         }
// }

function scatter(){
  console.log("scatter");
  cutX = pgs[n][0];
  cutY = pgs[n][1];
  // console.log(cut.x,cut.y);
  

  // xspeed = 0;
  // yspeed = 0;
  // pgs[n].loadPixels();
  

  // let rectSize = 5;
    
  //   for (let y=centerY-127.5; y<=centerY+127.5; y+=rectSize){
  //     for (let x=centerX-127.5; x<=centerX+127.5; x+=rectSize){
  //       let w = x+y*255;
  //       // console.log(w);
        
  //         // console.log(pgs[n].pixels);
  //         fill(pgs[n].pixels[w]);
  //       // fill(pgs[n].pixels[w*4],pgs[n].pixels[w*4+1],pgs[n].pixels[w*4+2]);
  //       // console.log(pgs[n].pixels[w*4],pgs[n].pixels[w*4+1],pgs[n].pixels[w*4+2]);
  //       rect(x,y+frameCount,rectSize,rectSize);
  //     }
  //   }
  //   pgs[n].updatePixels();

    
    // console.log(cut.x,cut.y);
    cutDone = true;
    pgs.splice(n,1);
    
    
}



function leftwrist(){
  
  image(leftpattern,x1,y1,100,100);
  // New location
  let point = {
    x: x1,
    y: y1
  }
  lefttracking.push(point); // Update the last spot in the array with the leftwrist location.

  if (lefttracking.length > 5) {
    lefttracking.splice(0,1);
  }
  
  // Draw everything
  for (var i = 0; i < lefttracking.length; i++) {
     // Draw an ellipse for each element in the arrays. 
     // Color and size are tied to the loop's counter: i.
    
    // noStroke();
    // fill(255-i/5);
    // ellipse(lefttracking[i].x,lefttracking[i].y,i,i);
    // tint(255, 100);
    image(TPleftpattern,lefttracking[i].x,lefttracking[i].y,100,100);
  }
}
function modelReady() {
  console.log('Model Ready!');
  // bodypix.segmentWithParts(gotResults, options);
  }
  
  function gotResults(error, result) {
  if (error) {
  console.log(error);
  return;
  }
  segmentation = result;
  
  //   image(cam, 0, 0, width, height);
  //   image(segmentation.image, 0, 0, width, height); // other parts except left right hands
  //  ?
  
  bodypix.segmentWithParts(gotResults, options);
  }

function drawNextStroke() {
  //clear();
  //rect(0, 0, 10, 10);
  //------------------------------------------------------------
  if(currentDrawing){

    let x = 0.4*window.innerWidth+currentDrawing[strokeIndex][0][index];
    let y = 0.38*window.innerHeight+currentDrawing[strokeIndex][1][index];
    //console.log(currentDrawing.length);
    //point(x,y);
    //console.log(prevx,prevy);
    line(prevx,prevy,x,y);
    //console.log(x,y);
    stroke(0);
    strokeWeight(3);
    index++;
    if(index>=currentDrawing[strokeIndex][0].length){

      strokeIndex++;
      prevx = undefined;
      prevy = undefined;
      index = 0;
      if(strokeIndex==currentDrawing.length){

        lastData = currentDrawing;
        //console.log(lastData);
        currentDrawing = null;
        currentDrawing = undefined;
        strokeIndex = 0;
        //loadJSON('/angel',gotDrawing);

      }
    }else{

    prevx = x;
    prevy = y;
  }
  phase = true;
  //console.log(data);

  //console.log(currentDrawing);
}else{
  //console.log(data);
  if(phase){
    //('drawing end!');
    //clear();
    phase = false;

    saveDraft(pg,lastData);

  
  }

  //console.log('drawing end!');
}

  //------------------------------------------------------------
    //floating();
    // for(let i = 0;i<pgs.length;i++){
    //   //console.log('in loop');
    //   image(pgs[i],pgs[i][0],pgs[i][1]);
    //   pgs[i][0]+=pgs[i][2];
    //   pgs[i][1]+=pgs[i][3];
    //   if (pgs[i][0] > window.innerWidth - 127.5 || pgs[i][0] < 127.5) {
    //     pgs[i][2] = -pgs[i][2];
    //   }
    //   if (pgs[i][1] > window.innerHeight - 127.5 || pgs[i][1] < 127.5) {
    //     pgs[i][3] = -pgs[i][3];
    //   }
    // }
}

//------------------------------------------------------------
function saveDraft(surface, lastData){
  // surface.background('white');
  console.log('draft saved');
  //console.log(lastData);
  for(let path of lastData){
    surface.noFill();
    surface.stroke(0);
    surface.strokeWeight(3);
    surface.beginShape();
    for(let i = 0;i<path[0].length;i++){
      let x = path[0][i];
      let y = path[1][i];
      surface.vertex(x,y);
    }
    surface.endShape();
  }
  //image(surface,0,0);
  // let x1 = Math.random() * 500+255;
  // let y1 = Math.random() * 500+255;
  surface[0] = 600;
  surface[1] = 400;

  xspeed = Math.random()*5;
  yspeed = Math.random()*5;

  surface[2] = xspeed;
  surface[3] = yspeed;
  //console.log(x1,y1);
  //image(surface,x1,y1);
  if (pgs.length>=10){
    pgs.shift();
  }
  pgs.push(surface);
}


