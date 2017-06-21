module.exports = () => {

	let world;

	class Tile {
		constructor(tiles){
			this.tiles=tiles;
		}
	}

	class Chunk {
		constructor(tiles){
			this.tiles=tiles;
		}
	}

	world.Tile = Tile;
	world.Chunk = Chunk;

	world.CHUNK_SIZE = 20;
	world.TILE_SIZE = 20;

	world.chunks;

	for(let i = -CHUNK_SIZE/2; i<CHUNK_SIZE/2; i++){
		for(let j = -CHUNK_SIZE/2; j<CHUNK_SIZE/2; j++){

		}
	}
	
	return world
}