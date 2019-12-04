// Arena class

function Arena(){
    this.vmap =
    [
		    //0,1,2,3,4,5,6,7,8,9,1 
        /*0*/[1,0,0,1,0,1,0,1,0,0,1],
        /*1*/[1,0,0,0,0,0,0,0,0,0,1],
        /*2*/[1,0,1,1,0,1,0,1,1,0,1],
        /*3*/[1,0,0,1,0,0,0,1,0,0,1],
        /*4*/[1,0,0,0,1,0,1,0,0,0,1],
        /*5*/[1,0,0,1,0,0,0,1,0,0,1],
        /*6*/[1,0,1,0,0,1,0,0,1,0,1],
        /*7*/[1,0,1,0,1,0,1,0,1,0,1],
        /*8*/[1,0,0,1,0,1,0,1,0,0,1],
        /*9*/[1,0,0,0,0,0,0,0,0,0,1],
        /*1*/[0,0,0,0,0,0,0,0,0,0,0]
		    //0,1,2,3,4,5,6,7,8,9,1 	

    ];
    this.hmap =
    [
		    //0,1,2,3,4,5,6,7,8,9,1 
        /*0*/[1,1,1,1,1,1,1,1,1,1,0],
        /*1*/[0,1,0,1,0,0,1,0,1,0,0],
        /*2*/[0,1,0,0,1,1,0,0,1,0,0],
        /*3*/[0,1,0,1,0,0,1,0,1,0,0],
        /*4*/[1,1,0,0,1,0,0,0,1,1,0],
        /*5*/[1,1,0,0,1,0,0,0,1,1,0],
        /*6*/[1,0,0,0,1,1,0,0,0,1,0],
        /*7*/[0,1,1,0,0,0,0,1,1,0,0],
        /*8*/[1,0,0,0,1,1,0,0,0,1,0],
        /*9*/[0,1,1,1,0,0,1,1,1,0,0],
        /*1*/[1,1,1,1,1,1,1,1,1,1,0]
		    //0,1,2,3,4,5,6,7,8,9,1 

    ];

    this.init = function()
    {
        this.modelViewMatrix = mat4();
        var pillar = new Pillar();
        var horzWall = new HorzWall();
        var vertWall = new VertWall();
        var floor = new Floor();

        vertices = [];
        normals = [];
        tCoords = [];
        vertices = vertices.concat(floor.getVertices());
        normals = normals.concat(floor.normals);
        tCoords = tCoords.concat(floor.texCoords);
        for(var i = 0; i <= ARENA_SIZE; i++)
        {
            for(var j = 0; j <= ARENA_SIZE; j++)
            {
                vertices = vertices.concat(pillar.getVertices(i, j));
                normals = normals.concat(pillar.normals);
                tCoords = tCoords.concat(pillar.texCoords);
                if(this.hmap[j][i] == 1)
                {
                    vertices = vertices.concat(horzWall.getVertices(i, j));
                    normals = normals.concat(horzWall.normals);
                    tCoords = tCoords.concat(horzWall.texCoords);
                }
                if(this.vmap[j][i] == 1)
                {
                    vertices = vertices.concat(vertWall.getVertices(i, j));
                    normals = normals.concat(vertWall.normals);
                    tCoords = tCoords.concat(vertWall.texCoords);
                }
            }
        }

        //load vBuffer
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vPosition = gl.getAttribLocation(program, "vPosition");

        //load nBuffer
        this.nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        this.vNormal = gl.getAttribLocation(program, "vNormal");

        //load tBuffer
        this.tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tCoords), gl.STATIC_DRAW);
        this.vTexCoord = gl.getAttribLocation(program, "vTexCoord");

        this.numFloorVerts = floor.getNumVertices();
        this.numVertices = vertices.length;
    };

    this.show = function()
    {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(this.modelViewMatrix));
        gl.uniformMatrix4fv(normalRotationMatrixLoc, false, flatten(mat4()));

        gl.uniform1i(gl.getUniformLocation(program, "texture_flag"), 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);

        gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);
        for(var index = 0; index < this.numFloorVerts / 3; index += 4)
            gl.drawArrays(gl.TRIANGLE_FAN, index, 4);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
		for(var index = this.numFloorVerts / 3; index < this.numVertices / 3; index += 4)
            gl.drawArrays(gl.TRIANGLE_FAN, index, 4);

        gl.disableVertexAttribArray(this.vPosition);
        gl.disableVertexAttribArray(this.vNormal);
        gl.disableVertexAttribArray(this.vTexCoord);
    };

};

//////////////////////////  End Arena object /////////////////////////////////
