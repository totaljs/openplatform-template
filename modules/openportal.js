const EXPIRITY = 1000 * 60 * 2; // 2 minutes

exports.version = 1;
exports.sessions = {};
exports.install = function() {
	FILE('/openportal.json', openportal);
};

exports.verify = function(token, callback) {
	RESTBuilder.GET(token).header('x-token', token.md5(CONF.reqtoken)).keepalive().callback(function(err, response, output) {
		if (output.status === 200 && output.headers['x-token'] === CONF.restoken) {
			response.syncusers = syncusers;
			response.expire = Date.now() + EXPIRITY; // 2 minutes
			callback(response);
		} else
			callback();
	});
};

function openportal(req, res) {

	var meta = {};

	meta.name = CONF.name;
	meta.author = CONF.author;
	meta.version = CONF.version;
	meta.url = req.hostname('/');
	meta.color = CONF.color;
	meta.icon = CONF.icon;
	meta.description = CONF.description;
	meta.reqtoken = CONF.reqtoken ? CONF.reqtoken.crc32(true).toString(36) : '';
	meta.restoken = CONF.restoken ? CONF.restoken.crc32(true).toString(36) : '';
	meta.newtab = CONF.newtab == true;
	meta.permissions = [];

	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (item.permissions) {
			for (var permission of item.permissions)
				meta.permissions.push(permission);
		}
	}

	res.json(meta);
}

function syncusers(filter, callback) {

	if (typeof(filter) === 'function') {
		callback = filter;
		filter = null;
	}

	var url = filter ? QUERIFY(this.users, filter) : this.users;
	RESTBuilder.GET(url).header('x-token', url.md5(CONF.reqtoken)).keepalive().callback(function(err, response, output) {
		if (output.status === 200 && output.headers['x-token'] === CONF.restoken)
			callback(response);
		else
			callback();
	});
}

AUTH(function($) {

	var verify = $.query.openportal || $.headers.authorization || $.cookie('openportal');

	if (verify && verify.substring(0, 7) === 'base64 ') {
		try {
			verify = Buffer.from(verify.substring(7), 'base64').toString('utf8').split(',');
		} catch (e) {
			$.invalid();
			return;
		}
	}

	if (!verify || verify.length < 20) {
		$.invalid();
		return;
	}

	var id = HASH(verify).toString(36);
	var session = exports.sessions[id];

	if (session) {
		session.init = false;
		$.success(session);
		return;
	}

	exports.verify(verify, function(profile) {
		if (profile) {
			profile.init = true;
			exports.sessions[id] = profile;
			F.$events.user_create && EMIT('user_create', profile);
			$.success(profile);
		} else
			$.invalid();
	});

});

// Session cleaner
ON('service', function() {
	var sessions = exports.sessions;
	for (var key in sessions) {
		if (sessions[key].expire <= NOW) {
			F.$events.user_expire && EMIT('user_expire', sessions[key]);
			delete sessions[key];
		}
	}
});

global.UNAUTHORIZED = function($, permission) {
	var namespace = $.user.namespace;
	if (!namespace || (!$.user.sa && !$.user.permissions.includes(permission))) {
		$.invalid(401);
		return true;
	}
};