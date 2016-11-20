var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    } catch(e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;
var aVertexPosition;
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(aVertexPosition);

    aPlotPosition = gl.getAttribLocation(shaderProgram, "aPlotPosition");
    gl.enableVertexAttribArray(aPlotPosition);
}


var centerOffsetX = 0;
var centerOffsetY = 0;
var canX, canY = 0;

var zoom = 1;
var zoomCenterX;
var zoomCenterY;

var vertexPositionBuffer;
function initBuffers() {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var vertices = [
        1.0,  1.0,
        -1.0,  1.0,
        1.0, -1.0,
        -1.0, -1.0,
        ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 2;
    vertexPositionBuffer.numItems = 4;
}
var baseCorners = [
    [ 0.7,  1.2],
    [-2.2,  1.2],
    [ 0.7, -1.2],
    [-2.2, -1.2],
    ];
function drawScene() {
    resize(gl);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    if (currentlyPressedKeys[90] || currentlyTouching) {
        // Space bar
        if (currentlyPressedKeys[16]) {
            // Shift
            zoom *= 0.99
        } else {
            zoom *= 1.01
        }
    } 

    var plotPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
    var cornerIx;
    corners = [];
    for (cornerIx in baseCorners) {
        x = baseCorners[cornerIx][0];
        y = baseCorners[cornerIx][1];
        corners.push(x / zoom + centerOffsetX);
        corners.push(y / zoom + centerOffsetY);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPlotPosition, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.deleteBuffer(plotPositionBuffer);

    if (centerOffsetX != zoomCenterX) {
        centerOffsetX += (zoomCenterX - centerOffsetX) / 20;
    }

    if (centerOffsetY != zoomCenterY) {
        centerOffsetY += (zoomCenterY - centerOffsetY) / 20;
    }
}


function resetZoom() {
    zoom = 1.0;
    zoomCenterX = 0.28693186889504513;
    zoomCenterY = 0.014286693904085048;
}


function webGLStart() {
    resetZoom();
    var canvas = document.getElementById("gl-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    canvas.addEventListener("touchstart", handleTouchStart, false);
    canvas.addEventListener("touchmove", handleTouchXY, true);
    canvas.addEventListener("touchend", handleTouchEnd, false);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    setInterval(drawScene, 15);
    setInterval(handleKeys, 15);
}

var currentlyPressedKeys = {};
var currentlyTouching = false;

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys() {
    if (currentlyPressedKeys[65]) {
        // Left cursor key
        zoomCenterX -= 0.01/zoom;
    }
    if (currentlyPressedKeys[68]) {
        // Right cursor key
        zoomCenterX += 0.01/zoom;
    }
    if (currentlyPressedKeys[87]) {
        // Up cursor key
        zoomCenterY += 0.01/zoom;
    }
    if (currentlyPressedKeys[83]) {
        // Down cursor key
        zoomCenterY -= 0.01/zoom;
    }
}

function handleTouchStart() {
    currentlyTouching = true;
    handleTouchXY();
}

function handleTouchEnd() {
    currentlyTouching = false;
}

function handleTouchXY(e) {
    if (!e)
        var e = event;
    e.preventDefault();
    canX = e.targetTouches[0].pageX - can.offsetLeft;
    canY = e.targetTouches[0].pageY - can.offsetTop;
    alert("canvas x: " + canX);
    alert("canvas y: " + canY);
    alert("zoomCenterX: " + zoomCenterX);
    alert("zoomCenterY: " + zoomCenterY);
}

function resize(gl) {
  // Get the canvas from the WebGL context
  var canvas = gl.canvas;
 
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
 
    // Set the viewport to match
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
}
