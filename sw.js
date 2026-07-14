const CACHE_NAME = 'blackfish-cache-v4';
const ASSETS = [
	'./',
	'./index.html',
	'./css/application.css',
	'./img/blackfish-favicon.png',
	'./img/blackfish-trade.png',
	'./pwalogo-192.png',
	'./pwalogo-512.png',
	'./manifest.json'
];

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.addAll(ASSETS);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(
				keys
					.filter(function (key) { return key !== CACHE_NAME; })
					.map(function (key) { return caches.delete(key); })
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.match(event.request).then(function (response) {
			return response || fetch(event.request);
		})
	);
});
