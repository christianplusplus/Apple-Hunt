// Apple Class

function Apple(x, y, dir)
{
    Creature.call(this, x, y, dir, .001, appleMesh, 2, 4);
    
    this.attach = function(object)
    {
		if(!this.attached)
		{
			this.attached = true;
			this.attachedTo = object;
			appleMap[this.nextX][this.nextY] = false;

			applesHolding++;
			var string = '' + applesHolding;
			if(string.length < 2)
				string = '0' + string;
			document.getElementById('apples').innerHTML = string;
		}
    };
    
    this.score = function()
    {
        this.attached = false;
		var randomX, randomY;
        do
        {
            randomX = Math.floor(Math.random() * ARENA_SIZE);
            randomY = Math.floor(Math.random() * ARENA_SIZE);
        }while(appleMap[randomX][randomY]);
		appleMap[randomX][randomY] = true;
        this.prevX = this.nextX = randomX;
        this.prevY = this.nextY = randomY;
        this.prevDir = this.nextDir = 1;
		
		score++;
		var string = '' + score;
		if(string.length < 2)
			string = '0' + string;
		document.getElementById('score').innerHTML = string;
		
		applesHolding--;
		var string = '' + applesHolding;
		if(string.length < 2)
			string = '0' + string;
		document.getElementById('apples').innerHTML = string;
    };
};

Apple.prototype = Object.create(Creature.prototype);