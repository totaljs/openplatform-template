function client_close(client) {
	client.close(4001);
}

ON('service', function(counter) {
	// Verifies all online sessions
	if (MAIN.ws && MAIN.ws.keys && counter % 2 === 0) {
		MAIN.ws.keys.wait(function(key, next) {
			var client = MAIN.ws.connections[key];
			if (client && client.user.expire < NOW) {
				MODULE('openplatform').verify(client.req.query.openplatform, async function(profile) {
					if (profile) {
						client.user = profile;
						client.send({ TYPE: 'account', data: await EXEC('-Account --> read', null, null, client) });
					} else {
						client.send({ TYPE: 'logout' });
						setTimeout(client_close, 2000, client);
					}
					next();
				});
			} else
				next();
		});
	}

});
