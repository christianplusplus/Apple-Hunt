// Floor Class

function Floor()
{
    const res = 50;//texture resolution
    const buff = 6;//buffer space around arena
    this.normals = [];
    for(var i = 0; i < res * res * 4; i++)
    {
        this.normals.push(0);
        this.normals.push(1);
        this.normals.push(0);
    }
	this.texCoords = [];
    for(var i = 0; i < res * res; i++)
    {
        this.texCoords.push(0);
        this.texCoords.push(0);
        this.texCoords.push(1);
        this.texCoords.push(0);
        this.texCoords.push(1);
        this.texCoords.push(1);
        this.texCoords.push(0);
        this.texCoords.push(1);
    }
    this.getVertices = function()
    {
        vertices = [];
        var sideLen = (ARENA_SIZE + 2 * buff) / res;
        for(var i = 0; i < res; i++)
        {
            for(var j = 0; j < res; j++)
            {
                vertices.push(-buff + i * sideLen);
                vertices.push(0);
                vertices.push(buff - j * sideLen);
                
                vertices.push(-buff + sideLen + i * sideLen);
                vertices.push(0);
                vertices.push(buff - j * sideLen);
                
                vertices.push(-buff + sideLen + i * sideLen);
                vertices.push(0);
                vertices.push(buff - sideLen - j * sideLen);
                
                vertices.push(-buff + i * sideLen);
                vertices.push(0);
                vertices.push(buff - sideLen - j * sideLen);
            }
        }
        return vertices;
    };
    this.getNumVertices = function()
    {
        return res * res * 12;
    };
};