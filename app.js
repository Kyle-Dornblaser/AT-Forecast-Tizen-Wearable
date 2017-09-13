(function () {
	window.addEventListener('tizenhwkey', function (ev) {
		var activePopup = null,
			page = null,
			pageid = '';

		if (ev.keyName === 'back') {
			activePopup = document.querySelector('.ui-popup-active');
			page = document.getElementsByClassName('ui-page-active')[0];
			pageid = page ? page.id : '';

			if (pageid === 'main' && !activePopup) {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	});
	
	var app = {};
	
	var API_KEY_PARAM = 'api_key=' + appConfig.atForecastKey;
	var BASE_URL = 'https://dev.atforecast.com';
	
	app.StatesView = Backbone.View.extend({
		el: '#states',
		events: {
			'click li': 'openShelters'
		},
		openShelters: function(e) {
			e.preventDefault();
			var id = $(e.currentTarget).data('id');
			var state = this.model.get('list')[parseInt(id) - 1];

			var shelters = new app.Shelters();
			shelters.add(state.shelters);
			var sheltersView = new app.SheltersView({collection: shelters});
			tau.changePage('#shelters-page');
		},
		template: _.template('<li data-id="<%= state_id %>"><%= name %></li>'),
		initialize: function() {
			this.render();
			_.bindAll(this, 'render');
		    this.model.bind('change', this.render);
		},
		render: function() {
			console.log('render');
			var html = '';
			var states = this.model.get('list') || [];
			for (var i = 0; i < states.length; i++) {
				html += this.template(states[i]);
			}
			this.$el.html(html);
			
		}
	});
	
	app.States = Backbone.Model.extend({
		url: BASE_URL + '/index.json?include_shelters=true&' + API_KEY_PARAM,
		parse: function(data) {
			this.set('list', data);
		}
	});
	
	app.Shelter = Backbone.Model.extend({
		initialize: function(id){
			this.id = id;
			this.url = BASE_URL + '/shelters/' + this.id +'.json?' + API_KEY_PARAM;
		},   
		parse: function(data) {
			if (data.length === 1) {
				return data[0];
			}
		}
	});
	
	app.ShelterView = Backbone.View.extend({
		el: '#shelter',
		template: _.template('<h3><%= name %></h3>' +
				'				<div><%= elevation %></div>'),
		initialize: function() {
			this.render();
			_.bindAll(this, 'render');
		    this.model.bind('change', this.render);
		},
		render: function() {
			this.$el.html(this.template({name: this.model.get('name'), elevation: this.model.get('elevation')}));
		}

	});
	
	app.Shelters = Backbone.Collection.extend({

	});
	
	app.SheltersView = Backbone.View.extend({
		el: '#shelters',
		events: {
			'click li': 'openShelter'
		},
		openShelter: function(e) {
			e.preventDefault();
			var id = $(e.currentTarget).data('id');
			
			var shelter = new app.Shelter(id);
			var shelterView = new app.ShelterView({model: shelter});
			shelter.fetch();
			
			tau.changePage('#shelter-page');
		},
		template: _.template('<li data-id="<%= shelter_id %>"><%= name %></li>'),
		initialize: function() {
			this.render();
			_.bindAll(this, 'render');
		    this.collection.bind('change', this.render);
		},
		render: function() {
			var html = '';
			var ctx = this;
			this.collection.each(function(shelter) {
				html += ctx.template(shelter.toJSON());
				console.log(shelter);
			});
			this.$el.html(html);
		}
	});
	
	var states = new app.States();
	var statesView = new app.StatesView({model: states});
		
	states.fetch();
	
	document.addEventListener('rotarydetent', function(ev) {
		var direction = ev.detail.direction;
		var scroller = $('.ui-page-active .ui-scroller');
		var y = scroller.scrollTop();
		var step = 50;
		
		if (direction === 'CW') {
			scroller.scrollTop(y+step);
		} else {
			scroller.scrollTop(y-step);
		}
	});
	
}());