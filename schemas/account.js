NEWSCHEMA('Account', function(schema) {

	schema.setRead(function($) {
		var user = $.user;
		var data = {};
		data.uid = user.uid;
		data.id = user.id;
		data.name = user.name;
		data.sa = user.sa;
		data.permissions = user.permissions;
		data.namespace = user.namespace;
		data.roles = user.roles;
		data.language = user.language;
		data.df = user.df;
		data.tf = user.tf;
		data.nf = user.nf;
		$.callback(data);
	});

});