// Creature Class

function Creature(x, y, dir, modelScale, mesh, textureType, activeTexture)
{
    this.modelScale = modelScale;
    this.mesh = mesh;
    this.textureType = textureType;
    this.activeTexture = activeTexture;
    this.prevX = x;
    this.prevY = y;
    this.prevDir = dir;
    this.nextX = x;
    this.nextY = y;
    this.nextDir = dir;
    this.knowsLastPos = false;
    this.knowsLastDir = false;
    this.attached = false;
    
    this.init = function()
    {
        this.setFront();
        this.modelViewMatrix = scalem(this.modelScale, this.modelScale, this.modelScale);
        
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertices[0].values), gl.STATIC_DRAW);
        this.vPosition = gl.getAttribLocation(program, "vPosition");
        
        this.nBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertices[1].values), gl.STATIC_DRAW );
        this.vNormal = gl.getAttribLocation(program, "vNormal");

        this.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mesh.connectivity[0].indices), gl.STATIC_DRAW);
    };
    
    this.updateRealTimePos = function(timer)
    {
        var t = (FULL_TIMER - timer) / FULL_TIMER;
        if(this.attached)
        {
            this.realDirDeg = this.attachedTo.realDirDeg;
            this.realDirRad = this.attachedTo.realDirRad;
            this.realX = this.attachedTo.realX;
            this.realY = this.attachedTo.realY;
        }
        else if(this.hit)
        {
            var u = -(t-.5)*(t-.5)+.25
            this.realX = this.nextX * (1 - u) + this.frontX * u + .5;
            this.realY = this.nextY * (1 - u) + this.frontY * u + .5;
        }
        else
        {
            var u = 3*t*t-2*t*t*t;
            this.realX = this.prevX * (1 - u) + this.nextX * u + .5;
            this.realY = this.prevY * (1 - u) + this.nextY * u + .5;
            
            u = Math.sin(t * Math.PI / 2);
            u = this.prevDir * (1 - u) + this.nextDir * u;
            this.realDirDeg = u * 90;
            this.realDirRad = u * Math.PI / 2;
        }
    };
    
    this.currPosition = function()
    {
        return vec3(this.realX, WALL_HEIGHT / 2, -this.realY);
    };
    
    this.currAbove = function()
    {
        return vec3(this.realX, ABOVE_HEIGHT, -this.realY);
    };
    
    this.currFront = function()
    {
        return vec3(
                this.nextX + .5 + Math.cos(this.realDirRad),
                WALL_HEIGHT / 2,
                -this.nextY - .5 - Math.sin(this.realDirRad)
        );
    };
    
    this.step = function()
    {
        this.lockLastMove();
        this.nextX = this.frontX;
        this.nextY = this.frontY;
        this.frontX += this.frontX - this.prevX;
        this.frontY += this.frontY - this.prevY;
    };
    
    this.turnRight = function()
    {
        this.lockLastMove();
        this.nextDir = this.nextDir - 1;
        this.setFront();
    };
    
    this.turnLeft = function()
    {
        this.lockLastMove();
        this.nextDir = this.nextDir + 1;
        this.setFront();
    };
    
    this.stepInDir = function(dir)
    {
        this.nextDir = dir;
        this.setFront();
        this.step();
    };
    
    this.canGoFoward = function()
    {return this.canGoDir(this.nextDir);};
    this.canGoLeft = function()
    {return this.canGoDir(this.nextDir + 1);};
    this.canGoRight = function()
    {return this.canGoDir(this.nextDir - 1);};
    this.canGoDir = function(dir)
    {
        var dir = ((dir % 4) + 4) % 4;
        switch(dir)
        {
            case 0:
                return this.canGoEast();
                break;
            case 1:
                return this.canGoNorth();
                break;
            case 2:
                return this.canGoWest();
                break;
            case 3:
                return this.canGoSouth();
        }
    };
    this.canGoNorth = function()
    {return !this.isBlocked(this.nextX, this.nextY, 1);};
    this.canGoWest = function()
    {return !this.isBlocked(this.nextX, this.nextY, 2);};
    this.canGoEast = function()
    {return !this.isBlocked(this.nextX, this.nextY, 0);};
    this.canGoSouth = function()
    {return !this.isBlocked(this.nextX, this.nextY, 3);};
    this.isBlocked = function(x, y, dir)
    {
        var dir = ((dir % 4) + 4) % 4;
        switch(dir)
        {
            case 0:
                return arena.vmap[y][x + 1] == 1;
                break;
            case 1:
                return arena.hmap[y + 1][x] == 1;
                break;
            case 2:
                return arena.vmap[y][x] == 1;
                break;
            case 3:
                return arena.hmap[y][x] == 1;
                break;
        }
    };
    
    this.posAndDirToFront = function(pos, dir)
    {
        var x, y;
        switch(((dir % 4) + 4) % 4)
        {
            case 0:
                x = pos[0] + 1;
                y = pos[1];
                break;
            case 1:
                x = pos[0];
                y = pos[1] + 1;
                break;
            case 2:
                x = pos[0] - 1;
                y = pos[1];
                break;
            case 3:
                x = pos[0];
                y = pos[1] - 1;
        }
        return [x, y];
    };
    
    this.dirToFront = function(dir)
    {
        var x, y;
        switch(((dir % 4) + 4) % 4)
        {
            case 0:
                x = this.nextX + 1;
                y = this.nextY;
                break;
            case 1:
                x = this.nextX;
                y = this.nextY + 1;
                break;
            case 2:
                x = this.nextX - 1;
                y = this.nextY;
                break;
            case 3:
                x = this.nextX;
                y = this.nextY - 1;
        }
        return [x, y];
    };
    
    this.setFront = function()
    {
        var frontxy = this.dirToFront(this.nextDir);
        this.frontX = frontxy[0];
        this.frontY = frontxy[1];
    };
    
    this.lockLastMove = function()
    {
        if(this.attached)
        {
            this.nextDir = this.attachedTo.nextDir;
            this.nextX = this.attachedTo.nextX;
            this.nextY = this.attachedTo.nextY;
        }
        this.prevDir = this.nextDir;
        this.prevX = this.nextX;
        this.prevY = this.nextY;
    };
    
    this.updateMVM = function()
    {
        this.modelViewMatrix = scalem(this.modelScale, this.modelScale, this.modelScale);
        if(this.attached)
            this.modelViewMatrix = mult(translate(.27,.39,0), this.modelViewMatrix);
        this.modelViewMatrix = mult(this.normalRotationMatrix, this.modelViewMatrix);
        this.modelViewMatrix = mult(translate(this.realX, 0, -this.realY), this.modelViewMatrix);
    };
    
    this.updateNRM = function()
    {
        this.normalRotationMatrix = rotateY(this.realDirDeg);
    };
    
    this.show = function()
    {
        this.updateNRM();
        this.updateMVM();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(this.modelViewMatrix));
        gl.uniformMatrix4fv(normalRotationMatrixLoc, false, flatten(this.normalRotationMatrix));
        
        gl.uniform1i(gl.getUniformLocation(program, "texture_flag"), this.textureType);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);
        
        gl.uniform1i(gl.getUniformLocation(program, "texture"), this.activeTexture);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.drawElements(gl.TRIANGLES, this.mesh.connectivity[0].indices.length, gl.UNSIGNED_SHORT, 0);
        
        gl.disableVertexAttribArray(this.vPosition);
        gl.disableVertexAttribArray(this.vNormal);
    };
};