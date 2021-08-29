'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "6f78e5de84314c6328b70978c6a11f7a",
"assets/assets/fonts/lovelo-line-light.otf": "310ed10082f85bc1812413a21cda56d1",
"assets/assets/fonts/playfair_display.ttf": "20e1565dd5c9e47bd241d99c0dd55ad1",
"assets/assets/fonts/Sweets%2520video.mp4": "5a81a2319aee5e40a215d9a50c172bbd",
"assets/assets/fonts/times%2520new%2520roman.ttf": "e2f6bf4ef7c6443cbb0ae33f1c1a9ccc",
"assets/assets/fonts/Zen_Tokyo.ttf": "96af392644f68c913441325f5ddcceed",
"assets/assets/Icons/Big%2520arrow%2520left.svg": "2414ae4600894af2a1df70756eef54de",
"assets/assets/Icons/big_arrow_right.svg": "cf3dd21f547581c3ca27a47e6be056f2",
"assets/assets/Icons/krib%2520logo.svg": "0a81d49d26b85dd9cdc703f80d23399f",
"assets/assets/Icons/Small%2520arrow%2520left.svg": "8af6bd699934e77d9dcb577338276d2b",
"assets/assets/Icons/Small%2520arrow%2520right.svg": "f63bb2d63b7dcee49c24046d6b8e3e8c",
"assets/assets/Icons/Waves.svg": "ad1a0e83d09d0cefff7cb5afd581c293",
"assets/assets/Icons/wink.png": "7f5986d55f376e5c11d7f13c45d16153",
"assets/assets/images/Waves.png": "462ed481b8362e5fb8379934d1ea0d5f",
"assets/assets/images/Waves.svg": "ad1a0e83d09d0cefff7cb5afd581c293",
"assets/assets/images/waves2.png": "5b9baad8dfe828fde8515d986b4fe04b",
"assets/assets/videos/accessible.mp4": "36ec2259ae21d20745d171dfd581c4d7",
"assets/assets/videos/achievements.mp4": "0a3c886f25f23474fb428ce19a842d44",
"assets/assets/videos/design.mp4": "b076cab1b73def89d35d196ff651ac1f",
"assets/assets/videos/KRIB_intro.mp4": "4452011b984a4c7fa9854050838bc1dc",
"assets/assets/videos/profile.mp4": "628ddc56039e4e3c9e9ffed0ca5a18fa",
"assets/assets/videos/Safety.mp4": "269cfc479cdf0be1739d7cb05fe7b369",
"assets/assets/videos/sweets.mp4": "5a81a2319aee5e40a215d9a50c172bbd",
"assets/assets/videos/trend.mp4": "a045f46e28ef7036b20e4b98215403a3",
"assets/FontManifest.json": "bfea37eddea0ed98bc1d3cda2d33f5ba",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "7983d843c8496b8cf62e83b50a0e623c",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "619045aa21aaf59145acc5fef59bc675",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "ca74855c405ed1e8ca3bdc60676233c3",
"/": "ca74855c405ed1e8ca3bdc60676233c3",
"main.dart.js": "fa974f8b024be9fafcb94f59e09a4e95",
"manifest.json": "d84d7c1fb5803808ef1dcc0ad26d4002",
"style.css": "002a7d8a6ed2b9fac2efa73d0dda9833",
"version.json": "6fba87ec979289899033e851612bc1be"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
