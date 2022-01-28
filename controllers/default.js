exports.install = function() {
	ROUTE('+GET /*', index);
};

function index() {

	var self = this;
	var plugins = [];

	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (self.user.sa || !item.visible || item.visible(self.user)) {
			var obj = {};
			obj.id = item.id;
			obj.name = TRANSLATOR(self.user.language || '', item.name);
			obj.icon = item.icon;
			obj.position = item.position;
			obj.import = item.import;
			plugins.push(obj);
		}
	}

	self.view('index', plugins);
}