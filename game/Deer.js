// Deer Class

function Deer(x, y, dir)
{
    Creature.call(this, x, y, dir, .0005, deerMesh, 2, 2);
};

Deer.prototype = Object.create(Creature.prototype);