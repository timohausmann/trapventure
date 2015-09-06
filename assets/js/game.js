var game = game || {};


	var	canvas = $('#game'),
		ctx = canvas.getContext('2d'),
		lastUpdate = new Date(),
		aa = new ArcadeAudio(),
		player,
		tilesize = 40,
		maps = [
			[
				[4,1,1,2,1,1,3,1,1,5]
			],
			[
				[4,1,1,1,2,2,1,6,1,5]
			],
			[
				[0,6,3,1,1,1,1,1,3,6,0],
				[0,0,0,1,0,0,0,1,0,0,0],
				[4,1,2,1,0,0,0,1,1,1,5],
			],
			[
				[0,0,0,1,1,6,1,1,0,0,0],
				[0,0,0,3,0,0,0,2,0,0,0],
				[0,0,0,6,0,0,0,6,0,0,0],
				[0,0,0,1,0,0,0,1,0,0,0],
				[4,1,1,2,2,3,2,2,1,1,5]
			],
			[
				[0,0,6,0,6,0,6,0,0],
				[0,0,3,0,1,0,3,0,0],
				[4,1,1,2,1,1,1,1,5],
				[0,0,3,0,1,0,3,0,0],
				[0,0,6,0,6,0,6,0,0]
			],
			[
				[0,0,1,1,1,1,1,0,0],
				[0,0,1,0,0,0,1,0,0],
				[4,1,2,0,0,0,6,1,5],
				[0,0,1,0,0,0,1,0,0],
				[0,0,1,1,1,1,1,0,0]
			],
			[
				[0,0,0,6,0,0,0,0,0,0,0,0,0],
				[0,0,0,2,1,1,1,3,6,6,0,0,0],
				[0,0,0,1,0,0,0,1,0,0,0,0,0],
				[0,0,0,1,0,6,2,1,1,2,1,6,5],
				[0,0,0,3,0,0,0,0,0,0,0,0,0],
				[0,0,0,3,0,0,0,0,0,0,0,0,0],
				[6,1,4,1,2,2,2,6,6,6,0,0,0]
			]
		],
		map,
		enemies = [],
		tiles = [],
		world = [],
		animFrame,
		endReached = false;


	game.init = function() {

		aa.add('traps', 10,
		  [
		    [1,0.0592,0.0217,0.0742,0.49,0.8641,,-0.56,0.0873,0.0726,0.5921,-0.1226,0.4539,0.0532,0.6772,0.3002,0.6834,-0.7991,0.836,-0.0011,0.9134,0.1809,0.3207,0.56]
		  ]
		);

		aa.add('death', 2,
		  [
		    [0,0.3391,0.01,0.5415,0.5428,0.2102,,,-0.095,,0.3503,0.5185,,-0.1944,-0.8553,0.5259,0.2493,0.2691,0.8178,0.0824,0.7013,0.1288,-0.0006,0.5]
		  ]
		);

		aa.add('kill', 10,
		  [
		    [1,,0.0835,,0.38,0.3928,,-0.26,,,,,,,,,,,1,,,0.0116,,0.5]
		  ]
		);

		aa.add('exit', 2, 
			[
			  [0,,0.0891,0.5663,0.3068,0.8345,,,,,,0.5995,0.5384,,,,,,1,,,,,0.56]
			]
		);

		document.addEventListener('keydown', function(e) {

			var x = player.vx,
				y = player.vy;

			if( e.which === 65 ) x = -1; //a
			if( e.which === 68 ) x = 1; //d
			if( e.which === 87 ) y = -1; //w
			if( e.which === 83 ) y = 1; //s
			if( e.which === 32 ) toggleTraps();

			player.move(x, y);
		});

		document.addEventListener('keyup', function(e) {

			var x = y = false;
			if( e.which === 65 || e.which === 68) x = true;
			if( e.which === 87 || e.which === 83) y = true;

			player.stop(x, y);
		});

		setInterval(function() {

			for(var i=0;i<enemies.length;i=i+1) {
				enemies[i].checkPath();
			}
		}, 1000);

		loadMap();
	};


	function loadMap() {

		map = maps[0]; //because we shift maps on finish
		enemies = [];
		tiles = [];
		world = [];

		//build world
		for(var y=0; y<map.length; y++) {

			tiles[y] = [];
			for(var x=0; x<map[0].length; x++) {

				if( map[y][x] === 4 ) {
					player = new Player(x*tilesize, y*tilesize);
					tiles[y][x] = new Tile(x*tilesize, y*tilesize, 1);
					world.push( tiles[y][x] );
				} else if( map[y][x] === 6 ) {
					var enemy = new Enemy(x*tilesize, y*tilesize);
					enemies.push( enemy );
					tiles[y][x] = new Tile(x*tilesize, y*tilesize, 1);
					world.push( tiles[y][x] );
				} else {
					tiles[y][x] = new Tile(x*tilesize, y*tilesize, map[y][x]);
					world.push( tiles[y][x] );
				}
			}
		}

		for(var i=0;i<enemies.length;i=i+1) {
			world.push( enemies[i] );
		}

		world.push( player );

		if( !animFrame ) {
			console.log('request first loop');
			animFrame = requestAnimationFrame( loop );
		}

	}

	function toggleTraps() {

		for(var i=0;i<world.length;i=i+1) {
			if( world[i] instanceof Tile ) world[i].toggle();
			if( world[i] instanceof Enemy ) world[i].checkTraps();
		}

		for(var i=0;i<enemies.length;i=i+1) {
			enemies[i].checkPath();
		}

		aa.play('traps');

		player.checkTraps();
	}

	function getTileAt(x,y) {

		var x = Math.floor(x/tilesize),
	    	y = Math.floor(y/tilesize);

	    if( tiles[y] && tiles[y][x]) {
	    	return tiles[y][x];
	    } else {
	    	return {
	    		isWalkable: false
	    	};
	    }
	}


	function loop() {

		//ugly fix
		if( endReached ) {
			aa.play('exit');
			maps.shift();
			loadMap();
			endReached = false;
		}

		var thisUpdate = new Date(),
			delta = (thisUpdate - lastUpdate) / 1000,
			amount = world.length;

		ctx.clearRect(0,0,canvas.width, canvas.height);
        var offx = map[0].length*tilesize/2,
        	offy = map.length*tilesize/2;
        ctx.save();
        ctx.translate(320-offx,240-offy);

		for(var i=0;i<amount;i=i+1) {

			if( !world[ i ]  ) console.log(world);

			world[ i ].update( delta );
			world[ i ].draw( ctx );
		}

		ctx.restore();

		lastUpdate = thisUpdate;

		animFrame = requestAnimationFrame( loop );
	}


	function $( elem ) {
		return document.querySelector( elem );
	}