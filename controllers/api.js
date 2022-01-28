exports.install = function() {
	ROUTE('+API       @api    -account    *Account   --> read');
	ROUTE('+SOCKET /', socket, 1024 * 3); // 3 MB
};

function socket() {
	var self = this;
	MAIN.ws = self;
	self.api('api');
	self.autodestroy(() => MAIN.ws = null);
}