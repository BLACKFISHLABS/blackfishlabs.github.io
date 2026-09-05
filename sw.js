/* blackfish.labs service worker
   ------------------------------------------------------------------
   A landing page is a document that changes: a cache-first worker would
   keep serving a returning visitor the page they saw last month, which
   is exactly the visitor a redesign is for. So the split is by asset
   type — the document and the stylesheet come from the network and fall
   back to cache when offline; images and icons, which are versioned by
   name and never edited in place, come from cache first. */

const CACHE = 'blackfish-cache-v12';

const PRECACHE = [
	'./',
	'./index.html',
	'./css/application.css',
	'./img/blackfish-favicon.png',
	'./pwalogo-192.png',
	'./pwalogo-512.png',
	'./manifest.json'
];

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE).then(function (cache) { return cache.addAll(PRECACHE); })
	);
	self.skipWaiting();
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys()
			.then(function (keys) {
				return Promise.all(keys
					.filter(function (key) { return key !== CACHE; })
					.map(function (key) { return caches.delete(key); }));
			})
			.then(function () { return self.clients.claim(); })
	);
});

function fresh(request) {
	return fetch(request)
		.then(function (response) {
			if (response && response.ok) {
				var copy = response.clone();
				caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
			}
			return response;
		})
		.catch(function () {
			return caches.match(request).then(function (hit) {
				return hit || caches.match('./index.html');
			});
		});
}

function cached(request) {
	return caches.match(request).then(function (hit) {
		return hit || fetch(request).then(function (response) {
			if (response && response.ok) {
				var copy = response.clone();
				caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
			}
			return response;
		});
	});
}

self.addEventListener('fetch', function (event) {
	var request = event.request;
	if (request.method !== 'GET') return;

	var url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	var isDocument = request.mode === 'navigate' || request.destination === 'document';
	var isStyle = request.destination === 'style';

	event.respondWith(isDocument || isStyle ? fresh(request) : cached(request));
});
