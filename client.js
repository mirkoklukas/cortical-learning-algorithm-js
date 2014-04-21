var Stage = function (containerId) {
	var container = window.document.getElementById(containerId);
	var canvas = window.document.createElement("canvas");
	container.appendChild(canvas);
	canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
	var ctx = canvas.getContext('2d');

	this.resize = function () {
		canvas.width = container.offsetWidth;
    	canvas.height = container.offsetHeight;
	};

    this.pixel = function(position) {
	    ctx.fillStyle = '#ffffff';
	    ctx.fillRect(position[0], position[1], 1, 1);
	};
	
	this.rect = function(position, size, color) {
	    ctx.fillStyle = color;
	    ctx.fillRect(position[0], position[1], size[0], size[1]);
	};

	this.path = function(vertices, w, color) {
		if(vertices.length > 0) {

			// todo: if we have a constant path, 
			// i.e. the vertices are all equal, nothing is printed

			ctx.beginPath();
			ctx.lineWidth = w;
			ctx.strokeStyle= color;
			ctx.moveTo(vertices[0][0],vertices[0][1]);

			for(var i = 1, max = vertices.length; i < max; i++) {
				ctx.lineTo(vertices[i][0],vertices[i][1]);
			}

			ctx.stroke(); 
		}
	};

	this.clear = function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};

};