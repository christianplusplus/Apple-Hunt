// Vertical Wall Class

function VertWall()
{
    this.normals = [
            1,0,0,
            1,0,0,
            1,0,0,
            1,0,0,

            -1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
            
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
    /*
    this.indices = [
            0,1,2,
            2,3,0,
            4,5,6,
            6,7,4,
            8,9,10,
            10,11,8,
            12,13,14,
            14,15,12,
            16,17,18,
            18,19,16
    ];
    */
    this.getVertices = function(x, y)
    {
        points = [
                x-WALL_WIDTH,0,-WALL_WIDTH-y,
                x+WALL_WIDTH,0,-WALL_WIDTH-y,
                x-WALL_WIDTH,0,WALL_WIDTH-1-y,
                x+WALL_WIDTH,0,WALL_WIDTH-1-y,
                x-WALL_WIDTH,WALL_HEIGHT,-WALL_WIDTH-y,
                x+WALL_WIDTH,WALL_HEIGHT,-WALL_WIDTH-y,
                x-WALL_WIDTH,WALL_HEIGHT,WALL_WIDTH-1-y,
                x+WALL_WIDTH,WALL_HEIGHT,WALL_WIDTH-1-y
        ];
        vertices = [
                points[3],points[4],points[5],
                points[9],points[10],points[11],
                points[21],points[22],points[23],
                points[15],points[16],points[17],
                
                points[6],points[7],points[8],
                points[0],points[1],points[2],
                points[12],points[13],points[14],
                points[18],points[19],points[20],
                
                points[12],points[13],points[14],
                points[15],points[16],points[17],
                points[21],points[22],points[23],
                points[18],points[19],points[20]
        ];
        return vertices;
    };
};