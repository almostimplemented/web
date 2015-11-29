var mandelbrotBaseCorners = [
    [ 0.8,  1.1],
    [-2.2,  1.1],
    [ 0.8, -1.1],
    [-2.2, -1.1],
];
var juliaBaseCorners = [
    [ 1.5,  1.1],
    [-1.5,  1.1],
    [ 1.5, -1.1],
    [-1.5, -1.1],
];
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var cx = -0.8;
var cy = 0.156;
var blip = 0;

function handleMouseDown(canvas, event) {
    if (event.x < canvas.width/2) { return; }
    mouseDown = true;
    lastMouseX = event.x - canvas.width/2;
    lastMouseY = event.y;
    cx = (6/canvas.width)*(lastMouseX - canvas.width/2 * (2.2/3));
    cy = (2.2/canvas.height)*(canvas.height * 0.5 - lastMouseY);
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(canvas, event) {
    if (!mouseDown) {
        return;
    }
    lastMouseX = event.x - canvas.width/2;
    lastMouseY = event.y;
    cx = (6/canvas.width)*(lastMouseX - canvas.width/2 * (2.2/3));
    cy = (2.2/canvas.height)*(canvas.height * 0.5 - lastMouseY);
}
function initWebGL(canvas) {
    var gl;
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        var msg = "Error creating WebGL context!: " + e.toString();
        alert(msg);
        throw Error(msg);
    }
    return gl;
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

function initMandelbrotShaders(gl) {
    var fragmentShader = getShader(gl, "mandelbrot-shader-fs");
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

    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mouse_x"), cx);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mouse_y"), cy);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "blip"), blip);
}

function initJuliaShaders(gl) {
    var fragmentShader = getShader(gl, "julia-shader-fs");
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

    gl.uniform1f(gl.getUniformLocation(shaderProgram, "cx"), cx);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "cy"), cy);
}

var centerOffsetX = 0;
var centerOffsetY = 0;
var canX, canY = 0;
var zoom = 1;
var zoomCenterX;
var zoomCenterY;

var vertexPositionBuffer;
function initBuffers(gl) {
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

function drawInViewport(gl, drawFunction, x, y, width, height) {
    gl.viewport(x, y, width, height);
    gl.scissor(x, y, width, height);
    gl.enable(gl.SCISSOR_TEST);
    //gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawFunction();
}

function draw(gl, baseCorners) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    var plotPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
    var cornerIx;
    corners = [];
    for (cornerIx in baseCorners) {
        x = baseCorners[cornerIx][0];
        y = baseCorners[cornerIx][1];
        corners.push(x + centerOffsetX);
        corners.push(y + centerOffsetY);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPlotPosition, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.deleteBuffer(plotPositionBuffer);
}


function resetZoom() {
    zoom = 1.0;
    zoomCenterX = 0.28693186889504513;
    zoomCenterY = 0.014286693904085048;
}

function drawScene(gl, canvas) {
    initJuliaShaders(gl);
    drawInViewport(gl, function() { draw(gl, juliaBaseCorners); }, 0, 0, canvas.width/2, canvas.height);
    initMandelbrotShaders(gl);
    drawInViewport(gl, function() { draw(gl, mandelbrotBaseCorners); }, canvas.width/2, 0, canvas.width/2, canvas.height);
}
     

var first;
function onLoad() {
    var canvas = document.getElementById("webglcanvas");
    if (window.innerWidth < 1200) {
        canvas.width = 600;
        canvas.height = 220;
    }
    canvas.onmousedown = function(event) { handleMouseDown(canvas, event);};
    document.onmouseup = handleMouseUp;
    document.onmousemove = function(event) { handleMouseMove(canvas, event);};
    var gl = initWebGL(canvas);
    initBuffers(gl);
    first = true;
    tick(gl, canvas);
}

function tick(gl, canvas) {
    //if (first || mouseDown) {
        drawScene(gl, canvas);
    //}
    if (!mouseDown) {
        if (blip > 3.0) {
            blip = 0.0;
        } else {
            blip += 0.1;
        }
    } else {
        blip = 1.0;
    }
    requestAnimationFrame(function() { tick(gl, canvas); });
}
