// Frog Class

function Frog(x, y, dir)
{
    Creature.call(this, x, y, dir, .03, frogMesh, 3, 5);
    
    this.sense = function()
    {
        if(this.senseBlock(this.nextX, this.nextY, ARENA_SIZE))
        {
            this.knowsLastPos = true;
            this.knowsLastDir = true;
            this.lastPos = vec2(deer.nextX, deer.nextY);
            this.lastDir = deer.nextDir;
            gl.uniform1i(gl.getUniformLocation(program, 'pursuingF'), 1);
            return true;
        }
        gl.uniform1i(gl.getUniformLocation(program, 'pursuingF'), 0);
        if(this.knowsLastPos)
        {
            if(this.nextX == this.lastPos[0] && this.nextY == this.lastPos[1])
            {
                this.knowsLastPos = false;
            }
            gl.uniform1i(gl.getUniformLocation(program, 'huntingF'), 1);
            return true;
        }
        if(this.knowsLastDir)
        {
            if(this.nextDir == this.lastDir)
            {
                this.knowsLastDir = false;
                gl.uniform1i(gl.getUniformLocation(program, 'huntingF'), 0);
                return false;
            }
            gl.uniform1i(gl.getUniformLocation(program, 'huntingF'), 1);
            return true;
        }
        return false;
    };
    
    this.senseBlock = function(x, y, maxDepth)
    {
        if(maxDepth == 0)
            return false;
        if(deer.nextX == x && deer.nextY == y)
            return true;
        if(this.isBlocked(x, y, this.nextDir))
            return false;
        var pos = this.posAndDirToFront(vec2(x, y), this.nextDir);
        return this.senseBlock(pos[0], pos[1], maxDepth - 1);
    };
    
    this.hunt = function()
    {
        if(this.knowsLastPos)
            this.step();
        else if(this.knowsLastDir)
            this.stepInDir(this.lastDir);
    };
    this.wander = function()
    {
		if(Math.floor(Math.random()*3) != 0)
			return this.lockLastMove();
        var listOfMoves = [];
        if(this.canGoFoward())
            listOfMoves.push(this.nextDir);
        if(this.canGoLeft())
            listOfMoves.push(this.nextDir + 1);
        if(this.canGoRight())
            listOfMoves.push(this.nextDir - 1);
        
        if(listOfMoves.length > 0)
        {
            var chosenDir = listOfMoves[Math.floor(Math.random() * listOfMoves.length)];
            this.stepInDir(chosenDir);
        }
        else
            this.stepInDir(this.nextDir + 2);
    };
	
	this.updateMVM = function()
    {
        this.modelViewMatrix = scalem(this.modelScale*1.2, this.modelScale*1.2, this.modelScale);
        if(this.attached)
            this.modelViewMatrix = mult(translate(.27,.39,0), this.modelViewMatrix);
        this.modelViewMatrix = mult(this.normalRotationMatrix, this.modelViewMatrix);
        this.modelViewMatrix = mult(translate(this.realX, 0, -this.realY), this.modelViewMatrix);
    };
	
	this.updateNRM = function()
    {
        this.normalRotationMatrix = rotateY(this.realDirDeg + 90);
    };
};

Frog.prototype = Object.create(Creature.prototype);