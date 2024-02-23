// noinspection DuplicatedCode
function fetchFromCache(e) {
	var request = e.request;
	var filename = request.url.split('/').pop().split('#').shift().split('?').shift() || '';

	return caches.match(filename).then(function(response) {
		if (!response) {
			throw Error(request.url + ' not found in cache');
		}

		return response;
	});
}

function addToCache(name, request, response) {
	if (response.ok) {
		var content_type = response.headers.get('Content-Type') || '';
		var filename = request.url.split('/').pop().split('#').shift().split('?').shift() || '';
		var extension = filename.split('.').pop();

		if (content_type === 'application/octet-stream' || content_type === 'application/x-doom' || content_type === 'application/x-doom-wad') {
			if (filename !== '' && extension === 'wad') {
				var copy = response.clone();

				caches.open(name).then(function(cache) {
					// noinspection JSIgnoredPromiseFromCall
					cache.put(filename, copy);
				});
			}
		}
	}

	return response;
}

self.addEventListener('fetch', function(e) {
	var request = e.request;

	// noinspection JSUnresolvedFunction
	if (request.url.endsWith('wad')) {
		// noinspection BadExpressionStatementJS
		e.respondWith(fetchFromCache(e).catch(function() {
			return fetch(request);
		}).then(function(response) {
			return addToCache('data', request, response);
		}));
	}
});