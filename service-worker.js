const CACHE_NAME = 'v1.0';

const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/html/nav.html',
    '/src/images/icons/72x72.png',
    '/src/images/icons/192x192.png',
    '/src/images/icons/512x512.png',
    '/src/styles/materialize.min.css',
    '/src/styles/style.css',
    '/src/scripts/materialize.min.js',
    '/src/scripts/manipulation.js',
    '/src/scripts/req-notif.js',
    '/src/scripts/regis-sw.js',
    '/src/scripts/nav.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v53/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
]

self.addEventListener('install', event =>{
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache =>{
            return cache.addAll(urlsToCache);
        })
    )
})

self.addEventListener('fetch', event =>{
    const request = toSecureRequest(event.request);

    event.respondWith(
        caches.match(request)
        .then(response =>{
            return response || fetch(request)
            .then(resFetch =>{
                if(resFetch.ok){
                    caches.open(CACHE_NAME)
                    .then(cache =>{
                        cache.put(request.url, resFetch);
                    })
                }
                return resFetch.clone();
            });
        })
    )
})

self.addEventListener('activate', event=>{
    self.clients.claim();

    event.waitUntil(
        caches.keys()
        .then(cacheNames =>{
            return Promise.all(
                cacheNames.map(cacheName =>{
                    if(cacheName != CACHE_NAME)
                        return caches.delete(cacheName);
                })
            )
        })
    )
})

self.addEventListener('push', event=>{
    let body;
    
    if(event.data)
        body = event.data.text();
    else
        body = 'Push message no payload';
    
    const options = {
        body    : body,
        icon    : '/src/images/icons/192x192.png',
        vibrate : [200, 100, 200],
        data    : {
            dateOfArrival : Date.now(),
            primaryKey    : 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Rexballs Notification', options)
    );
});

const toSecureRequest = (request)=>{
    if(request.url.match(location.origin)) return request;

    const url  = request.url.replace('http://', 'https://');
    const init = {};

    for(item in request){
        if(item === 'url') continue;
        if(typeof(request[item]) === 'function') break;

        init[item] = request[item];
    }

    const newRequest = new Request(url, init);

    return newRequest;
}