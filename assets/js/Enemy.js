function Enemy( x, y ) {

	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;
	this.width = 12;
	this.height = 30;
	this.isDead = false;

	this.path = [];

	this.lastUpdate = 0;
	this.state = 0; //0=idle, 1=run right, 2=run up/down, 3=run left
	this.frame = 0;
	this.img = new Image();
	this.img.src = 'assets/images/sprite.png';

}

Enemy.prototype = {

	update : function( delta ) {

		if( this.isDead ) return;

		if( this.path.length ) {

			var dx = this.path[0].x - this.x,
				dy = this.path[0].y - this.y;

			//path node reached
			if( dx === 0 && dy === 0 ) {
				this.vx = 0;
				this.vy = 0;
				this.path.shift();
			}

			//(Abbruchbedingung) wenn der nächste Pfadknoten nicht mehr begehbar ist, 
			//bleibe auf der aktuellen Position
			if( this.path[0] && !this.path[0].isWalkable ) {
				this.path = [ getTileAt(this.x+tilesize/2, this.y+tilesize/2) ];
			}

			if( dx < 0 ) this.vx = -1;
			if( dx > 0 ) this.vx = 1;
			if( dy < 0 ) this.vy = -1;
			if( dy > 0 ) this.vy = 1;
		
		} else {

			//console.log('no path');

			this.vx = 0;
			this.vy = 0;
		}

		this.x += this.vx;
		this.y += this.vy;

		this.checkStates();
	},

	draw : function( ctx ) {

		if( this.isDead ) return;

		var	w = this.width,
			h = this.height,
			x = this.x,
			y = this.y;

		//frame update
		if((new Date() - this.lastUpdate) > (!this.state ? 750 : 200) ) {
			this.lastUpdate = new Date();
			this.frame = 1 - this.frame;
		}

		var showFrame = this.frame + (this.state*2);
		
		//draw character
		ctx.save();
		ctx.translate( x+(tilesize/2), y+(tilesize/2) );
		ctx.drawImage( this.img, showFrame*12, 30, 12, 29, -w/2, -h/2, w, h);
		ctx.restore();
	},

	checkStates: function() {

		if( this.vx > 0 ) this.state = 1;
		if( this.vx < 0 ) this.state = 3;
		if( this.vy !== 0 ) this.state = 2;
		if( !this.path.length ) this.state = 0;
	},

	checkPath: function() {

		//wenn auf dem zuvor berechneten Pfad ein Hindernis ist,
		//berechne keinen neuen Pfad (Abbruchbedingung oben)
		for(var i=0; i<this.path.length; i++) {
			if( !this.path[i].isWalkable ) return;
		}

		var startNode = getTileAt(this.x + (tilesize/2), this.y + (tilesize/2));
		var endNode = getTileAt(player.x, player.y);

		var astar = new Astar(startNode, endNode);
		this.path = astar.getPath();
	},

	checkTraps: function() {

		if( this.isDead ) return; //@REMOVE?!

		var	x = this.x + (tilesize/2),
			y = this.y + (tilesize/2),
			w = this.width/2,
			h = this.height/2;

		//console.log( getTileAt(x,y), getTileAt(x+tilesize, y+tilesize));

		if( !getTileAt(x-w,y-h).isWalkable || !getTileAt(x+w, y+h).isWalkable ) {
			this.isDead = true;

			aa.play('kill');
		}
	}
};