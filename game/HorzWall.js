// Horizontal Wall Class

function HorzWall()
{
    this.normals = [
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,1,
            
            0,0,-1,
            0,0,-1,
            0,0,-1,
            0,0,-1,
            
            0,1,0,
            0,1,0,
            0,1,0,
            0,1,0
    ];
	this.texCoords = [
            WALL_WIDTH,0,
            1-WALL_WIDTH,0,
            1-WALL_WIDTH,1,
            WALL_WIDTH,1,
            
            WALL_WIDTH,0,
            1-WALL_WIDTH,0,
            1-WALL_WIDTH,1,
            WALL_WIDTH,1,
            
            WALL_WIDTH,0,
            1-WALL_WIDTH,0,
            1-WALL_WIDTH,1,
            WALL_WIDTH,1
    ];
    this.getVertices = function(x, y)
    {
        points = [
                x+WALL_WIDTH,0,WALL_WIDTH-y,
                1+x-WALL_WIDTH,0,WALL_WIDTH-y,
                x+WALL_WIDTH,0,-WALL_WIDTH-y,
                1+x-WALL_WIDTH,0,-WALL_WIDTH-y,
                x+WALL_WIDTH,WALL_HEIGHT,WALL_WIDTH-y,
                1+x-WALL_WIDTH,WALL_HEIGHT,WALL_WIDTH-y,
                x+WALL_WIDTH,WALL_HEIGHT,-WALL_WIDTH-y,
                1+x-WALL_WIDTH,WALL_HEIGHT,-WALL_WIDTH-y
        ];
        vertices = [
                points[0],points[1],points[2],
                points[3],points[4],points[5],
                points[15],points[16],points[17],
                points[12],points[13],points[14],
                
                points[9],points[10],points[11],
                points[6],points[7],points[8],
                points[18],points[19],points[20],
                points[21],points[22],points[23],
                
                points[12],points[13],points[14],
                points[15],points[16],points[17],
                points[21],points[22],points[23],
                points[18],points[19],points[20]
        ];
        return vertices;
    };
};