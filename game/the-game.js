// the-game.js

/*
 *  Title: Apple Pursuit
 *	Authors: Christian Wendlandt and Tariq Anjum
 *	Version: 2019.5.13
 *	For CS371 with Professor Naps
 *	Features:
 *
 *  {ctrl-F: GGW} to search for where we have gee-golly-whiz features.
 *
 *  The game is played in discrete gridlike moves with (mostly) smooth motion.
 *	The player will "hit" a wall if they attempt to walk through it.
 *
 *	You play as the deer. 
 *  You can turn "for free", but when you move forward by one step, other creatures may also move.
 *	Gather apples and bring them to the blue lights to score points. (You can hold more than one!)
 *	Avoid monsters! They have unique behaviors.
 *	If they catch you, you lose; the game freezes and the screen fades to RED.
 *
 * 	The game contains 5 types of objects.
 *	Deer: The player.
 *		Is textured cylindrically and lengthwise.
 *		Behaves as a light source.
 *	Wolf: An antagonist that the player must avoid.
 *		Wanders randomly until it sees the player.
 *		If it loses the player, it will search the player's last known position and direction.
 *		Is RED when pursuing. Is YELLOW when searching. No special lighting when wandering. [GGW]
 *		Is textured cylindrically and lengthwise.
 *	Frog: An antagonist like the wolf. [GGW]
 *		The frog is lazy, but can often be more dangerous.
 *		When wandering, has only a 33% chance to move when the player does.
 *		If it sees the player, it will move 2 steps to catch them!
 *		Like the wolf, when the player is lost, the frog will search the player's last known position and direction.
 *		Is GREEN when pursuing. Is PURPLE when searching. No special lighting when wandering. [GGW]
 *		Is textured spherically. [GGW]
 *	Apple: These are placed randomly throughout the map.
 *		Stepping on one will attach it to the deer's mouth.
 *		Multiple can be carried at a time. This number is displayed under SCORE.
 *		Bring them to the blue lights to score points.
 *		Will respawn in a random position after being scored.
 *		Is textured spherically.
 *	Arena: The Arena is 10x10 SQUARE and can be easily remapped in the appropriate file.
 *		The walls and floors are all part of a single object, and are drawn from two seperate textures.
 *		To save on costs, the arena graphics buffers are always left enabled.
 *
 *	Lighting is Gouraud shading with distance factored in. [GGW]
 *		Expect to see ambient, diffuse, and specular effects.
 *		The range of lights can also be adjusted and is smoothed out by a hyperbolic tangent function. [GGW]
 *	Textures are loaded all at once in a single function, namely "loadTextures()".
 *		White pixels are used as place holders, which you might notice on startup. [GGW?]
 *			This allows the game to load right away and removes all those annoying webgl error messages.
 *		Creatures need only know which texture_flag produces the mapping they want
 *			and the index of the texture they are using from the "imageList" array.
 *		The code for the mapping is done in the shader.
 *	Camera two is also adjustable. This is mostly for testing, but you can use different camera [GGW]
 *		positions to verify texturing or whatnot. Hit the appropriate key to change the camera.
 *		1: First person, without "culling" the deer's head out of the frame.
 *		2: Default overhead camera.
 *		3: Up and at an angle from the wolf.
 *		4: Up and at an angle from the frog.
 *		5: Up and at an angle from the deer.
 *		6: Just a black screen; if you like a challenge.
 *		It's also easy to look at and modify the code in updateCamera() if you aren't getting the angle you want.
*/

const ARENA_SIZE = 10;
const WALL_WIDTH = 0.1;
const WALL_HEIGHT = 1;
const FULL_TIMER = 20;
const ABOVE_HEIGHT = 15;
const goalY = 4;
const goalX0 = 0;
const goalX1 = 9;
const numApples = 30;

var gl;
var canvas; 
var program;
var projectionMatrix;
var cameraViewMatrix;
var modelViewMatrix;
var projectionMatrixLoc;
var modelViewMatrixLoc;
var cameraViewMatrixLoc;
var normalRotationMatrixLoc;
var imageList = ["wall.png", "grass.png", "deer.png", "wolf.png", "apple.png", "frog.png"];
var secondCamera = 2;

var deer;
var wolf;
var frog;
var apples = [];
var appleMap = [];
var arena;
var dead;
var inControl;
var timer = 0;
var score = 0;
var applesHolding = 0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    //gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); //For debugging
    if(!gl){alert( "WebGL isn't available" );}
    gl.clearColor(.0, .0, .0, 1.0);//gl.clearColor(0.4, 0.8, 1.0, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    projectionMatrix = perspective(45.0, canvas.width/canvas.height/2, .01, 50.0);
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    cameraViewMatrixLoc = gl.getUniformLocation(program, "cameraViewMatrix");
    normalRotationMatrixLoc = gl.getUniformLocation(program, "normalRotationMatrix");
    gl.uniform1f(gl.getUniformLocation(program, "timer"), timer);
    gl.uniform1i(gl.getUniformLocation(program, 'pursuing'), 0);
	gl.uniform1i(gl.getUniformLocation(program, 'pursuingF'), 0);
    
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mat4()));
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
	
	loadTextures();
    
    arena = new Arena();
    arena.init();
    deer = new Deer(7,1,1);
    deer.init();
    wolf = new Wolf(4,4,0);
    wolf.init();
	frog = new Frog(5,4,0);
    frog.init();
	placeApples();
    
    render();
};

function render()
{
    if(!inControl)
    {
        if(timer == 0)
        {
            if(deer.nextX == wolf.nextX && deer.nextY == wolf.nextY ||
                    (deer.nextX == wolf.prevX && deer.nextY == wolf.prevY &&
                    deer.prevX == wolf.nextX && deer.prevY == wolf.nextY))
                dead = true;
			if(deer.nextX == frog.nextX && deer.nextY == frog.nextY ||
                    (deer.nextX == frog.prevX && deer.nextY == frog.prevY &&
                    deer.prevX == frog.nextX && deer.prevY == frog.nextY))
                dead = true;
            inControl = true;
            deer.hit = false;
            wolf.sense();
			frog.sense();
			apples.forEach(function(apple){
				if(apple.nextY == goalY && (apple.nextX == goalX0 || apple.nextX == goalX1))
					apple.score();
				if(apple.nextX == deer.nextX && apple.nextY == deer.nextY)
					apple.attach(deer);
			});
            
        }
        else
            timer--;
    }
    if(dead)
        timer--;
    else
    {
        deer.updateRealTimePos(timer);
        wolf.updateRealTimePos(timer);
		frog.updateRealTimePos(timer);
		apples.forEach(function(apple){apple.updateRealTimePos(timer);});
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(gl.getUniformLocation(program, 'timer'), timer);
	var p = deer.currPosition();
	gl.uniform3f(gl.getUniformLocation(program, 'deerLoc'), p[0], p[1], p[2]);
	p = wolf.currPosition();
	gl.uniform3f(gl.getUniformLocation(program, 'wolfLoc'),  p[0], p[1], p[2]);
	p = frog.currPosition();
	gl.uniform3f(gl.getUniformLocation(program, 'frogLoc'),  p[0], p[1], p[2]);

    gl.viewport(0, 0, canvas.width/2, canvas.height);
    updateCamera(1);
    arena.show();
    //deer.show();
    wolf.show();
	frog.show();
    apples.forEach(function(apple){apple.show();});
    
    gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
    updateCamera(secondCamera);
    arena.show();
    deer.show();
    wolf.show();
	frog.show();
    apples.forEach(function(apple){apple.show();});
    
    requestAnimFrame(render);
};

window.onkeydown = function(event){
    var key = String.fromCharCode(event.keyCode);
    if(!inControl || dead)
        return;
    switch(key)
    {
        case 'W':
            if(deer.canGoFoward())
				gameMove();
            else
            {
                deer.hit = true;
                apples.forEach(function(apple){apple.lockLastMove();});
				wolf.lockLastMove();
				frog.lockLastMove();
                timer = FULL_TIMER;
                inControl = false;
            }
        break;
        case 'A':
            deer.turnLeft();
            apples.forEach(function(apple){apple.lockLastMove();});
			wolf.lockLastMove();
			frog.lockLastMove();
            timer = FULL_TIMER;
            inControl = false;
        break;
        case 'D':
            deer.turnRight();
            apples.forEach(function(apple){apple.lockLastMove();});
			wolf.lockLastMove();
			frog.lockLastMove();
            timer = FULL_TIMER;
            inControl = false;
        break;
        case '1':
            secondCamera = 1;
            break;
        case '2':
            secondCamera = 2;
            break;
        case '3':
            secondCamera = 3;
            break;
        case '4':
            secondCamera = 4;
            break;
		case '5':
            secondCamera = 5;
            break;
		case '6':
            secondCamera = 6;
            break;
    }
};

function gameMove()
{
	deer.step();
	if(!(wolf.nextX == deer.nextX && wolf.nextY == deer.nextY))
	{
		if(wolf.sense())
			wolf.hunt();
		else
			wolf.wander();
	}
	if(!(frog.nextX == deer.nextX && frog.nextY == deer.nextY))
	{
		if(frog.sense())
		{
			var x = frog.nextX;
			var y = frog.nextY;
			frog.hunt();
			if(!(frog.nextX == deer.nextX && frog.nextY == deer.nextY))
				if(frog.sense())
				{
					frog.hunt();
					frog.prevX = x;
					frog.prevY = y;
				}
		}
		else
			frog.wander();
	}
	apples.forEach(function(apple){apple.lockLastMove();});
	timer = FULL_TIMER;
	inControl = false;
};

function updateCamera(num)
{
    var p;
    switch(num)
    {
        case 1:
            p = deer.currPosition();
            gl.uniform3f(gl.getUniformLocation(program, 'camPos'), p[0], p[1], p[2]);
            cameraViewMatrix = lookAt(p, deer.currFront(), vec3(0,1,0));
            break;
        case 2:
            p = deer.currAbove();
            gl.uniform3f(gl.getUniformLocation(program, 'camPos'), p[0], p[1], p[2]);
            cameraViewMatrix = lookAt(p, deer.currPosition(), vec3(0,0,-1));
            break;
        case 3:
            p = wolf.currPosition();
            gl.uniform3f(gl.getUniformLocation(program, 'camPos'), p[0], p[1], p[2]);
            cameraViewMatrix = lookAt(
                    vec3(p[0],p[1]+1,p[2]+1),
                    p,
                    vec3(0,1,0)
            );
            break;
		case 4:
			p = frog.currPosition();
			gl.uniform3f(gl.getUniformLocation(program, 'camPos'), p[0], p[1], p[2]);
			cameraViewMatrix = lookAt(
					vec3(p[0],p[1]+1,p[2]+1),
                    p,
					vec3(0,1,0)
			);
			break;
		case 5:
            p = deer.currPosition();
            gl.uniform3f(gl.getUniformLocation(program, 'camPos'), p[0], p[1], p[2]);
            cameraViewMatrix = lookAt(
                    vec3(p[0],p[1]+1,p[2]+1),
                    p,
                    vec3(0,1,0)
            );
            break;
		case 6:
            gl.uniform3f(gl.getUniformLocation(program, 'camPos'), 0, -1, 0);
            cameraViewMatrix = lookAt(
                    vec3(0,-1,0),
                    vec3(0,-2,0),
                    vec3(0,0,-1)
            );
            break;
    }
    gl.uniformMatrix4fv(cameraViewMatrixLoc, false, flatten(cameraViewMatrix));
};

function loadTextures()
{
    for(var i = 0; i < imageList.length; i++)
    {
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([255, 255, 255, 255]));
                
        var textureImage = new Image();
        textureImage.src = imageList[i];
        textureImage.textureIndex = i;
        textureImage.onload = function()
        {
            var texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + this.textureIndex);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        };
    }
};

function placeApples()
{
	for(var i = 0; i < ARENA_SIZE; i++)
	{
		appleMap.push([]);
		for(var j = 0; j < ARENA_SIZE; j++)
			appleMap[i].push(false);
	}
	appleMap[0][4] = true;
	appleMap[9][4] = true;
	appleMap[7][1] = true;
	for(var i = 0; i < numApples; i++)
	{
		var randomX, randomY;
		do
		{
			randomX = Math.floor(Math.random() * ARENA_SIZE);
			randomY = Math.floor(Math.random() * ARENA_SIZE);
		}while(appleMap[randomX][randomY]);
		appleMap[randomX][randomY] = true;
		var apple = new Apple(randomX,randomY,1);
		apple.init();
		apples.push(apple);
	}
	appleMap[7][1] = false;
};
