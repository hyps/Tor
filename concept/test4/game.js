/*! Built with IMPACT - impactjs.com */
Number.prototype.map = function (istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
};
Number.prototype.limit = function (min, max) {
    return Math.min(max, Math.max(min, this));
};
Number.prototype.round = function (precision) {
    precision = Math.pow(10, precision || 0);
    return Math.round(this * precision) / precision;
};
Number.prototype.floor = function () {
    return Math.floor(this);
};
Number.prototype.ceil = function () {
    return Math.ceil(this);
};
Number.prototype.toInt = function () {
    return (this | 0);
};
Number.prototype.toRad = function () {
    return (this / 180) * Math.PI;
};
Number.prototype.toDeg = function () {
    return (this * 180) / Math.PI;
};
Array.prototype.erase = function (item) {
    for (var i = this.length; i--;) {
        if (this[i] === item) {
            this.splice(i, 1);
        }
    }
    return this;
};
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};
Function.prototype.bind = function (bind) {
    var self = this;
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return self.apply(bind || null, args);
    };
};
(function (window) {
    window.ig = {
        game: null,
        debug: null,
        version: '1.19',
        global: window,
        modules: {},
        resources: [],
        ready: false,
        baked: false,
        nocache: '',
        ua: {},
        lib: 'lib/',
        _current: null,
        _loadQueue: [],
        _waitForOnload: 0,
        $: function (selector) {
            return selector.charAt(0) == '#' ? document.getElementById(selector.substr(1)) : document.getElementsByTagName(selector);
        },
        $new: function (name) {
            return document.createElement(name);
        },
        copy: function (object) {
            if (!object || typeof (object) != 'object' || object instanceof HTMLElement || object instanceof ig.Class) {
                return object;
            } else if (object instanceof Array) {
                var c = [];
                for (var i = 0, l = object.length; i < l; i++) {
                    c[i] = ig.copy(object[i]);
                }
                return c;
            } else {
                var c = {};
                for (var i in object) {
                    c[i] = ig.copy(object[i]);
                }
                return c;
            }
        },
        merge: function (original, extended) {
            for (var key in extended) {
                var ext = extended[key];
                if (typeof (ext) != 'object' || ext instanceof HTMLElement || ext instanceof ig.Class) {
                    original[key] = ext;
                } else {
                    if (!original[key] || typeof (original[key]) != 'object') {
                        original[key] = (ext instanceof Array) ? [] : {};
                    }
                    ig.merge(original[key], ext);
                }
            }
            return original;
        },
        ksort: function (obj) {
            if (!obj || typeof (obj) != 'object') {
                return [];
            }
            var keys = [],
                values = [];
            for (var i in obj) {
                keys.push(i);
            }
            keys.sort();
            for (var i = 0; i < keys.length; i++) {
                values.push(obj[keys[i]]);
            }
            return values;
        },
        module: function (name) {
            if (ig._current) {
                throw ("Module '" + ig._current.name + "' defines nothing");
            }
            if (ig.modules[name] && ig.modules[name].body) {
                throw ("Module '" + name + "' is already defined");
            }
            ig._current = {
                name: name,
                requires: [],
                loaded: false,
                body: null
            };
            ig.modules[name] = ig._current;
            ig._loadQueue.push(ig._current);
            ig._initDOMReady();
            return ig;
        },
        requires: function () {
            ig._current.requires = Array.prototype.slice.call(arguments);
            return ig;
        },
        defines: function (body) {
            name = ig._current.name;
            ig._current.body = body;
            ig._current = null;
            ig._execModules();
        },
        addResource: function (resource) {
            ig.resources.push(resource);
        },
        setNocache: function (set) {
            ig.nocache = set ? '?' + Date.now() : '';
        },
        log: function () {},
        show: function (name, number) {},
        mark: function (msg, color) {},
        _loadScript: function (name, requiredFrom) {
            ig.modules[name] = {
                name: name,
                requires: [],
                loaded: false,
                body: null
            };
            ig._waitForOnload++;
            var path = ig.lib + name.replace(/\./g, '/') + '.js' + ig.nocache;
            var script = ig.$new('script');
            script.type = 'text/javascript';
            script.src = path;
            script.onload = function () {
                ig._waitForOnload--;
                ig._execModules();
            };
            script.onerror = function () {
                throw ('Failed to load module ' + name + ' at ' + path + ' ' + 'required from ' + requiredFrom);
            };
            ig.$('head')[0].appendChild(script);
        },
        _execModules: function () {
            var modulesLoaded = false;
            for (var i = 0; i < ig._loadQueue.length; i++) {
                var m = ig._loadQueue[i];
                var dependenciesLoaded = true;
                for (var j = 0; j < m.requires.length; j++) {
                    var name = m.requires[j];
                    if (!ig.modules[name]) {
                        dependenciesLoaded = false;
                        ig._loadScript(name, m.name);
                    } else if (!ig.modules[name].loaded) {
                        dependenciesLoaded = false;
                    }
                }
                if (dependenciesLoaded && m.body) {
                    ig._loadQueue.splice(i, 1);
                    m.loaded = true;
                    m.body();
                    modulesLoaded = true;
                    i--;
                }
            }
            if (modulesLoaded) {
                ig._execModules();
            } else if (!ig.baked && ig._waitForOnload == 0 && ig._loadQueue.length != 0) {
                var unresolved = [];
                for (var i = 0; i < ig._loadQueue.length; i++) {
                    var unloaded = [];
                    var requires = ig._loadQueue[i].requires;
                    for (var j = 0; j < requires.length; j++) {
                        var m = ig.modules[requires[j]];
                        if (!m || !m.loaded) {
                            unloaded.push(requires[j]);
                        }
                    }
                    unresolved.push(ig._loadQueue[i].name + ' (requires: ' + unloaded.join(', ') + ')');
                }
                throw ('Unresolved (circular?) dependencies. ' + "Most likely there's a name/path mismatch for one of the listed modules:\n" + unresolved.join('\n'));
            }
        },
        _DOMReady: function () {
            if (!ig.modules['dom.ready'].loaded) {
                if (!document.body) {
                    return setTimeout(ig._DOMReady, 13);
                }
                ig.modules['dom.ready'].loaded = true;
                ig._waitForOnload--;
                ig._execModules();
            }
            return 0;
        },
        _boot: function () {
            if (document.location.href.match(/\?nocache/)) {
                ig.setNocache(true);
            }
            ig.ua.pixelRatio = window.devicePixelRatio || 1;
            ig.ua.viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            ig.ua.screen = {
                width: window.screen.availWidth * ig.ua.pixelRatio,
                height: window.screen.availHeight * ig.ua.pixelRatio
            };
            ig.ua.iPhone = /iPhone/i.test(navigator.userAgent);
            ig.ua.iPhone4 = (ig.ua.iPhone && ig.ua.pixelRatio == 2);
            ig.ua.iPad = /iPad/i.test(navigator.userAgent);
            ig.ua.android = /android/i.test(navigator.userAgent);
            ig.ua.iOS = ig.ua.iPhone || ig.ua.iPad;
            ig.ua.mobile = ig.ua.iOS || ig.ua.android;
        },
        _initDOMReady: function () {
            if (ig.modules['dom.ready']) {
                return;
            }
            ig._boot();
            ig.modules['dom.ready'] = {
                requires: [],
                loaded: false,
                body: null
            };
            ig._waitForOnload++;
            if (document.readyState === 'complete') {
                ig._DOMReady();
            } else {
                document.addEventListener('DOMContentLoaded', ig._DOMReady, false);
                window.addEventListener('load', ig._DOMReady, false);
            }
        }
    };
    var initializing = false,
        fnTest = /xyz/.test(function () {
            xyz;
        }) ? /\bparent\b/ : /.*/;
    window.ig.Class = function () {};
    var inject = function (prop) {
            var proto = this.prototype;
            var parent = {};
            for (var name in prop) {
                if (typeof (prop[name]) == "function" && typeof (proto[name]) == "function" && fnTest.test(prop[name])) {
                    parent[name] = proto[name];
                    proto[name] = (function (name, fn) {
                        return function () {
                            var tmp = this.parent;
                            this.parent = parent[name];
                            var ret = fn.apply(this, arguments);
                            this.parent = tmp;
                            return ret;
                        };
                    })(name, prop[name]);
                } else {
                    proto[name] = prop[name];
                }
            }
        };
    window.ig.Class.extend = function (prop) {
        var parent = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            if (typeof (prop[name]) == "function" && typeof (parent[name]) == "function" && fnTest.test(prop[name])) {
                prototype[name] = (function (name, fn) {
                    return function () {
                        var tmp = this.parent;
                        this.parent = parent[name];
                        var ret = fn.apply(this, arguments);
                        this.parent = tmp;
                        return ret;
                    };
                })(name, prop[name]);
            } else {
                prototype[name] = prop[name];
            }
        }

        function Class() {
            if (!initializing) {
                if (this.staticInstantiate) {
                    var obj = this.staticInstantiate.apply(this, arguments);
                    if (obj) {
                        return obj;
                    }
                }
                for (var p in this) {
                    if (typeof (this[p]) == 'object') {
                        this[p] = ig.copy(this[p]);
                    }
                }
                if (this.init) {
                    this.init.apply(this, arguments);
                }
            }
            return this;
        }
        Class.prototype = prototype;
        Class.constructor = Class;
        Class.extend = arguments.callee;
        Class.inject = inject;
        return Class;
    };
})(window);

// lib/impact/image.js
ig.baked = true;
ig.module('impact.image').defines(function () {
    ig.Image = ig.Class.extend({
        data: null,
        width: 0,
        height: 0,
        loaded: false,
        failed: false,
        loadCallback: null,
        path: '',
        staticInstantiate: function (path) {
            return ig.Image.cache[path] || null;
        },
        init: function (path) {
            this.path = path;
            this.load();
        },
        load: function (loadCallback) {
            if (this.loaded) {
                if (loadCallback) {
                    loadCallback(this.path, true);
                }
                return;
            } else if (!this.loaded && ig.ready) {
                this.loadCallback = loadCallback || null;
                this.data = new Image();
                this.data.onload = this.onload.bind(this);
                this.data.onerror = this.onerror.bind(this);
                this.data.src = this.path + ig.nocache;
            } else {
                ig.addResource(this);
            }
            ig.Image.cache[this.path] = this;
        },
        reload: function () {
            this.loaded = false;
            this.data = new Image();
            this.data.onload = this.onload.bind(this);
            this.data.src = this.path + '?' + Date.now();
        },
        onload: function (event) {
            this.width = this.data.width;
            this.height = this.data.height;
            if (ig.system.scale != 1) {
                this.resize(ig.system.scale);
            }
            this.loaded = true;
            if (this.loadCallback) {
                this.loadCallback(this.path, true);
            }
        },
        onerror: function (event) {
            this.failed = true;
            if (this.loadCallback) {
                this.loadCallback(this.path, false);
            }
        },
        resize: function (scale) {
            var widthScaled = this.width * scale;
            var heightScaled = this.height * scale;
            var orig = ig.$new('canvas');
            orig.width = this.width;
            orig.height = this.height;
            var origCtx = orig.getContext('2d');
            origCtx.drawImage(this.data, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            var origPixels = origCtx.getImageData(0, 0, this.width, this.height);
            var scaled = ig.$new('canvas');
            scaled.width = widthScaled;
            scaled.height = heightScaled;
            var scaledCtx = scaled.getContext('2d');
            var scaledPixels = scaledCtx.getImageData(0, 0, widthScaled, heightScaled);
            for (var y = 0; y < heightScaled; y++) {
                for (var x = 0; x < widthScaled; x++) {
                    var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
                    var indexScaled = (y * widthScaled + x) * 4;
                    scaledPixels.data[indexScaled] = origPixels.data[index];
                    scaledPixels.data[indexScaled + 1] = origPixels.data[index + 1];
                    scaledPixels.data[indexScaled + 2] = origPixels.data[index + 2];
                    scaledPixels.data[indexScaled + 3] = origPixels.data[index + 3];
                }
            }
            scaledCtx.putImageData(scaledPixels, 0, 0);
            this.data = scaled;
        },
        draw: function (targetX, targetY, sourceX, sourceY, width, height) {
            if (!this.loaded) {
                return;
            }
            var scale = ig.system.scale;
            sourceX = sourceX ? sourceX * scale : 0;
            sourceY = sourceY ? sourceY * scale : 0;
            width = (width ? width : this.width) * scale;
            height = (height ? height : this.height) * scale;
            ig.system.context.drawImage(this.data, sourceX, sourceY, width, height, ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY), width, height);
            ig.Image.drawCount++;
        },
        drawTile: function (targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY) {
            tileHeight = tileHeight ? tileHeight : tileWidth;
            if (!this.loaded || tileWidth > this.width || tileHeight > this.height) {
                return;
            }
            var scale = ig.system.scale;
            var tileWidthScaled = tileWidth * scale;
            var tileHeightScaled = tileHeight * scale;
            var scaleX = flipX ? -1 : 1;
            var scaleY = flipY ? -1 : 1;
            if (flipX || flipY) {
                ig.system.context.save();
                ig.system.context.scale(scaleX, scaleY);
            }
            ig.system.context.drawImage(this.data, (Math.floor(tile * tileWidth) % this.width) * scale, (Math.floor(tile * tileWidth / this.width) * tileHeight) * scale, tileWidthScaled, tileHeightScaled, ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0), ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0), tileWidthScaled, tileHeightScaled);
            if (flipX || flipY) {
                ig.system.context.restore();
            }
            ig.Image.drawCount++;
        }
    });
    ig.Image.drawCount = 0;
    ig.Image.cache = {};
    ig.Image.reloadCache = function () {
        for (path in ig.Image.cache) {
            ig.Image.cache[path].reload();
        }
    };
});

// lib/impact/font.js
ig.baked = true;
ig.module('impact.font').requires('impact.image').defines(function () {
    ig.Font = ig.Image.extend({
        widthMap: [],
        indices: [],
        firstChar: 32,
        height: 0,
        onload: function (ev) {
            this._loadMetrics(this.data);
            this.parent(ev);
        },
        widthForString: function (s) {
            var width = 0;
            for (var i = 0; i < s.length; i++) {
                width += this.widthMap[s.charCodeAt(i) - this.firstChar] + 1;
            }
            return width;
        },
        draw: function (text, x, y, align) {
            if (typeof (text) != 'string') {
                text = text.toString();
            }
            if (text.indexOf('\n') !== -1) {
                var lines = text.split('\n');
                for (i = 0; i < lines.length; i++) {
                    this.draw(lines[i], x, y + i * this.height, align);
                }
                return;
            }
            if (align == ig.Font.ALIGN.RIGHT || align == ig.Font.ALIGN.CENTER) {
                var width = 0;
                for (var i = 0; i < text.length; i++) {
                    var c = text.charCodeAt(i);
                    width += this.widthMap[c - this.firstChar] + 1;
                }
                x -= align == ig.Font.ALIGN.CENTER ? width / 2 : width;
            }
            for (var i = 0; i < text.length; i++) {
                var c = text.charCodeAt(i);
                x += this._drawChar(c - this.firstChar, x, y);
            }
            ig.Image.drawCount += text.length;
        },
        _drawChar: function (c, targetX, targetY) {
            if (!this.loaded || c < 0 || c >= this.indices.length) {
                return 0;
            }
            var scale = ig.system.scale;
            var charX = this.indices[c] * scale;
            var charY = 0;
            var charWidth = this.widthMap[c] * scale;
            var charHeight = (this.height - 2) * scale;
            ig.system.context.drawImage(this.data, charX, charY, charWidth, charHeight, ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY), charWidth, charHeight);
            return this.widthMap[c] + 1;
        },
        _loadMetrics: function (image) {
            this.height = image.height - 1;
            this.widthMap = [];
            this.indices = [];
            var canvas = ig.$new('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            var px = ctx.getImageData(0, image.height - 1, image.width, 1);
            var currentChar = 0;
            var currentWidth = 0;
            for (var x = 0; x < image.width; x++) {
                var index = x * 4 + 3;
                if (px.data[index] != 0) {
                    currentWidth++;
                } else if (px.data[index] == 0 && currentWidth) {
                    this.widthMap.push(currentWidth);
                    this.indices.push(x - currentWidth);
                    currentChar++;
                    currentWidth = 0;
                }
            }
            this.widthMap.push(currentWidth);
            this.indices.push(x - currentWidth);
        }
    });
    ig.Font.ALIGN = {
        LEFT: 0,
        RIGHT: 1,
        CENTER: 2
    };
});

// lib/impact/sound.js
ig.baked = true;
ig.module('impact.sound').defines(function () {
    ig.SoundManager = ig.Class.extend({
        clips: {},
        volume: 1,
        format: null,
        init: function () {
            var probe = new Audio();
            for (var i = 0; i < ig.Sound.use.length; i++) {
                var format = ig.Sound.use[i];
                if (probe.canPlayType(format.mime)) {
                    this.format = format;
                    break;
                }
            }
            if (!this.format) {
                ig.Sound.enabled = false;
            }
        },
        load: function (path, multiChannel, loadCallback) {
            var realPath = path.match(/^(.*)\.[^\.]+$/)[1] + '.' + this.format.ext + ig.nocache;
            if (this.clips[path]) {
                if (multiChannel && this.clips[path].length < ig.Sound.channels) {
                    for (var i = this.clips[path].length; i < ig.Sound.channels; i++) {
                        var a = new Audio(realPath);
                        a.load();
                        this.clips[path].push(a);
                    }
                }
                return this.clips[path][0];
            }
            var clip = new Audio(realPath);
            if (loadCallback) {
                clip.addEventListener('canplaythrough', function (ev) {
                    this.removeEventListener('canplaythrough', arguments.callee, false);
                    loadCallback(path, true, ev);
                }, false);
                clip.addEventListener('error', function (ev) {
                    loadCallback(path, true, ev);
                }, false);
            }
            clip.load();
            this.clips[path] = [clip];
            if (multiChannel) {
                for (var i = 1; i < ig.Sound.channels; i++) {
                    var a = new Audio(realPath);
                    a.load();
                    this.clips[path].push(a);
                }
            }
            return clip;
        },
        get: function (path) {
            var channels = this.clips[path];
            for (var i = 0, clip; clip = channels[i++];) {
                if (clip.paused || clip.ended) {
                    if (clip.ended) {
                        clip.currentTime = 0;
                    }
                    return clip;
                }
            }
            channels[0].pause();
            channels[0].currentTime = 0;
            return channels[0];
        }
    });
    ig.Music = ig.Class.extend({
        tracks: [],
        namedTracks: {},
        currentTrack: null,
        currentIndex: 0,
        random: false,
        _volume: 1,
        _loop: false,
        _fadeInterval: 0,
        _fadeTimer: null,
        _endedCallbackBound: null,
        init: function () {
            this._endedCallbackBound = this._endedCallback.bind(this);
            if (Object.defineProperty) {
                Object.defineProperty(this, "volume", {
                    get: this.getVolume.bind(this),
                    set: this.setVolume.bind(this)
                });
                Object.defineProperty(this, "loop", {
                    get: this.getLooping.bind(this),
                    set: this.setLooping.bind(this)
                });
            } else if (this.__defineGetter__) {
                this.__defineGetter__('volume', this.getVolume.bind(this));
                this.__defineSetter__('volume', this.setVolume.bind(this));
                this.__defineGetter__('loop', this.getLooping.bind(this));
                this.__defineSetter__('loop', this.setLooping.bind(this));
            }
        },
        add: function (music, name) {
            if (!ig.Sound.enabled) {
                return;
            }
            var path = music instanceof ig.Sound ? music.path : music;
            var track = ig.soundManager.load(path, false);
            track.loop = this._loop;
            track.volume = this._volume;
            track.addEventListener('ended', this._endedCallbackBound, false);
            this.tracks.push(track);
            if (name) {
                this.namedTracks[name] = track;
            }
            if (!this.currentTrack) {
                this.currentTrack = track;
            }
        },
        next: function () {
            if (!this.tracks.length) {
                return;
            }
            this.stop();
            this.currentIndex = this.random ? Math.floor(Math.random() * this.tracks.length) : (this.currentIndex + 1) % this.tracks.length;
            this.currentTrack = this.tracks[this.currentIndex];
            this.play();
        },
        pause: function () {
            if (!this.currentTrack) {
                return;
            }
            this.currentTrack.pause();
        },
        stop: function () {
            if (!this.currentTrack) {
                return;
            }
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        },
        play: function (name) {
            if (name && this.namedTracks[name]) {
                var newTrack = this.namedTracks[name];
                if (newTrack != this.currentTrack) {
                    this.stop();
                    this.currentTrack = newTrack;
                }
            } else if (!this.currentTrack) {
                return;
            }
            this.currentTrack.play();
        },
        getLooping: function () {
            return this._loop;
        },
        setLooping: function (l) {
            this._loop = l;
            for (var i in this.tracks) {
                this.tracks[i].loop = l;
            }
        },
        getVolume: function () {
            return this._volume;
        },
        setVolume: function (v) {
            this._volume = v.limit(0, 1);
            for (var i in this.tracks) {
                this.tracks[i].volume = this._volume;
            }
        },
        fadeOut: function (time) {
            if (!this.currentTrack) {
                return;
            }
            clearInterval(this._fadeInterval);
            this.fadeTimer = new ig.Timer(time);
            this._fadeInterval = setInterval(this._fadeStep.bind(this), 50);
        },
        _fadeStep: function () {
            var v = this.fadeTimer.delta().map(-this.fadeTimer.target, 0, 1, 0).limit(0, 1) * this._volume;
            if (v <= 0.01) {
                this.stop();
                this.currentTrack.volume = this._volume;
                clearInterval(this._fadeInterval);
            } else {
                this.currentTrack.volume = v;
            }
        },
        _endedCallback: function () {
            if (this._loop) {
                this.play();
            } else {
                this.next();
            }
        }
    });
    ig.Sound = ig.Class.extend({
        path: '',
        volume: 1,
        currentClip: null,
        multiChannel: true,
        init: function (path, multiChannel) {
            this.path = path;
            this.multiChannel = (multiChannel !== false);
            this.load();
        },
        load: function (loadCallback) {
            if (!ig.Sound.enabled) {
                if (loadCallback) {
                    loadCallback(this.path, true);
                }
                return;
            }
            if (ig.ready) {
                ig.soundManager.load(this.path, this.multiChannel, loadCallback);
            } else {
                ig.addResource(this);
            }
        },
        play: function () {
            if (!ig.Sound.enabled) {
                return;
            }
            this.currentClip = ig.soundManager.get(this.path);
            this.currentClip.volume = ig.soundManager.volume * this.volume;
            this.currentClip.play();
        },
        stop: function () {
            if (this.currentClip) {
                this.currentClip.pause();
                this.currentClip.currentTime = 0;
            }
        }
    });
    ig.Sound.FORMAT = {
        MP3: {
            ext: 'mp3',
            mime: 'audio/mpeg'
        },
        M4A: {
            ext: 'm4a',
            mime: 'audio/mp4; codecs=mp4a'
        },
        OGG: {
            ext: 'ogg',
            mime: 'audio/ogg; codecs=vorbis'
        },
        WEBM: {
            ext: 'webm',
            mime: 'audio/webm; codecs=vorbis'
        },
        CAF: {
            ext: 'caf',
            mime: 'audio/x-caf'
        }
    };
    ig.Sound.use = [ig.Sound.FORMAT.OGG, ig.Sound.FORMAT.MP3];
    ig.Sound.channels = 4;
    ig.Sound.enabled = true;
});

// lib/impact/loader.js
ig.baked = true;
ig.module('impact.loader').requires('impact.image', 'impact.font', 'impact.sound').defines(function () {
    ig.Loader = ig.Class.extend({
        resources: [],
        gameClass: null,
        status: 0,
        done: false,
        _unloaded: [],
        _drawStatus: 0,
        _intervalId: 0,
        _loadCallbackBound: null,
        init: function (gameClass, resources) {
            this.gameClass = gameClass;
            this.resources = resources;
            this._loadCallbackBound = this._loadCallback.bind(this);
            for (var i = 0; i < this.resources.length; i++) {
                this._unloaded.push(this.resources[i].path);
            }
        },
        load: function () {
            ig.system.clear('#000');
            if (!this.resources.length) {
                this.end();
                return;
            }
            for (var i = 0; i < this.resources.length; i++) {
                this.loadResource(this.resources[i]);
            }
            this._intervalId = setInterval(this.draw.bind(this), 16);
        },
        loadResource: function (res) {
            res.load(this._loadCallbackBound);
        },
        end: function () {
            if (this.done) {
                return;
            }
            this.done = true;
            clearInterval(this._intervalId);
            ig.system.setGame(this.gameClass);
        },
        draw: function () {
            this._drawStatus += (this.status - this._drawStatus) / 5;
            var s = ig.system.scale;
            var w = ig.system.width * 0.6;
            var h = ig.system.height * 0.1;
            var x = ig.system.width * 0.5 - w / 2;
            var y = ig.system.height * 0.5 - h / 2;
            ig.system.context.fillStyle = '#000';
            ig.system.context.fillRect(0, 0, 480, 320);
            ig.system.context.fillStyle = '#fff';
            ig.system.context.fillRect(x * s, y * s, w * s, h * s);
            ig.system.context.fillStyle = '#000';
            ig.system.context.fillRect(x * s + s, y * s + s, w * s - s - s, h * s - s - s);
            ig.system.context.fillStyle = '#fff';
            ig.system.context.fillRect(x * s, y * s, w * s * this._drawStatus, h * s);
        },
        _loadCallback: function (path, status) {
            if (status) {
                this._unloaded.erase(path);
            } else {
                throw ('Failed to load resource: ' + path);
            }
            this.status = 1 - (this._unloaded.length / this.resources.length);
            if (this._unloaded.length == 0) {
                setTimeout(this.end.bind(this), 250);
            }
        }
    });
});

// lib/impact/timer.js
ig.baked = true;
ig.module('impact.timer').defines(function () {
    ig.Timer = ig.Class.extend({
        target: 0,
        base: 0,
        last: 0,
        init: function (seconds) {
            this.base = ig.Timer.time;
            this.last = ig.Timer.time;
            this.target = seconds || 0;
        },
        set: function (seconds) {
            this.target = seconds || 0;
            this.base = ig.Timer.time;
        },
        reset: function () {
            this.base = ig.Timer.time;
        },
        tick: function () {
            var delta = ig.Timer.time - this.last;
            this.last = ig.Timer.time;
            return delta;
        },
        delta: function () {
            return ig.Timer.time - this.base - this.target;
        }
    });
    ig.Timer._last = 0;
    ig.Timer.time = 0;
    ig.Timer.timeScale = 1;
    ig.Timer.maxStep = 0.05;
    ig.Timer.step = function () {
        var current = Date.now();
        var delta = (current - ig.Timer._last) / 1000;
        ig.Timer.time += Math.min(delta, ig.Timer.maxStep) * ig.Timer.timeScale;
        ig.Timer._last = current;
    };
});

// lib/impact/system.js
ig.baked = true;
ig.module('impact.system').requires('impact.timer', 'impact.image').defines(function () {
    ig.System = ig.Class.extend({
        fps: 30,
        width: 320,
        height: 240,
        realWidth: 320,
        realHeight: 240,
        scale: 1,
        tick: 0,
        intervalId: 0,
        newGameClass: null,
        running: false,
        delegate: null,
        clock: null,
        canvas: null,
        context: null,
        smoothPositioning: true,
        init: function (canvasId, fps, width, height, scale) {
            this.fps = fps;
            this.clock = new ig.Timer();
            this.canvas = ig.$(canvasId);
            this.resize(width, height, scale);
            this.context = this.canvas.getContext('2d');
        },
        resize: function (width, height, scale) {
            this.width = width;
            this.height = height;
            this.scale = scale || this.scale;
            this.realWidth = this.width * this.scale;
            this.realHeight = this.height * this.scale;
            this.canvas.width = this.realWidth;
            this.canvas.height = this.realHeight;
        },
        setGame: function (gameClass) {
            if (this.running) {
                this.newGameClass = gameClass;
            } else {
                this.setGameNow(gameClass);
            }
        },
        setGameNow: function (gameClass) {
            ig.game = new(gameClass)();
            ig.system.setDelegate(ig.game);
        },
        setDelegate: function (object) {
            if (typeof (object.run) == 'function') {
                this.delegate = object;
                this.startRunLoop();
            } else {
                throw ('System.setDelegate: No run() function in object');
            }
        },
        stopRunLoop: function () {
            clearInterval(this.intervalId);
            this.running = false;
        },
        startRunLoop: function () {
            this.stopRunLoop();
            this.intervalId = setInterval(this.run.bind(this), 1000 / this.fps);
            this.running = true;
        },
        clear: function (color) {
            this.context.fillStyle = color;
            this.context.fillRect(0, 0, this.realWidth, this.realHeight);
        },
        run: function () {
            ig.Timer.step();
            this.tick = this.clock.tick();
            this.delegate.run();
            ig.input.clearPressed();
            if (this.newGameClass) {
                this.setGameNow(this.newGameClass);
                this.newGameClass = null;
            }
        },
        getDrawPos: function (p) {
            return this.smoothPositioning ? Math.round(p * this.scale) : Math.round(p) * this.scale;
        }
    });
});

// lib/impact/input.js
ig.baked = true;
ig.module('impact.input').defines(function () {
    ig.KEY = {
        'MOUSE1': -1,
        'MOUSE2': -3,
        'MWHEEL_UP': -4,
        'MWHEEL_DOWN': -5,
        'BACKSPACE': 8,
        'TAB': 9,
        'ENTER': 13,
        'PAUSE': 19,
        'CAPS': 20,
        'ESC': 27,
        'SPACE': 32,
        'PAGE_UP': 33,
        'PAGE_DOWN': 34,
        'END': 35,
        'HOME': 36,
        'LEFT_ARROW': 37,
        'UP_ARROW': 38,
        'RIGHT_ARROW': 39,
        'DOWN_ARROW': 40,
        'INSERT': 45,
        'DELETE': 46,
        '_0': 48,
        '_1': 49,
        '_2': 50,
        '_3': 51,
        '_4': 52,
        '_5': 53,
        '_6': 54,
        '_7': 55,
        '_8': 56,
        '_9': 57,
        'A': 65,
        'B': 66,
        'C': 67,
        'D': 68,
        'E': 69,
        'F': 70,
        'G': 71,
        'H': 72,
        'I': 73,
        'J': 74,
        'K': 75,
        'L': 76,
        'M': 77,
        'N': 78,
        'O': 79,
        'P': 80,
        'Q': 81,
        'R': 82,
        'S': 83,
        'T': 84,
        'U': 85,
        'V': 86,
        'W': 87,
        'X': 88,
        'Y': 89,
        'Z': 90,
        'NUMPAD_0': 96,
        'NUMPAD_1': 97,
        'NUMPAD_2': 98,
        'NUMPAD_3': 99,
        'NUMPAD_4': 100,
        'NUMPAD_5': 101,
        'NUMPAD_6': 102,
        'NUMPAD_7': 103,
        'NUMPAD_8': 104,
        'NUMPAD_9': 105,
        'MULTIPLY': 106,
        'ADD': 107,
        'SUBSTRACT': 109,
        'DECIMAL': 110,
        'DIVIDE': 111,
        'F1': 112,
        'F2': 113,
        'F3': 114,
        'F4': 115,
        'F5': 116,
        'F6': 117,
        'F7': 118,
        'F8': 119,
        'F9': 120,
        'F10': 121,
        'F11': 122,
        'F12': 123,
        'SHIFT': 16,
        'CTRL': 17,
        'ALT': 18,
        'PLUS': 187,
        'COMMA': 188,
        'MINUS': 189,
        'PERIOD': 190
    };
    ig.Input = ig.Class.extend({
        bindings: {},
        actions: {},
        presses: {},
        locks: {},
        delayedKeyup: {},
        isUsingMouse: false,
        isUsingKeyboard: false,
        isUsingAccelerometer: false,
        mouse: {
            x: 0,
            y: 0
        },
        accel: {
            x: 0,
            y: 0,
            z: 0
        },
        initMouse: function () {
            if (this.isUsingMouse) {
                return;
            }
            this.isUsingMouse = true;
            window.addEventListener('mousewheel', this.mousewheel.bind(this), false);
            ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false);
            ig.system.canvas.addEventListener('mousedown', this.keydown.bind(this), false);
            ig.system.canvas.addEventListener('mouseup', this.keyup.bind(this), false);
            ig.system.canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
            ig.system.canvas.addEventListener('touchstart', this.keydown.bind(this), false);
            ig.system.canvas.addEventListener('touchend', this.keyup.bind(this), false);
            ig.system.canvas.addEventListener('touchmove', this.mousemove.bind(this), false);
        },
        initKeyboard: function () {
            if (this.isUsingKeyboard) {
                return;
            }
            this.isUsingKeyboard = true;
            window.addEventListener('keydown', this.keydown.bind(this), false);
            window.addEventListener('keyup', this.keyup.bind(this), false);
        },
        initAccelerometer: function () {
            if (this.isUsingAccelerometer) {
                return;
            }
            window.addEventListener('devicemotion', this.devicemotion.bind(this), false);
        },
        mousewheel: function (event) {
            var code = event.wheel > 0 ? ig.KEY.MWHEEL_UP : ig.KEY.MWHEEL_DOWN;
            var action = this.bindings[code];
            if (action) {
                this.actions[action] = true;
                this.presses[action] = true;
                event.stopPropagation();
                this.delayedKeyup[action] = true;
            }
        },
        mousemove: function (event) {
            var el = ig.system.canvas;
            var pos = {
                left: 0,
                top: 0
            };
            while (el != null) {
                pos.left += el.offsetLeft;
                pos.top += el.offsetTop;
                el = el.offsetParent;
            }
            var tx = event.pageX;
            var ty = event.pageY;
            if (event.touches) {
                tx = event.touches[0].clientX;
                ty = event.touches[0].clientY;
            }
            this.mouse.x = (tx - pos.left) / ig.system.scale;
            this.mouse.y = (ty - pos.top) / ig.system.scale;
        },
        contextmenu: function (event) {
            if (this.bindings[ig.KEY.MOUSE2]) {
                event.stopPropagation();
                event.preventDefault();
            }
        },
        keydown: function (event) {
            if (event.target.type == 'text') {
                return;
            }
            var code = event.type == 'keydown' ? event.keyCode : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
            if (event.type == 'touchstart' || event.type == 'mousedown') {
                this.mousemove(event);
            }
            var action = this.bindings[code];
            if (action) {
                this.actions[action] = true;
                if (!this.locks[action]) {
                    this.presses[action] = true;
                    this.locks[action] = true;
                }
                event.stopPropagation();
                event.preventDefault();
            }
        },
        keyup: function (event) {
            if (event.target.type == 'text') {
                return;
            }
            var code = event.type == 'keyup' ? event.keyCode : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
            var action = this.bindings[code];
            if (action) {
                this.delayedKeyup[action] = true;
                event.stopPropagation();
                event.preventDefault();
            }
        },
        devicemotion: function (event) {
            this.accel = event.accelerationIncludingGravity;
        },
        bind: function (key, action) {
            if (key < 0) {
                this.initMouse();
            } else if (key > 0) {
                this.initKeyboard();
            }
            this.bindings[key] = action;
        },
        bindTouch: function (selector, action) {
            var element = ig.$(selector);
            var that = this;
            element.addEventListener('touchstart', function (ev) {
                that.touchStart(ev, action);
            }, false);
            element.addEventListener('touchend', function (ev) {
                that.touchEnd(ev, action);
            }, false);
        },
        unbind: function (key) {
            var action = this.bindings[key];
            this.delayedKeyup[action] = true;
            this.bindings[key] = null;
        },
        unbindAll: function () {
            this.bindings = {};
            this.actions = {};
            this.presses = {};
            this.locks = {};
            this.delayedKeyup = {};
        },
        state: function (action) {
            return this.actions[action];
        },
        pressed: function (action) {
            return this.presses[action];
        },
        released: function (action) {
            return this.delayedKeyup[action];
        },
        clearPressed: function () {
            for (var action in this.delayedKeyup) {
                this.actions[action] = false;
                this.locks[action] = false;
            }
            this.delayedKeyup = {};
            this.presses = {};
        },
        touchStart: function (event, action) {
            this.actions[action] = true;
            this.presses[action] = true;
            event.stopPropagation();
            event.preventDefault();
            return false;
        },
        touchEnd: function (event, action) {
            this.delayedKeyup[action] = true;
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
    });
});

// lib/impact/impact.js
ig.baked = true;
ig.module('impact.impact').requires('dom.ready', 'impact.loader', 'impact.system', 'impact.input', 'impact.sound').defines(function () {
    ig.main = function (canvasId, gameClass, fps, width, height, scale, loaderClass) {
        ig.system = new ig.System(canvasId, fps, width, height, scale || 1);
        ig.input = new ig.Input();
        ig.soundManager = new ig.SoundManager();
        ig.music = new ig.Music();
        ig.ready = true;
        var loader = new(loaderClass || ig.Loader)(gameClass, ig.resources);
        loader.load();
    };
});

// lib/impact/animation.js
ig.baked = true;
ig.module('impact.animation').requires('impact.timer', 'impact.image').defines(function () {
    ig.AnimationSheet = ig.Class.extend({
        width: 8,
        height: 8,
        image: null,
        init: function (path, width, height) {
            this.width = width;
            this.height = height;
            this.image = new ig.Image(path);
        }
    });
    ig.Animation = ig.Class.extend({
        sheet: null,
        timer: null,
        sequence: [],
        flip: {
            x: false,
            y: false
        },
        pivot: {
            x: 0,
            y: 0
        },
        frame: 0,
        tile: 0,
        loopCount: 0,
        alpha: 1,
        angle: 0,
        init: function (sheet, frameTime, sequence, stop) {
            this.sheet = sheet;
            this.pivot = {
                x: sheet.width / 2,
                y: sheet.height / 2
            };
            this.timer = new ig.Timer();
            this.frameTime = frameTime;
            this.sequence = sequence;
            this.stop = !! stop;
            this.tile = this.sequence[0];
        },
        rewind: function () {
            this.timer.reset();
            this.loopCount = 0;
            this.tile = this.sequence[0];
            return this;
        },
        gotoFrame: function (f) {
            this.timer.set(this.frameTime * -f);
            this.update();
        },
        gotoRandomFrame: function () {
            this.gotoFrame(Math.floor(Math.random() * this.sequence.length))
        },
        update: function () {
            var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
            this.loopCount = Math.floor(frameTotal / this.sequence.length);
            if (this.stop && this.loopCount > 0) {
                this.frame = this.sequence.length - 1;
            } else {
                this.frame = frameTotal % this.sequence.length;
            }
            this.tile = this.sequence[this.frame];
        },
        draw: function (targetX, targetY) {
            var bbsize = Math.max(this.sheet.width, this.sheet.height);
            if (targetX > ig.system.width || targetY > ig.system.height || targetX + bbsize < 0 || targetY + bbsize < 0) {
                return;
            }
            if (this.alpha != 1) {
                ig.system.context.globalAlpha = this.alpha;
            }
            if (this.angle == 0) {
                this.sheet.image.drawTile(targetX, targetY, this.tile, this.sheet.width, this.sheet.height, this.flip.x, this.flip.y);
            } else {
                ig.system.context.save();
                ig.system.context.translate(ig.system.getDrawPos(targetX + this.pivot.x), ig.system.getDrawPos(targetY + this.pivot.y));
                ig.system.context.rotate(this.angle);
                this.sheet.image.drawTile(-this.pivot.x, -this.pivot.y, this.tile, this.sheet.width, this.sheet.height, this.flip.x, this.flip.y);
                ig.system.context.restore();
            }
            if (this.alpha != 1) {
                ig.system.context.globalAlpha = 1;
            }
        }
    });
});

// lib/impact/entity.js
ig.baked = true;
ig.module('impact.entity').requires('impact.animation', 'impact.impact').defines(function () {
    ig.Entity = ig.Class.extend({
        id: 0,
        settings: {},
        size: {
            x: 16,
            y: 16
        },
        offset: {
            x: 0,
            y: 0
        },
        pos: {
            x: 0,
            y: 0
        },
        last: {
            x: 0,
            y: 0
        },
        vel: {
            x: 0,
            y: 0
        },
        accel: {
            x: 0,
            y: 0
        },
        friction: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 100,
            y: 100
        },
        zIndex: 0,
        gravityFactor: 1,
        standing: false,
        bounciness: 0,
        minBounceVelocity: 40,
        anims: {},
        animSheet: null,
        currentAnim: null,
        health: 10,
        type: 0,
        checkAgainst: 0,
        collides: 0,
        _killed: false,
        slopeStanding: {
            min: (44).toRad(),
            max: (136).toRad()
        },
        init: function (x, y, settings) {
            this.id = ++ig.Entity._lastId;
            this.pos.x = x;
            this.pos.y = y;
            ig.merge(this, settings);
        },
        addAnim: function (name, frameTime, sequence, stop) {
            if (!this.animSheet) {
                throw ('No animSheet to add the animation ' + name + ' to.');
            }
            var a = new ig.Animation(this.animSheet, frameTime, sequence, stop);
            this.anims[name] = a;
            if (!this.currentAnim) {
                this.currentAnim = a;
            }
            return a;
        },
        update: function () {
            this.last.x = this.pos.x;
            this.last.y = this.pos.y;
            this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
            this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x, this.friction.x, this.maxVel.x);
            this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y, this.friction.y, this.maxVel.y);
            var mx = this.vel.x * ig.system.tick;
            var my = this.vel.y * ig.system.tick;
            var res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y);
            this.handleMovementTrace(res);
            if (this.currentAnim) {
                this.currentAnim.update();
            }
        },
        getNewVelocity: function (vel, accel, friction, max) {
            if (accel) {
                return (vel + accel * ig.system.tick).limit(-max, max);
            } else if (friction) {
                var delta = friction * ig.system.tick;
                if (vel - delta > 0) {
                    return vel - delta;
                } else if (vel + delta < 0) {
                    return vel + delta;
                } else {
                    return 0;
                }
            }
            return vel.limit(-max, max);
        },
        handleMovementTrace: function (res) {
            this.standing = false;
            if (res.collision.y) {
                if (this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity) {
                    this.vel.y *= -this.bounciness;
                } else {
                    if (this.vel.y > 0) {
                        this.standing = true;
                    }
                    this.vel.y = 0;
                }
            }
            if (res.collision.x) {
                if (this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity) {
                    this.vel.x *= -this.bounciness;
                } else {
                    this.vel.x = 0;
                }
            }
            if (res.collision.slope) {
                var s = res.collision.slope;
                if (this.bounciness > 0) {
                    var proj = this.vel.x * s.nx + this.vel.y * s.ny;
                    this.vel.x -= s.nx * proj * 2;
                    this.vel.y -= s.ny * proj * 2;
                    this.vel.x *= this.bounciness;
                    this.vel.y *= this.bounciness;
                } else {
                    var lengthSquared = s.x * s.x + s.y * s.y;
                    var dot = (this.vel.x * s.x + this.vel.y * s.y) / lengthSquared;
                    this.vel.x = s.x * dot;
                    this.vel.y = s.y * dot;
                    var angle = Math.atan2(s.x, s.y);
                    if (angle > this.slopeStanding.min && angle < this.slopeStanding.max) {
                        this.standing = true;
                    }
                }
            }
            this.pos = res.pos;
        },
        draw: function () {
            if (this.currentAnim) {
                this.currentAnim.draw(this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y);
            }
        },
        kill: function () {
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from) {
            this.health -= amount;
            if (this.health <= 0) {
                this.kill();
            }
        },
        touches: function (other) {
            return !(this.pos.x >= other.pos.x + other.size.x || this.pos.x + this.size.x <= other.pos.x || this.pos.y >= other.pos.y + other.size.y || this.pos.y + this.size.y <= other.pos.y);
        },
        distanceTo: function (other) {
            var xd = (this.pos.x + this.size.x / 2) - (other.pos.x + other.size.x / 2);
            var yd = (this.pos.y + this.size.y / 2) - (other.pos.y + other.size.y / 2);
            return Math.sqrt(xd * xd + yd * yd);
        },
        angleTo: function (other) {
            return Math.atan2((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2), (other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2));
        },
        check: function (other) {},
        collideWith: function (other, axis) {},
        ready: function () {}
    });
    ig.Entity._lastId = 0;
    ig.Entity.COLLIDES = {
        NEVER: 0,
        LITE: 1,
        PASSIVE: 2,
        ACTIVE: 4,
        FIXED: 8
    };
    ig.Entity.TYPE = {
        NONE: 0,
        A: 1,
        B: 2,
        BOTH: 3
    };
    ig.Entity.checkPair = function (a, b) {
        if (a.checkAgainst & b.type) {
            a.check(b);
        }
        if (b.checkAgainst & a.type) {
            b.check(a);
        }
        if (a.collides && b.collides && a.collides + b.collides > ig.Entity.COLLIDES.ACTIVE) {
            ig.Entity.solveCollision(a, b);
        }
    };
    ig.Entity.solveCollision = function (a, b) {
        var weak = null;
        if (a.collides == ig.Entity.COLLIDES.LITE || b.collides == ig.Entity.COLLIDES.FIXED) {
            weak = a;
        } else if (b.collides == ig.Entity.COLLIDES.LITE || a.collides == ig.Entity.COLLIDES.FIXED) {
            weak = b;
        }
        if (a.last.x + a.size.x > b.last.x && a.last.x < b.last.x + b.size.x) {
            if (a.last.y < b.last.y) {
                ig.Entity.seperateOnYAxis(a, b, weak);
            } else {
                ig.Entity.seperateOnYAxis(b, a, weak);
            }
            a.collideWith(b, 'y');
            b.collideWith(a, 'y');
        } else if (a.last.y + a.size.y > b.last.y && a.last.y < b.last.y + b.size.y) {
            if (a.last.x < b.last.x) {
                ig.Entity.seperateOnXAxis(a, b, weak);
            } else {
                ig.Entity.seperateOnXAxis(b, a, weak);
            }
            a.collideWith(b, 'x');
            b.collideWith(a, 'x');
        }
    };
    ig.Entity.seperateOnXAxis = function (left, right, weak) {
        var nudge = (left.pos.x + left.size.x - right.pos.x);
        if (weak) {
            var strong = left === weak ? right : left;
            weak.vel.x = -weak.vel.x * weak.bounciness + strong.vel.x;
            var resWeak = ig.game.collisionMap.trace(weak.pos.x, weak.pos.y, weak == left ? -nudge : nudge, 0, weak.size.x, weak.size.y);
            weak.pos.x = resWeak.pos.x;
        } else {
            var v2 = (left.vel.x - right.vel.x) / 2;
            left.vel.x = -v2;
            right.vel.x = v2;
            var resLeft = ig.game.collisionMap.trace(left.pos.x, left.pos.y, -nudge / 2, 0, left.size.x, left.size.y);
            left.pos.x = Math.floor(resLeft.pos.x);
            var resRight = ig.game.collisionMap.trace(right.pos.x, right.pos.y, nudge / 2, 0, right.size.x, right.size.y);
            right.pos.x = Math.ceil(resRight.pos.x);
        }
    };
    ig.Entity.seperateOnYAxis = function (top, bottom, weak) {
        var nudge = (top.pos.y + top.size.y - bottom.pos.y);
        if (weak) {
            var strong = top === weak ? bottom : top;
            weak.vel.y = -weak.vel.y * weak.bounciness + strong.vel.y;
            var nudgeX = 0;
            if (weak == top && Math.abs(weak.vel.y - strong.vel.y) < weak.minBounceVelocity) {
                weak.standing = true;
                nudgeX = strong.vel.x * ig.system.tick;
            }
            var resWeak = ig.game.collisionMap.trace(weak.pos.x, weak.pos.y, nudgeX, weak == top ? -nudge : nudge, weak.size.x, weak.size.y);
            weak.pos.y = resWeak.pos.y;
            weak.pos.x = resWeak.pos.x;
        } else if (ig.game.gravity && (bottom.standing || top.vel.y > 0)) {
            var resTop = ig.game.collisionMap.trace(top.pos.x, top.pos.y, 0, -(top.pos.y + top.size.y - bottom.pos.y), top.size.x, top.size.y);
            top.pos.y = resTop.pos.y;
            if (top.bounciness > 0 && top.vel.y > top.minBounceVelocity) {
                top.vel.y *= -top.bounciness;
            } else {
                top.standing = true;
                top.vel.y = 0;
            }
        } else {
            var v2 = (top.vel.y - bottom.vel.y) / 2;
            top.vel.y = -v2;
            bottom.vel.y = v2;
            var nudgeX = bottom.vel.x * ig.system.tick;
            var resTop = ig.game.collisionMap.trace(top.pos.x, top.pos.y, nudgeX, -nudge / 2, top.size.x, top.size.y);
            top.pos.y = resTop.pos.y;
            var resBottom = ig.game.collisionMap.trace(bottom.pos.x, bottom.pos.y, 0, nudge / 2, bottom.size.x, bottom.size.y);
            bottom.pos.y = resBottom.pos.y;
        }
    };
});

// lib/impact/map.js
ig.baked = true;
ig.module('impact.map').defines(function () {
    ig.Map = ig.Class.extend({
        tilesize: 8,
        width: 1,
        height: 1,
        data: [
            []
        ],
        init: function (tilesize, data) {
            this.tilesize = tilesize;
            this.data = data;
            this.height = data.length;
            this.width = data[0].length;
        },
        getTile: function (x, y) {
            var tx = Math.floor(x / this.tilesize);
            var ty = Math.floor(y / this.tilesize);
            if ((tx >= 0 && tx < this.width) && (ty >= 0 && ty < this.height)) {
                return this.data[ty][tx];
            } else {
                return 0;
            }
        },
        setTile: function (x, y, tile) {
            var tx = Math.floor(x / this.tilesize);
            var ty = Math.floor(y / this.tilesize);
            if ((tx >= 0 && tx < this.width) && (ty >= 0 && ty < this.height)) {
                this.data[ty][tx] = tile;
            }
        }
    });
});

// lib/impact/collision-map.js
ig.baked = true;
ig.module('impact.collision-map').requires('impact.map').defines(function () {
    ig.CollisionMap = ig.Map.extend({
        init: function (tilesize, data, tiledef) {
            this.parent(tilesize, data);
            this.tiledef = tiledef || ig.CollisionMap.defaultTileDef;
        },
        trace: function (x, y, vx, vy, objectWidth, objectHeight) {
            var res = {
                collision: {
                    x: false,
                    y: false,
                    slope: false
                },
                pos: {
                    x: x,
                    y: y
                },
                tile: {
                    x: 0,
                    y: 0
                }
            };
            var steps = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)) / this.tilesize);
            if (steps > 1) {
                var sx = vx / steps;
                var sy = vy / steps;
                for (var i = 0; i < steps && (sx || sy); i++) {
                    this._traceStep(res, x, y, sx, sy, objectWidth, objectHeight, vx, vy, i);
                    x = res.pos.x;
                    y = res.pos.y;
                    if (res.collision.x) {
                        sx = 0;
                        vx = 0;
                    }
                    if (res.collision.y) {
                        sy = 0;
                        vy = 0;
                    }
                    if (res.collision.slope) {
                        break;
                    }
                }
            } else {
                this._traceStep(res, x, y, vx, vy, objectWidth, objectHeight, vx, vy, 0);
            }
            return res;
        },
        _traceStep: function (res, x, y, vx, vy, width, height, rvx, rvy, step) {
            res.pos.x += vx;
            res.pos.y += vy;
            var t = 0;
            if (vx) {
                var pxOffsetX = (vx > 0 ? width : 0);
                var tileOffsetX = (vx < 0 ? this.tilesize : 0);
                var firstTileY = Math.max(Math.floor(y / this.tilesize), 0);
                var lastTileY = Math.min(Math.ceil((y + height) / this.tilesize), this.height);
                var tileX = Math.floor((res.pos.x + pxOffsetX) / this.tilesize);
                var prevTileX = Math.floor((x + pxOffsetX) / this.tilesize);
                if (step > 0 || tileX == prevTileX || prevTileX < 0 || prevTileX >= this.width) {
                    prevTileX = -1;
                }
                if (tileX >= 0 && tileX < this.width) {
                    for (var tileY = firstTileY; tileY < lastTileY; tileY++) {
                        if (prevTileX != -1) {
                            t = this.data[tileY][prevTileX];
                            if (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY)) {
                                break;
                            }
                        }
                        t = this.data[tileY][tileX];
                        if (t == 1 || (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY))) {
                            if (t > 1 && res.collision.slope) {
                                break;
                            }
                            res.collision.x = true;
                            res.tile.x = t;
                            res.pos.x = tileX * this.tilesize - pxOffsetX + tileOffsetX;
                            break;
                        }
                    }
                }
            }
            if (vy) {
                var pxOffsetY = (vy > 0 ? height : 0);
                var tileOffsetY = (vy < 0 ? this.tilesize : 0);
                var firstTileX = Math.max(Math.floor(res.pos.x / this.tilesize), 0);
                var lastTileX = Math.min(Math.ceil((res.pos.x + width) / this.tilesize), this.width);
                var tileY = Math.floor((res.pos.y + pxOffsetY) / this.tilesize);
                var prevTileY = Math.floor((y + pxOffsetY) / this.tilesize);
                if (step > 0 || tileY == prevTileY || prevTileY < 0 || prevTileY >= this.height) {
                    prevTileY = -1;
                }
                if (tileY >= 0 && tileY < this.height) {
                    for (var tileX = firstTileX; tileX < lastTileX; tileX++) {
                        if (prevTileY != -1) {
                            t = this.data[prevTileY][tileX];
                            if (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY)) {
                                break;
                            }
                        }
                        t = this.data[tileY][tileX];
                        if (t == 1 || (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY))) {
                            if (t > 1 && res.collision.slope) {
                                break;
                            }
                            res.collision.y = true;
                            res.tile.y = t;
                            res.pos.y = tileY * this.tilesize - pxOffsetY + tileOffsetY;
                            break;
                        }
                    }
                }
            }
        },
        _checkTileDef: function (res, t, x, y, vx, vy, width, height, tileX, tileY) {
            var def = this.tiledef[t];
            if (!def) {
                return false;
            }
            var lx = (tileX + def[0]) * this.tilesize,
                ly = (tileY + def[1]) * this.tilesize,
                lvx = (def[2] - def[0]) * this.tilesize,
                lvy = (def[3] - def[1]) * this.tilesize,
                solid = def[4];
            var tx = x + vx + (lvy < 0 ? width : 0) - lx,
                ty = y + vy + (lvx > 0 ? height : 0) - ly;
            if (lvx * ty - lvy * tx > 0) {
                if (vx * -lvy + vy * lvx < 0) {
                    return solid;
                }
                var length = Math.sqrt(lvx * lvx + lvy * lvy);
                var nx = lvy / length,
                    ny = -lvx / length;
                var proj = tx * nx + ty * ny;
                var px = nx * proj,
                    py = ny * proj;
                if (px * px + py * py >= vx * vx + vy * vy) {
                    return true;
                }
                res.pos.x = x + vx - px;
                res.pos.y = y + vy - py;
                res.collision.slope = {
                    x: lvx,
                    y: lvy,
                    nx: nx,
                    ny: ny
                };
                return true;
            }
            return false;
        }
    });
    var H = 1 / 2,
        N = 1 / 3,
        M = 2 / 3,
        SOLID = true,
        NON_SOLID = false;
    ig.CollisionMap.defaultTileDef = {
        5: [0, 1, 1, M, SOLID],
        6: [0, M, 1, N, SOLID],
        7: [0, N, 1, 0, SOLID],
        3: [0, 1, 1, H, SOLID],
        4: [0, H, 1, 0, SOLID],
        2: [0, 1, 1, 0, SOLID],
        10: [H, 1, 1, 0, SOLID],
        21: [0, 1, H, 0, SOLID],
        32: [M, 1, 1, 0, SOLID],
        43: [N, 1, M, 0, SOLID],
        54: [0, 1, N, 0, SOLID],
        27: [0, 0, 1, N, SOLID],
        28: [0, N, 1, M, SOLID],
        29: [0, M, 1, 1, SOLID],
        25: [0, 0, 1, H, SOLID],
        26: [0, H, 1, 1, SOLID],
        24: [0, 0, 1, 1, SOLID],
        11: [0, 0, H, 1, SOLID],
        22: [H, 0, 1, 1, SOLID],
        33: [0, 0, N, 1, SOLID],
        44: [N, 0, M, 1, SOLID],
        55: [M, 0, 1, 1, SOLID],
        16: [1, N, 0, 0, SOLID],
        17: [1, M, 0, N, SOLID],
        18: [1, 1, 0, M, SOLID],
        14: [1, H, 0, 0, SOLID],
        15: [1, 1, 0, H, SOLID],
        13: [1, 1, 0, 0, SOLID],
        8: [H, 1, 0, 0, SOLID],
        19: [1, 1, H, 0, SOLID],
        30: [N, 1, 0, 0, SOLID],
        41: [M, 1, N, 0, SOLID],
        52: [1, 1, M, 0, SOLID],
        38: [1, M, 0, 1, SOLID],
        39: [1, N, 0, M, SOLID],
        40: [1, 0, 0, N, SOLID],
        36: [1, H, 0, 1, SOLID],
        37: [1, 0, 0, H, SOLID],
        35: [1, 0, 0, 1, SOLID],
        9: [1, 0, H, 1, SOLID],
        20: [H, 0, 0, 1, SOLID],
        31: [1, 0, M, 1, SOLID],
        42: [M, 0, N, 1, SOLID],
        53: [N, 0, 0, 1, SOLID],
        12: [0, 0, 1, 0, NON_SOLID],
        23: [1, 1, 0, 1, NON_SOLID],
        34: [1, 0, 1, 1, NON_SOLID],
        45: [0, 1, 0, 0, NON_SOLID]
    };
    ig.CollisionMap.staticNoCollision = {
        trace: function (x, y, vx, vy) {
            return {
                collision: {
                    x: false,
                    y: false,
                    slope: false
                },
                pos: {
                    x: x + vx,
                    y: y + vy
                },
                tile: {
                    x: 0,
                    y: 0
                }
            };
        }
    };
});

// lib/impact/background-map.js
ig.baked = true;
ig.module('impact.background-map').requires('impact.map', 'impact.image').defines(function () {
    ig.BackgroundMap = ig.Map.extend({
        tiles: null,
        scroll: {
            x: 0,
            y: 0
        },
        distance: 1,
        repeat: false,
        tilesetName: '',
        foreground: false,
        enabled: true,
        preRender: false,
        preRenderedChunks: null,
        chunkSize: 512,
        debugChunks: false,
        anims: {},
        init: function (tilesize, data, tileset) {
            this.parent(tilesize, data);
            this.setTileset(tileset);
        },
        setTileset: function (tileset) {
            this.tilesetName = tileset instanceof ig.Image ? tileset.path : tileset;
            this.tiles = new ig.Image(this.tilesetName);
            this.preRenderedChunks = null;
        },
        setScreenPos: function (x, y) {
            this.scroll.x = x / this.distance;
            this.scroll.y = y / this.distance;
        },
        preRenderMapToChunks: function () {
            var totalWidth = this.width * this.tilesize * ig.system.scale,
                totalHeight = this.height * this.tilesize * ig.system.scale;
            var chunkCols = Math.ceil(totalWidth / this.chunkSize),
                chunkRows = Math.ceil(totalHeight / this.chunkSize);
            this.preRenderedChunks = [];
            for (var y = 0; y < chunkRows; y++) {
                this.preRenderedChunks[y] = [];
                for (var x = 0; x < chunkCols; x++) {
                    var chunkWidth = (x == chunkCols - 1) ? totalWidth - x * this.chunkSize : this.chunkSize;
                    var chunkHeight = (y == chunkRows - 1) ? totalHeight - y * this.chunkSize : this.chunkSize;
                    this.preRenderedChunks[y][x] = this.preRenderChunk(x, y, chunkWidth, chunkHeight);
                }
            }
        },
        preRenderChunk: function (cx, cy, w, h) {
            var tw = w / this.tilesize / ig.system.scale + 1;
            th = h / this.tilesize / ig.system.scale + 1;
            var nx = (cx * this.chunkSize / ig.system.scale) % this.tilesize,
                ny = (cy * this.chunkSize / ig.system.scale) % this.tilesize;
            var tx = Math.floor(cx * this.chunkSize / this.tilesize / ig.system.scale),
                ty = Math.floor(cy * this.chunkSize / this.tilesize / ig.system.scale);
            var chunk = ig.$new('canvas');
            chunk.width = w;
            chunk.height = h;
            var oldContext = ig.system.context;
            ig.system.context = chunk.getContext("2d");
            for (var x = 0; x < tw; x++) {
                for (var y = 0; y < th; y++) {
                    if (x + tx < this.width && y + ty < this.height) {
                        var tile = this.data[y + ty][x + tx];
                        if (tile) {
                            this.tiles.drawTile(x * this.tilesize - nx, y * this.tilesize - ny, tile - 1, this.tilesize);
                        }
                    }
                }
            }
            ig.system.context = oldContext;
            return chunk;
        },
        draw: function () {
            if (!this.tiles.loaded || !this.enabled) {
                return;
            }
            if (this.preRender) {
                this.drawPreRendered();
            } else {
                this.drawTiled();
            }
        },
        drawPreRendered: function () {
            if (!this.preRenderedChunks) {
                this.preRenderMapToChunks();
            }
            var dx = ig.system.getDrawPos(this.scroll.x),
                dy = ig.system.getDrawPos(this.scroll.y);
            if (this.repeat) {
                dx %= this.width * this.tilesize * ig.system.scale;
                dy %= this.height * this.tilesize * ig.system.scale;
            }
            var minChunkX = Math.max(Math.floor(dx / this.chunkSize), 0),
                minChunkY = Math.max(Math.floor(dy / this.chunkSize), 0),
                maxChunkX = Math.ceil((dx + ig.system.realWidth) / this.chunkSize),
                maxChunkY = Math.ceil((dy + ig.system.realHeight) / this.chunkSize),
                maxRealChunkX = this.preRenderedChunks[0].length,
                maxRealChunkY = this.preRenderedChunks.length;
            if (!this.repeat) {
                maxChunkX = Math.min(maxChunkX, maxRealChunkX);
                maxChunkY = Math.min(maxChunkY, maxRealChunkY);
            }
            var nudgeY = 0;
            for (var cy = minChunkY; cy < maxChunkY; cy++) {
                var nudgeX = 0;
                for (var cx = minChunkX; cx < maxChunkX; cx++) {
                    var chunk = this.preRenderedChunks[cy % maxRealChunkY][cx % maxRealChunkX];
                    var x = -dx + cx * this.chunkSize - nudgeX;
                    var y = -dy + cy * this.chunkSize - nudgeY;
                    ig.system.context.drawImage(chunk, x, y);
                    ig.Image.drawCount++;
                    if (this.debugChunks) {
                        ig.system.context.strokeStyle = '#f0f';
                        ig.system.context.strokeRect(x, y, this.chunkSize, this.chunkSize);
                    }
                    if (this.repeat && chunk.width < this.chunkSize && x + chunk.width < ig.system.realWidth) {
                        nudgeX = this.chunkSize - chunk.width;
                        maxChunkX++;
                    }
                }
                if (this.repeat && chunk.height < this.chunkSize && y + chunk.height < ig.system.realHeight) {
                    nudgeY = this.chunkSize - chunk.height;
                    maxChunkY++;
                }
            }
        },
        drawTiled: function () {
            var tile = 0,
                anim = null,
                tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
                tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
                pxOffsetX = this.scroll.x % this.tilesize,
                pxOffsetY = this.scroll.y % this.tilesize,
                pxMinX = -pxOffsetX - this.tilesize,
                pxMinY = -pxOffsetY - this.tilesize,
                pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
                pxMaxY = ig.system.height + this.tilesize - pxOffsetY;
            for (var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
                var tileY = mapY + tileOffsetY;
                if (tileY >= this.height || tileY < 0) {
                    if (!this.repeat) {
                        continue;
                    }
                    tileY = tileY > 0 ? tileY % this.height : ((tileY + 1) % this.height) + this.height - 1;
                }
                for (var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize) {
                    var tileX = mapX + tileOffsetX;
                    if (tileX >= this.width || tileX < 0) {
                        if (!this.repeat) {
                            continue;
                        }
                        tileX = tileX > 0 ? tileX % this.width : ((tileX + 1) % this.width) + this.width - 1;
                    }
                    if ((tile = this.data[tileY][tileX])) {
                        if ((anim = this.anims[tile - 1])) {
                            anim.draw(pxX, pxY);
                        } else {
                            this.tiles.drawTile(pxX, pxY, tile - 1, this.tilesize);
                        }
                    }
                }
            }
        }
    });
});

// lib/impact/game.js
ig.baked = true;
ig.module('impact.game').requires('impact.impact', 'impact.entity', 'impact.collision-map', 'impact.background-map').defines(function () {
    ig.Game = ig.Class.extend({
        clearColor: '#000000',
        gravity: 0,
        screen: {
            x: 0,
            y: 0
        },
        _rscreen: {
            x: 0,
            y: 0
        },
        entities: [],
        namedEntities: {},
        collisionMap: ig.CollisionMap.staticNoCollision,
        backgroundMaps: [],
        backgroundAnims: {},
        autoSort: false,
        sortBy: null,
        cellSize: 64,
        _deferredKill: [],
        _levelToLoad: null,
        _doSortEntities: false,
        staticInstantiate: function () {
            this.sortBy = ig.Game.SORT.Z_INDEX;
            ig.game = this;
            return null;
        },
        loadLevel: function (data) {
            this.screen = {
                x: 0,
                y: 0
            };
            this.entities = [];
            this.namedEntities = {};
            for (var i = 0; i < data.entities.length; i++) {
                var ent = data.entities[i];
                this.spawnEntity(ent.type, ent.x, ent.y, ent.settings);
            }
            this.sortEntities();
            this.collisionMap = ig.CollisionMap.staticNoCollision;
            this.backgroundMaps = [];
            for (var i = 0; i < data.layer.length; i++) {
                var ld = data.layer[i];
                if (ld.name == 'collision') {
                    this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data);
                } else {
                    var newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
                    newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
                    newMap.repeat = ld.repeat;
                    newMap.distance = ld.distance;
                    newMap.foreground = !! ld.foreground;
                    newMap.preRender = !! ld.preRender;
                    this.backgroundMaps.push(newMap);
                }
            }
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].ready();
            }
        },
        loadLevelDeferred: function (data) {
            this._levelToLoad = data;
        },
        getEntityByName: function (name) {
            return this.namedEntities[name];
        },
        getEntitiesByType: function (type) {
            var entityClass = typeof (type) === 'string' ? ig.global[type] : type;
            var a = [];
            for (var i = 0; i < this.entities.length; i++) {
                var ent = this.entities[i];
                if (ent instanceof entityClass && !ent._killed) {
                    a.push(ent);
                }
            }
            return a;
        },
        spawnEntity: function (type, x, y, settings) {
            var entityClass = typeof (type) === 'string' ? ig.global[type] : type;
            if (!entityClass) {
                throw ("Can't spawn entity of type " + type);
            }
            var ent = new(entityClass)(x, y, settings || {});
            this.entities.push(ent);
            if (ent.name) {
                this.namedEntities[ent.name] = ent;
            }
            return ent;
        },
        sortEntities: function () {
            this.entities.sort(this.sortBy);
        },
        sortEntitiesDeferred: function () {
            this._doSortEntities = true;
        },
        removeEntity: function (ent) {
            if (ent.name) {
                delete this.namedEntities[ent.name];
            }
            ent._killed = true;
            ent.checkAgainst = ig.Entity.TYPE.NONE;
            ent.collides = ig.Entity.COLLIDES.NEVER;
            this._deferredKill.push(ent);
        },
        run: function () {
            this.update();
            this.draw();
        },
        update: function () {
            if (this._levelToLoad) {
                this.loadLevel(this._levelToLoad);
                this._levelToLoad = null;
            }
            if (this._doSortEntities || this.autoSort) {
                this.sortEntities();
                this._doSortEntities = false;
            }
            this.updateEntities();
            this.checkEntities();
            for (var i = 0; i < this._deferredKill.length; i++) {
                this.entities.erase(this._deferredKill[i]);
            }
            this._deferredKill = [];
            for (var tileset in this.backgroundAnims) {
                var anims = this.backgroundAnims[tileset];
                for (var a in anims) {
                    anims[a].update();
                }
            }
        },
        updateEntities: function () {
            for (var i = 0; i < this.entities.length; i++) {
                var ent = this.entities[i];
                if (!ent._killed) {
                    ent.update();
                }
            }
        },
        draw: function () {
            if (this.clearColor) {
                ig.system.clear(this.clearColor);
            }
            this._rscreen.x = Math.round(this.screen.x * ig.system.scale) / ig.system.scale;
            this._rscreen.y = Math.round(this.screen.y * ig.system.scale) / ig.system.scale;
            var mapIndex;
            for (mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++) {
                var map = this.backgroundMaps[mapIndex];
                if (map.foreground) {
                    break;
                }
                map.setScreenPos(this.screen.x, this.screen.y);
                map.draw();
            }
            this.drawEntities();
            for (mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++) {
                var map = this.backgroundMaps[mapIndex];
                map.setScreenPos(this.screen.x, this.screen.y);
                map.draw();
            }
        },
        drawEntities: function () {
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].draw();
            }
        },
        checkEntities: function () {
            var hash = {};
            for (var e = 0; e < this.entities.length; e++) {
                var entity = this.entities[e];
                if (entity.type == ig.Entity.TYPE.NONE && entity.checkAgainst == ig.Entity.TYPE.NONE && entity.collides == ig.Entity.COLLIDES.NEVER) {
                    continue;
                }
                var checked = {},
                    xmin = Math.floor(entity.pos.x / this.cellSize),
                    ymin = Math.floor(entity.pos.y / this.cellSize),
                    xmax = Math.floor((entity.pos.x + entity.size.x) / this.cellSize) + 1,
                    ymax = Math.floor((entity.pos.y + entity.size.y) / this.cellSize) + 1;
                for (var x = xmin; x < xmax; x++) {
                    for (var y = ymin; y < ymax; y++) {
                        if (!hash[x]) {
                            hash[x] = {};
                            hash[x][y] = [entity];
                        } else if (!hash[x][y]) {
                            hash[x][y] = [entity];
                        } else {
                            var cell = hash[x][y];
                            for (var c = 0; c < cell.length; c++) {
                                if (entity.touches(cell[c]) && !checked[cell[c].id]) {
                                    checked[cell[c].id] = true;
                                    ig.Entity.checkPair(entity, cell[c]);
                                }
                            }
                            cell.push(entity);
                        }
                    }
                }
            }
        }
    });
    ig.Game.SORT = {
        Z_INDEX: function (a, b) {
            return a.zIndex - b.zIndex;
        },
        POS_X: function (a, b) {
            return a.pos.x - b.pos.x;
        },
        POS_Y: function (a, b) {
            return a.pos.y - b.pos.y;
        }
    };
});

// lib/game/data/assets.js
ig.baked = true;
ig.module('game.data.assets').requires('impact.impact', 'impact.animation').defines(function () {
    Assets = ig.Class.extend({
        font: new ig.Font("media/fonts/kroeger06_55.png"),
        img_itemSlot: new ig.Image("media/gui/item-slot.png"),
        img_itemSlotSelected: new ig.Image("media/gui/item-slot-selected.png"),
        img_statusBarTrack: new ig.Image("media/gui/status-bar-track.png"),
        img_barMana: new ig.Image("media/gui/bar-mana.png"),
        img_barHealth: new ig.Image("media/gui/bar-health.png"),
        animSheet_human: new ig.AnimationSheet("media/actor/human.png", 20, 20),
        animSheet_hair_male1: new ig.AnimationSheet("media/actor/apparel/male-hair1.png", 20, 20),
        animSheet_hair_female1: new ig.AnimationSheet("media/actor/apparel/female-hair1.png", 20, 20),
        animSheet_robe: new ig.AnimationSheet("media/actor/apparel/robe.png", 20, 20),
        animSheet_hood: new ig.AnimationSheet("media/actor/apparel/hood.png", 20, 20),
        animSheet_shadow: new ig.AnimationSheet("media/actor/shadow.png", 12, 6),
        animSheet_potions: new ig.AnimationSheet("media/items/potions.png", 12, 12),
        animSheet_spells: new ig.AnimationSheet("media/items/spells.png", 12, 12),
        init: function () {}
    })
});

// lib/game/data/apparel.js
ig.baked = true;
ig.module('game.data.apparel').requires('impact.impact').defines(function () {
    Apparel = ig.Class.extend({
        type: "",
        animSheet: null,
        anims: {},
        init: function (type, animSheet) {
            this.type = type;
            this.animSheet = animSheet;
        },
        applyAnims: function (animDefs) {
            for (var i = 0, len = animDefs.length; i < len; ++i) {
                var def = animDefs[i];
                var name = def[0];
                var time = def[1];
                var sequence = def[2];
                var stop = def[3] || false;
                this.anims[name] = new ig.Animation(this.animSheet, time, sequence, stop);
            }
        }
    })
    Apparel.TYPE = {
        HAIR: "hair",
        BODY: "body",
        HEAD: "head"
    };
});

// lib/game/data/spells/spell.js
ig.baked = true;
ig.module('game.data.spells.spell').defines(function () {
    Spell = ig.Class.extend({
        castTime: 0,
        manaCost: 0,
        damage: 0,
        icon: null,
        particleData: null,
        init: function () {}
    });
});

// lib/game/entities/particles/particle.js
ig.baked = true;
ig.module('game.entities.particles.particle').requires('impact.entity').defines(function () {
    EntityParticle = ig.Entity.extend({
        collides: ig.Entity.COLLIDES.NEVER,
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        emitter: null,
        life: 2,
        _age: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
        },
        update: function () {
            this._age += ig.system.tick;
            if (this._age >= this.life) {
                ig.game.removeEntity(this);
            }
            this.parent();
        }
    });
});

// lib/game/data/effects/effect.js
ig.baked = true;
ig.module('game.data.effects.effect').defines(function () {
    Effect = ig.Class.extend({
        target: null,
        owner: null,
        type: "",
        init: function (target, owner) {
            this.target = target;
            this.owner = owner;
        },
        update: function () {},
        removeFromTarget: function () {
            if (this.target == null) return;
            this.target.removeEffect(this);
        }
    });
});

// lib/game/data/effects/timedeffect.js
ig.baked = true;
ig.module('game.data.effects.timedeffect').requires('game.data.effects.effect').defines(function () {
    TimedEffect = Effect.extend({
        _timer: null,
        init: function (target, owner) {
            this.parent(target, owner);
            this._timer = new ig.Timer();
        },
        update: function () {
            if (this._timer.delta() >= 0) {
                this.removeFromTarget();
                return;
            }
            this.execute();
        },
        execute: function () {}
    });
});

// lib/game/data/effects/drainhealth.js
ig.baked = true;
ig.module('game.data.effects.drainhealth').requires('game.data.effects.timedeffect').defines(function () {
    DrainHealthEffect = TimedEffect.extend({
        _amount: 0,
        _time: 0,
        init: function (target, owner, time, amount) {
            this.parent(target, owner);
            this.type = "drainHealth";
            this._amount = amount;
            this._time = time;
            this._timer.set(this._time);
        },
        execute: function () {
            if (this.target == null) return;
            this.target.receiveDamage(this._amount * ig.system.tick, this.owner);
        }
    });
});

// lib/game/entities/particles/emitter.js
ig.baked = true;
ig.module('game.entities.particles.emitter').requires('impact.entity').defines(function () {
    ParticleEmitter = ig.Class.extend({
        pos: {
            x: 0,
            y: 0
        },
        particleClass: null,
        emitAngleMin: 0,
        emitAngleMax: 0,
        emitStrengthMin: 100,
        emitStrengthMax: 100,
        emitterLife: 0,
        lifeMin: 2,
        lifeMax: 2,
        velMin: {
            x: 0,
            y: 0
        },
        velMax: {
            x: 200,
            y: 0
        },
        accelMin: {
            x: 0,
            y: 0
        },
        accelMax: {
            x: 0,
            y: 0
        },
        posOffsetMin: {
            x: 0,
            y: 0
        },
        posOffsetMax: {
            x: 0,
            y: 0
        },
        invertDir: false,
        customData: null,
        owner: null,
        _spawnTimer: null,
        _emitterLifeTimer: null,
        _dead: false,
        init: function (owner) {
            this.owner = owner;
            this._spawnTimer = new ig.Timer();
        },
        emit: function () {
            if (this._dead) return;
            if (this.emitterLife > 0) {
                if (this._emitterLifeTimer == null) this._emitterLifeTimer = new ig.Timer(this.emitterLife);
                if (this._emitterLifeTimer.delta() >= 0) {
                    this.died();
                    return;
                }
            }
            if (this._spawnTimer.delta() >= 0) {
                this._spawn();
                this._spawnTimer.reset();
            }
        },
        setParticleData: function (data) {
            for (var i in data) {
                switch (i) {
                case "class":
                    this.particleClass = data[i];
                    break;
                case "spawnTime":
                    this._spawnTimer.set(data[i]);
                    break;
                case "emitAngleMin":
                case "emitAngleMax":
                    var value = Number(data[i]);
                    if (value < 0) value += 360;
                    if (value > 360) value -= 360;
                    this[i] = value;
                default:
                    this[i] = data[i];
                    break;
                }
            }
        },
        died: function () {
            this._dead = true;
        },
        _spawn: function () {
            if (this.particleClass == null) return;
            var angleRad = Number(this.emitAngleMin + (this.emitAngleMax - this.emitAngleMin) * Math.random()).toRad();
            if (this.invertDir) angleRad -= 3.14159265;
            var dir = this.invertDir ? -1 : 1;
            var cos = Math.cos(angleRad);
            var sin = Math.sin(angleRad);
            var settings = {
                emitter: this,
                data: this.customData,
                life: this.lifeMin + (this.lifeMax - this.lifeMin) * Math.random(),
                pos: {
                    x: this.pos.x + (this.posOffsetMin.x + (this.posOffsetMax.x - this.posOffsetMin.x) * Math.random()) * dir,
                    y: this.pos.y + (this.posOffsetMin.y + (this.posOffsetMax.y - this.posOffsetMin.y) * Math.random()) * dir
                },
                vel: {
                    x: cos * (this.emitStrengthMin + (this.emitStrengthMax - this.emitStrengthMin) * Math.random()),
                    y: sin * (this.emitStrengthMax + (this.emitStrengthMax - this.emitStrengthMin) * Math.random())
                },
                accel: {
                    x: this.accelMin.x + (this.accelMax.x - this.accelMin.x) * Math.random(),
                    y: this.accelMin.y + (this.accelMax.y - this.accelMin.y) * Math.random()
                }
            }
            ig.game.spawnEntity(this.particleClass, settings.pos.x, settings.pos.y, settings);
        }
    });
});

// lib/game/entities/particles/flame.js
ig.baked = true;
ig.module('game.entities.particles.flame').requires('game.entities.particles.particle').defines(function () {
    EntityFlameParticle = EntityParticle.extend({
        animSheet: new ig.AnimationSheet("media/effects/spell-fireball.png", 20, 20),
        size: {
            x: 12,
            y: 14
        },
        offset: {
            x: 8,
            y: 3
        },
        maxVel: {
            x: 100,
            y: 100
        },
        friction: {
            x: 100,
            y: 0
        },
        gravityFactor: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim("burn", 0.1, [8]);
            this.currentAnim.gotoRandomFrame();
        },
        update: function () {
            var p = this._age / this.life;
            if (p < 0.5) this.currentAnim.alpha = p;
            else this.currentAnim.alpha = 1 - p;
            this.parent();
        }
    });
});

// lib/game/entities/emitters/burneffect.js
ig.baked = true;
ig.module('game.entities.emitters.burneffect').requires('game.entities.particles.emitter', 'game.entities.particles.flame').defines(function () {
    BurnEffect = ParticleEmitter.extend({
        target: null,
        init: function (target, owner, burnTime, damagePerSecond) {
            this.parent();
            this.target = target;
            this.damage = damagePerSecond;
            this.emitterLife = burnTime;
            this.setParticleData({
                class: EntityFlameParticle,
                spawnTime: 0.1,
                lifeMin: 0.25,
                lifeMax: 0.5,
                emitAngleMin: -90,
                emitAngleMax: -90,
                emitStrengthMin: 1,
                emitStrengthMax: 10,
                posOffsetMin: {
                    x: -2,
                    y: -3
                },
                posOffsetMax: {
                    x: 2,
                    y: 5
                },
                accelMin: {
                    x: 0,
                    y: -60
                },
                accelMax: {
                    x: 0,
                    y: -30
                }
            });
        },
        emit: function () {
            if (this.target != null) {
                this.pos.x = this.target.pos.x;
                this.pos.y = this.target.pos.y;
            }
            this.parent();
        },
        died: function () {
            if (this.target != null) {
                var i = this.target.emitters.indexOf(this);
                if (i >= -1) this.target.emitters.splice(i, 1);
                this.target = null;
            }
            this.parent();
        }
    });
});

// lib/game/data/effects/onfire.js
ig.baked = true;
ig.module('game.data.effects.onfire').requires('game.data.effects.drainhealth', 'game.entities.emitters.burneffect').defines(function () {
    OnFireEffect = DrainHealthEffect.extend({
        _emitter: null,
        init: function (target, owner, time, amount) {
            this.parent(target, owner, time, amount);
            this.type = "onFire";
            this._emitter = new BurnEffect(target, owner, time, amount);
        },
        execute: function () {
            this.parent();
            this._emitter.emit();
        }
    });
});

// lib/game/entities/particles/fireball.js
ig.baked = true;
ig.module('game.entities.particles.fireball').requires('game.entities.particles.particle', 'game.data.effects.onfire').defines(function () {
    EntityFireballParticle = EntityParticle.extend({
        animSheet: new ig.AnimationSheet("media/effects/spell-fireball.png", 20, 20),
        size: {
            x: 8,
            y: 10
        },
        offset: {
            x: 6,
            y: 5
        },
        maxVel: {
            x: 1000,
            y: 100
        },
        friction: {
            x: 200,
            y: 0
        },
        gravityFactor: 0,
        _flipped: false,
        _dead: false,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim("cast", 0.08, [0, 1, 2], true);
            this.addAnim("flight", 0.05, [3, 4]);
            this.addAnim("die", 0.10, [5, 5, 5, 6, 6, 6, 7, 7, 8], true);
            this._flipped = this.vel.x < 0;
        },
        update: function () {
            if (this._age > this.life * 0.5 || Math.abs(this.vel.x) < 1) {
                this.currentAnim = this.anims.die;
            } else if (this.currentAnim == this.anims.cast && this.currentAnim.loopCount == 1) {
                this.currentAnim = this.anims.flight;
                this.currentAnim.gotoRandomFrame();
            }
            if (this.currentAnim != null) this.currentAnim.flip.x = this._flipped;
            this.currentAnim.alpha = 1 - (this._age / this.life);
            this.parent();
        },
        check: function (other) {
            var owner = this.emitter.owner;
            if (this._dead || other == owner) return;
            this.vel.x = 0;
            this.vel.y = 0;
            if (other instanceof EntityActor) {
                var onFire = other.hasEffectOfType("onFire");
                var dmg = this.emitter.customData.damage * (onFire ? 1.25 : 1);
                other.receiveDamage(dmg, owner);
                var canBurn = !onFire && (this._age < this.life * 0.25) && Math.random() < 0.25;
                if (canBurn) {
                    other.addEffect(new OnFireEffect(other, owner, 3, dmg));
                }
                this._dead = true;
            }
        }
    });
});

// lib/game/data/spells/flames.js
ig.baked = true;
ig.module('game.data.spells.flames').requires('game.data.spells.spell', 'game.entities.particles.fireball').defines(function () {
    FlameSpell = Spell.extend({
        init: function () {
            this.manaCost = 20;
            this.castTime = 0.1;
            this.damage = 2;
            this.icon = new ig.Animation(ig.game.assets.animSheet_spells, 0.1, [0]);
            this.particleData = FlameSpell.particleData;
        }
    });
    FlameSpell.particleData = {
        class: EntityFireballParticle,
        spawnTime: 0.05,
        lifeMin: 1.6,
        lifeMax: 1.8,
        emitAngleMin: -1.5,
        emitAngleMax: 1.5,
        emitStrengthMin: 140,
        emitStrengthMax: 160,
        posOffsetMin: {
            x: 6,
            y: 0
        },
        posOffsetMax: {
            x: 6,
            y: 0
        },
        accelMin: {
            x: 0,
            y: -10
        },
        accelMax: {
            x: 0,
            y: 0
        }
    }
});

// lib/game/entities/particles/frostball.js
ig.baked = true;
ig.module('game.entities.particles.frostball').requires('game.entities.particles.fireball').defines(function () {
    EntityFrostballParticle = EntityFireballParticle.extend({
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim("cast", 0.08, [10, 11, 12], true);
            this.addAnim("flight", 0.05, [13, 14]);
            this.addAnim("die", 0.15, [15, 15, 15, 16, 16, 16, 17, 17, 18], true);
            this.currentAnim = this.anims.cast;
        },
        check: function (other) {
            var owner = this.emitter.owner;
            if (this._dead || other == owner) return;
            this.vel.x = 0;
            this.vel.y = 0;
            if (other instanceof EntityActor) {
                var dmg = this.emitter.customData.damage;
                other.receiveDamage(dmg, owner);
                this._dead = true;
            }
        }
    });
});

// lib/game/data/spells/frost.js
ig.baked = true;
ig.module('game.data.spells.frost').requires('game.data.spells.spell', 'game.entities.particles.frostball').defines(function () {
    FrostSpell = Spell.extend({
        init: function () {
            this.manaCost = 20;
            this.castTime = 0.1;
            this.damage = 2;
            this.icon = new ig.Animation(ig.game.assets.animSheet_spells, 0.1, [1]);
            this.particleData = FrostSpell.particleData;
        }
    });
    FrostSpell.particleData = {
        class: EntityFrostballParticle,
        spawnTime: 0.05,
        lifeMin: 1.6,
        lifeMax: 1.8,
        emitAngleMin: -1.5,
        emitAngleMax: 1.5,
        emitStrengthMin: 140,
        emitStrengthMax: 160,
        posOffsetMin: {
            x: 6,
            y: 0
        },
        posOffsetMax: {
            x: 6,
            y: 0
        },
        accelMin: {
            x: 0,
            y: -10
        },
        accelMax: {
            x: 0,
            y: 0
        }
    }
});

// lib/game/entities/particles/lightning.js
ig.baked = true;
ig.module('game.entities.particles.lightning').requires('game.entities.particles.particle').defines(function () {
    EntityLightningParticle = EntityParticle.extend({
        animSheet: new ig.AnimationSheet("media/effects/spell-fireball.png", 20, 20),
        size: {
            x: 20,
            y: 10
        },
        offset: {
            x: 0,
            y: 5
        },
        maxVel: {
            x: 1000,
            y: 100
        },
        friction: {
            x: 1500,
            y: 0
        },
        gravityFactor: 0,
        _flipped: false,
        _dead: false,
        _willFizzle: false,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim("cast", 0.01, [20, 21]);
            this.addAnim("flight", 0.05, [22, 23, 24, 25]);
            this.addAnim("fizzle", 0.1, [26, 27, 28, 29]);
            this.currentAnim = this.anims.cast;
            this.currentAnim.gotoRandomFrame();
            this._flipped = this.vel.x < 0;
            this._willFizzle = Math.random() < 0.25;
        },
        update: function () {
            if (this._willFizzle && (this._age > this.life * 0.25 || Math.abs(this.vel.x) < 1)) {
                this.currentAnim = this.anims.fizzle;
            } else if (this.currentAnim == this.anims.cast && this.currentAnim.loopCount == 1) {
                this.currentAnim = this.anims.flight;
                this.currentAnim.gotoRandomFrame();
            }
            if (this.currentAnim != null) this.currentAnim.flip.x = this._flipped;
            if (this.vel.x == 0) this._age = this.life;
            if (!this._willFizzle) {
                var t = this._age / this.life;
                this.currentAnim.alpha = -1 * t * t * t + 1;
            }
            this.parent();
        },
        check: function (other) {
            var owner = this.emitter.owner;
            if (this._dead || other == owner) return;
            this.vel.x = 0;
            this.vel.y = 0;
            if (other instanceof EntityActor) {
                var dmg = this.emitter.customData.damage;
                other.receiveDamage(dmg, owner);
                this._dead = true;
            }
        }
    });
});

// lib/game/data/spells/lightning.js
ig.baked = true;
ig.module('game.data.spells.lightning').requires('game.data.spells.spell', 'game.entities.particles.lightning').defines(function () {
    LightningSpell = Spell.extend({
        init: function () {
            this.manaCost = 20;
            this.castTime = 0.1;
            this.damage = 1;
            this.icon = new ig.Animation(ig.game.assets.animSheet_spells, 0.1, [2]);
            this.particleData = LightningSpell.particleData;
        }
    });
    LightningSpell.particleData = {
        class: EntityLightningParticle,
        spawnTime: 0.04,
        lifeMin: 0.19,
        lifeMax: 0.19,
        emitAngleMin: -4,
        emitAngleMax: 4,
        emitStrengthMin: 520,
        emitStrengthMax: 520,
        posOffsetMin: {
            x: 3,
            y: 0
        },
        posOffsetMax: {
            x: 3,
            y: 0
        },
        accelMin: {
            x: 0,
            y: 0
        },
        accelMax: {
            x: 0,
            y: 0
        }
    }
});

// lib/game/data/attributes.js
ig.baked = true;
ig.module('game.data.attributes').requires('impact.impact').defines(function () {
    Attributes = ig.Class.extend({
        health: 100,
        healthMin: 0,
        healthMax: 100,
        healthRegen: 20,
        mana: 100,
        manaMin: 0,
        manaMax: 100,
        manaRegen: 20,
        init: function () {
            this.mana = this.manaMax;
        },
        increment: function (attribute, amount) {
            if (isNaN(amount) || this[attribute] == undefined) return;
            var currValue = this[attribute];
            var newValue = currValue + amount;
            var minValue = this[attribute + "Min"];
            var maxValue = this[attribute + "Max"];
            if (minValue != undefined && newValue < minValue) newValue = minValue;
            if (maxValue != undefined && newValue > maxValue) newValue = maxValue;
            this[attribute] = newValue;
        }
    })
});

// lib/game/data/inventory.js
ig.baked = true;
ig.module('game.data.inventory').requires('impact.impact').defines(function () {
    Inventory = ig.Class.extend({
        _quickSlots: [],
        _numQuickSlots: 10,
        init: function () {},
        getQuickSlot: function (index) {
            if (index < 0 || index >= this._numQuickSlots) return null;
            return this._quickSlots[index];
        },
        setQuickSlot: function (index, item) {
            if (index < 0 || index >= this._numQuickSlots) return;
            this._quickSlots[index] = item;
        }
    })
});

// lib/game/entities/abstract/actor.js
ig.baked = true;
ig.module('game.entities.abstract.actor').requires('impact.entity', 'game.data.attributes', 'game.data.inventory').defines(function () {
    EntityActor = ig.Entity.extend({
        collides: ig.Entity.COLLIDES.PASSIVE,
        type: ig.Entity.TYPE.A,
        attributes: null,
        inventory: null,
        emitters: [],
        _apparelByType: {},
        _animDefinitions: [],
        _currentAnim: "",
        _dir: 1,
        _effects: [],
        _shadow: null,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.attributes = new Attributes();
            this.inventory = new Inventory();
            for (var i in settings) {
                if (this.attributes[i] == undefined) continue;
                this.attributes[i] = settings[i];
            }
            if (!ig.global.wm) {
                this._applyAnims(this.animSheet);
            } else {
                this.addAnim("wm", 0.1, [0]);
            }
        },
        update: function () {
            this.parent();
            for (var i in this._apparelByType) {
                var apparel = this._apparelByType[i];
                var anim = apparel.anims[this._currentAnim];
                anim.gotoFrame(this.currentAnim.frame);
                anim.flip.x = this.currentAnim.flip.x;
            }
            for (var i = 0, len = this._effects.length; i < len; i++) {
                var effect = this._effects[i];
                if (effect != null) effect.update();
            }
            for (var i = 0, len = this.emitters.length; i < len; ++i) {
                var emitter = this.emitters[i];
                if (emitter != null) emitter.emit();
            }
        },
        draw: function () {
            var px = this.pos.x - this.offset.x - ig.game.screen.x;
            var py = this.pos.y - this.offset.y - ig.game.screen.y;
            if (this._shadow != null) {
                var shadowY = 68 - ig.game.screen.y;
                this._shadow.draw(px + 4, shadowY);
            }
            this.parent();
            for (var i in Apparel.TYPE) {
                var apparel = this._apparelByType[Apparel.TYPE[i]];
                if (apparel == null) continue;
                var anim = apparel.anims[this._currentAnim];
                anim.draw(px, py);
            }
        },
        receiveDamage: function (amount, owner) {
            this.attributes.increment("health", -amount);
            if (this.attributes.health <= 0) {
                this.kill();
            }
        },
        addEffect: function (effect, applyEvenIfHasEffect) {
            if (applyEvenIfHasEffect == undefined) applyEvenIfHasEffect = false;
            if (!applyEvenIfHasEffect) {
                if (this.hasEffectOfType(effect.type)) return;
            }
            this._effects.push(effect);
        },
        removeEffect: function (effect) {
            var index = this._effects.indexOf(effect);
            if (index == -1) return;
            this._effects.splice(index, 1);
        },
        hasEffectOfType: function (effectType) {
            for (var i = 0, len = this._effects.length; i < len; i++) {
                var effect = this._effects[i];
                if (effect == null) continue;
                if (effect.type == effectType) return true;
            }
            return false;
        },
        setAnim: function (name, flipX, flipY) {
            this._currentAnim = name;
            this.currentAnim = this.anims[name];
            this.currentAnim.flip.x = flipX || this._dir == -1;
            this.currentAnim.flip.y = flipY || false;
        },
        hasEmitterOfType: function (emitterClass) {
            for (var i = 0, len = this.emitters.length; i < len; i++) {
                if (this.emitters[i] instanceof emitterClass) return true;
            }
            return false;
        },
        setDir: function (dir) {
            this._dir = dir < 0 ? -1 : 1;
            if (this.currentAnim != null) this.currentAnim.flip.x = this._dir == -1;
        },
        addShadow: function () {
            this._shadow = new ig.Animation(ig.game.assets.animSheet_shadow, 0.1, [0]);
        },
        addApparel: function (apparel) {
            this.removeApparel(apparel.type);
            this._apparelByType[apparel.type] = apparel;
        },
        removeApparel: function (type) {
            var apparel = this._apparelByType[type];
            if (apparel == null) return;
            this._apprelByType[type] = null;
        },
        _applyAnims: function (animSheet) {
            for (var i = 0, len = this._animDefinitions.length; i < len; ++i) {
                var def = this._animDefinitions[i];
                var name = def[0];
                var time = def[1];
                var sequence = def[2];
                var stop = def[3] || false;
                this.anims[name] = new ig.Animation(animSheet, time, sequence, stop);
            }
        }
    });
    EntityActor.humanAnimations = [
        ["normal-idle", 0.1, [0]],
        ["normal-walk", 0.15, [0, 1]],
        ["casting-idle", 0.1, [2]],
        ["casting-walk", 0.15, [2, 3]]
    ];
});

// lib/game/logic/spellcaster.js
ig.baked = true;
ig.module('game.logic.spellcaster').requires('game.data.spells.spell', 'game.entities.particles.emitter').defines(function () {
    SpellCaster = ig.Class.extend({
        owner: null,
        _casting: false,
        _castTimer: new ig.Timer(),
        _currentSpell: null,
        _emitter: new ParticleEmitter(),
        _penaltyTime: 0,
        init: function (owner) {
            this.owner = owner;
            this._emitter.owner = this.owner;
        },
        cast: function () {
            if (this._currentSpell == null) return;
            if (this._casting) {
                if (this.owner.attributes.mana > 0 && this._castTimer.delta() >= 0) {
                    this._emitter.invertDir = this.owner._dir == -1;
                    this._emitter.pos.x = this.owner.pos.x;
                    this._emitter.pos.y = this.owner.pos.y + 5;
                    this._emitter.emit();
                }
            } else {
                this._casting = true;
                if (this.owner.attributes.mana >= this._currentSpell.manaCost) {
                    this._castTimer.set(this._currentSpell.castTime + this._penaltyTime);
                    this._castTimer.reset();
                }
            }
            this.owner.attributes.increment("mana", -this._currentSpell.manaCost * ig.system.tick);
        },
        cancel: function () {
            this._castTimer.set(0);
            this._casting = false;
            this._penaltyTime = 0;
            this._emitter.owner = this.owner;
        },
        isCasting: function () {
            return this._casting;
        },
        getSpell: function () {
            return this._currentSpell;
        },
        setSpell: function (spell) {
            if (this._currentSpell == spell) return;
            var wasCasting = this._casting;
            this.cancel();
            this._currentSpell = spell;
            this._emitter.setParticleData(spell.particleData);
            this._emitter.customData = spell;
            if (wasCasting) this._penaltyTime = 0.5;
        }
    });
});

// lib/game/entities/player.js
ig.baked = true;
ig.module('game.entities.player').requires('game.entities.abstract.actor', 'game.data.spells.flames', 'game.data.spells.frost', 'game.logic.spellcaster').defines(function () {
    EntityPlayer = EntityActor.extend({
        name: "player",
        animSheet: new ig.AnimationSheet("media/actor/human.png", 20, 20),
        size: {
            x: 10,
            y: 18
        },
        offset: {
            x: 5,
            y: 2
        },
        friction: {
            x: 400,
            y: 0
        },
        maxVel: {
            x: 70,
            y: 100
        },
        spellCaster: null,
        init: function (x, y, settings) {
            this._animDefinitions = EntityActor.humanAnimations;
            this.parent(x, y, settings);
            if (!ig.global.wm) {
                this.attributes.mana = this.attributes.manaMax = 500;
                this.attributes.manaRegen = 50;
                var robe = new Apparel(Apparel.TYPE.BODY, ig.game.assets.animSheet_robe);
                robe.applyAnims(this._animDefinitions);
                this.addApparel(robe);
                var hood = new Apparel(Apparel.TYPE.HEAD, ig.game.assets.animSheet_hood);
                hood.applyAnims(this._animDefinitions);
                this.addApparel(hood);
                var hair = new Apparel(Apparel.TYPE.HAIR, ig.game.assets.animSheet_hair_female1);
                hair.applyAnims(this._animDefinitions);
                this.addApparel(hair);
                this.setAnim("normal-idle");
                this.addShadow();
                this.inventory.setQuickSlot(0, new LightningSpell());
                this.inventory.setQuickSlot(1, new FlameSpell());
                this.inventory.setQuickSlot(2, new FrostSpell());
                this.spellCaster = new SpellCaster(this);
                this.spellCaster.setSpell(this.inventory.getQuickSlot(0));
            }
        },
        update: function () {
            var action = "normal";
            var attacking = false;
            if (ig.input.state("attack")) {
                attacking = true;
                action = "casting";
                this.spellCaster.cast();
            } else {
                this.spellCaster.cancel();
            }
            if (ig.input.state("jump") && this.standing) {
                this.vel.y = -200;
            }
            if (ig.input.state("left")) {
                this.accel.x = -300;
                this.setAnim(action + "-walk");
                this.setDir(-1);
            } else if (ig.input.state("right")) {
                this.accel.x = 300;
                this.setAnim(action + "-walk");
                this.setDir(1);
            } else {
                this.accel.x = 0;
                this.setAnim(action + "-idle");
            }
            if (!this.spellCaster.isCasting()) {
                this.attributes.increment("mana", this.attributes.manaRegen * ig.system.tick);
            }
            this.parent();
        }
    });
});

// lib/game/entities/particles/damagenumber.js
ig.baked = true;
ig.module('game.entities.particles.damagenumber').requires('game.entities.particles.particle').defines(function () {
    EntityDamageNumber = EntityParticle.extend({
        _canvas: ig.$new("canvas"),
        _textWidth: 0,
        gravityFactor: 0.25,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this._drawText();
        },
        update: function () {
            this.parent();
        },
        _drawText: function () {
            var context = this._canvas.getContext("2d");
            this._canvas.width = 50;
            this._canvas.height = 20;
            var strDmg = "-" + this.data;
            with(context) {
                clearRect(0, 0, this._canvas.width, this._canvas.height);
                if (this.data > 0) {
                    strokeStyle = "#000000";
                    fillStyle = "#CC0000";
                    font = "bold 12px Arial";
                    textBaseline = "top";
                    lineWidth = 3;
                    strokeText(strDmg, 0, 0);
                    fillText(strDmg, 0, 0);
                    this._textWidth = measureText(strDmg).width;
                }
            }
        },
        draw: function () {
            if (this.data > 0) {
                var px = ig.system.getDrawPos(this.pos.x + this._textWidth * 0.25 - ig.game.screen.x);
                var py = ig.system.getDrawPos(this.pos.y - ig.game.screen.y);
                ig.system.context.globalAlpha = 1 - (this._age / this.life);
                ig.system.context.drawImage(this._canvas, px, py);
                ig.system.context.globalAlpha = 1.0;
                this.parent();
            }
        }
    });
});

// lib/game/entities/emitters/damagegizmo.js
ig.baked = true;
ig.module('game.entities.emitters.damagegizmo').requires('game.entities.particles.emitter', 'game.entities.particles.damagenumber').defines(function () {
    DamageGizmo = ParticleEmitter.extend({
        damage: 0,
        init: function (owner) {
            this.parent(owner);
            this.setParticleData({
                class: EntityDamageNumber,
                spawnTime: 0.15,
                lifeMin: 1.0,
                lifeMax: 1.0,
                emitAngleMin: -110,
                emitAngleMax: -70,
                emitStrengthMin: 50,
                emitStrengthMax: 50,
                posOffsetMin: {
                    x: 0,
                    y: -6
                },
                posOffsetMax: {
                    x: 0,
                    y: -6
                },
                accelMin: {
                    x: 0,
                    y: 0
                },
                accelMax: {
                    x: 0,
                    y: 0
                }
            });
        },
        emit: function () {
            if (this.damage <= 0) return;
            this.pos.x = this.owner.pos.x;
            this.pos.y = this.owner.pos.y;
            this.customData = this.damage.floor();
            this.parent();
            this.damage = 0;
        }
    });
});

// lib/game/entities/abstract/enemy.js
ig.baked = true;
ig.module('game.entities.abstract.enemy').requires('game.entities.abstract.actor', 'game.entities.emitters.damagegizmo').defines(function () {
    EntityEnemy = EntityActor.extend({
        _damageGizmo: null,
        _damageAccum: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this._damageGizmo = new DamageGizmo(this);
            this.emitters.push(this._damageGizmo);
        },
        receiveDamage: function (amount, owner) {
            this.parent(amount, owner);
            this._damageAccum += amount;
            if (this._damageAccum >= 1) {
                this._damageGizmo.damage = this._damageAccum;
                this._damageAccum = 0;
            } else {
                this._damageGizmo.damage = 0;
            }
        }
    });
});

// lib/game/entities/skeleton.js
ig.baked = true;
ig.module('game.entities.skeleton').requires('game.entities.abstract.enemy').defines(function () {
    EntitySkeleton = EntityEnemy.extend({
        animSheet: new ig.AnimationSheet("media/actor/human.png", 20, 20),
        size: {
            x: 10,
            y: 18
        },
        offset: {
            x: 5,
            y: 2
        },
        friction: {
            x: 400,
            y: 0
        },
        maxVel: {
            x: 70,
            y: 100
        },
        init: function (x, y, settings) {
            this._animDefinitions = EntityActor.humanAnimations;
            this.parent(x, y, settings);
            if (!ig.global.wm) {
                this.setAnim("normal-idle");
                this.addShadow();
            }
        }
    });
});

// lib/game/gui/statusbar.js
ig.baked = true;
ig.module('game.gui.statusbar').requires('impact.impact').defines(function () {
    StatusBar = ig.Class.extend({
        maxValue: 100,
        value: 100,
        barImage: null,
        _trackImage: null,
        init: function () {
            this.trackImage = ig.game.assets.img_statusBarTrack;
        },
        draw: function (x, y) {
            this.trackImage.draw(x, y);
            if (this.barImage != null) {
                var offset = 1;
                var fillWidth = this.barImage.width * (this.value / this.maxValue);
                if (fillWidth >= 1) this.barImage.draw(x + offset, y + offset, 0, 0, fillWidth)
            }
        }
    })
});

// lib/game/gui/itemslot.js
ig.baked = true;
ig.module('game.gui.itemslot').requires('impact.impact').defines(function () {
    ItemSlot = ig.Class.extend({
        _image: null,
        _imageSelected: null,
        _font: null,
        item: null,
        selected: false,
        width: 16,
        height: 16,
        quantity: 1,
        init: function () {
            this._image = ig.game.assets.img_itemSlot;
            this._imageSelected = ig.game.assets.img_itemSlotSelected;
            this._font = ig.game.assets.font;
        },
        draw: function (x, y) {
            if (this.selected) this._imageSelected.draw(x, y);
            else this._image.draw(x, y);
            if (this.item != null) {
                this.item.icon.draw(x + 2, y + 2);
            }
            if (this.quantity > 1) {
                this._font.draw(this.quantity, x + this._image.width - 1, y + this._image.height - this._font.height + 2, ig.Font.ALIGN.RIGHT);
            }
        }
    })
});

// lib/game/gui/gui.js
ig.baked = true;
ig.module('game.gui.gui').requires('impact.impact', 'game.gui.statusbar', 'game.gui.itemslot').defines(function () {
    GUI = ig.Class.extend({
        player: null,
        manaBar: null,
        healthBar: null,
        _numQuickSlots: 10,
        _quickSlots: [],
        _slotSpacing: 0,
        _positions: {},
        init: function () {
            this.manaBar = new StatusBar();
            this.manaBar.width = 50;
            this.manaBar.height = 4;
            this.manaBar.barImage = ig.game.assets.img_barMana;
            this._positions.manaBar = {
                x: ig.system.width * 0.5 - this.manaBar.width - 1,
                y: 2
            };
            this.healthBar = new StatusBar();
            this.healthBar.width = this.manaBar.width;
            this.healthBar.height = this.manaBar.height;
            this.healthBar.barImage = ig.game.assets.img_barHealth;
            this._positions.healthBar = {
                x: ig.system.width * 0.5 + 1,
                y: this._positions.manaBar.y
            };
            for (var i = 0; i < this._numQuickSlots; i++) {
                var slot = new ItemSlot();
                this._quickSlots.push(slot);
            }
            ig.input.bind(ig.KEY._1, "quick1");
            ig.input.bind(ig.KEY._2, "quick2");
            ig.input.bind(ig.KEY._3, "quick3");
            ig.input.bind(ig.KEY._4, "quick4");
            ig.input.bind(ig.KEY._5, "quick5");
            ig.input.bind(ig.KEY._6, "quick6");
            ig.input.bind(ig.KEY._7, "quick7");
            ig.input.bind(ig.KEY._8, "quick8");
            ig.input.bind(ig.KEY._9, "quick9");
            ig.input.bind(ig.KEY._0, "quick10");
            ig.input.bind(ig.KEY.Z, "cycleSpell1");
            ig.input.bind(ig.KEY.C, "cycleSpell2");
        },
        update: function () {
            this.healthBar.maxValue = this.player.attributes.healthMax;
            this.healthBar.value = this.player.attributes.health;
            this.manaBar.maxValue = this.player.attributes.manaMax;
            this.manaBar.value = this.player.attributes.mana;
            if (ig.input.pressed("quick1")) this._activateSlot(0);
            if (ig.input.pressed("quick2")) this._activateSlot(1);
            if (ig.input.pressed("quick3")) this._activateSlot(2);
            if (ig.input.pressed("quick4")) this._activateSlot(3);
            if (ig.input.pressed("quick5")) this._activateSlot(4);
            if (ig.input.pressed("quick6")) this._activateSlot(5);
            if (ig.input.pressed("quick7")) this._activateSlot(6);
            if (ig.input.pressed("quick8")) this._activateSlot(7);
            if (ig.input.pressed("quick9")) this._activateSlot(8);
            if (ig.input.pressed("quick10")) this._activateSlot(9);
            if (ig.input.pressed("cycleSpell1")) this._cycleSpells(-1);
            if (ig.input.pressed("cycleSpell2")) this._cycleSpells(1);
        },
        updateQuickSlots: function () {
            for (var i = 0, len = this._quickSlots.length; i < len; ++i) {
                var slot = this._quickSlots[i];
                slot.item = this.player.inventory.getQuickSlot(i);
                slot.selected = false;
                if (slot.item instanceof Spell) {
                    if (this.player.spellCaster.getSpell() == slot.item) {
                        slot.selected = true;
                    }
                }
            }
        },
        draw: function () {
            for (var i in this._positions) {
                var target = this[i];
                if (target == null) continue;
                var pos = this._positions[i];
                target.draw(pos.x, pos.y);
            }
            var slotAreaWidth = this._quickSlots.length * (this._quickSlots[0].width + this._slotSpacing) - this._slotSpacing;
            var tx = Math.floor((ig.system.width - slotAreaWidth) * 0.5);
            var ty = Math.floor(ig.system.height - this._quickSlots[0].height - 2);
            for (var i = 0, len = this._quickSlots.length; i < len; ++i) {
                var slot = this._quickSlots[i];
                slot.draw(tx, ty);
                tx += Math.floor(slot.width + this._slotSpacing);
            }
        },
        _activateSlot: function (slotNum) {
            var slot = this._quickSlots[slotNum];
            if (slot == null || slot.item == null) return;
            if (slot.item instanceof Spell) {
                this.player.spellCaster.setSpell(slot.item);
            }
            this.updateQuickSlots();
        },
        _cycleSpells: function (dir) {
            var currIndex = 0;
            for (var i = 0, len = this._quickSlots.length; i < len; ++i) {
                if (this._quickSlots[i].item == this.player.spellCaster.getSpell()) {
                    currIndex = i;
                    break;
                }
            }
            for (var c = 0, i = currIndex + dir, len = this._quickSlots.length; c < len; c++, i += dir) {
                if (i < 0) i = len - 1;
                else if (i >= len) i = 0;
                var item = this._quickSlots[i].item;
                if (item instanceof Spell) {
                    this._activateSlot(i);
                    break;
                }
            }
        }
    })
});

// lib/game/levels/test.js
ig.baked = true;
ig.module('game.levels.test').requires('impact.image', 'game.entities.player', 'game.entities.skeleton').defines(function () {
    LevelTest = {
        "entities": [{
            "type": "EntityPlayer",
            "x": 117,
            "y": 54
        }, {
            "type": "EntitySkeleton",
            "x": 244,
            "y": 52,
            "settings": {
                "health": 50
            }
        }],
        "layer": [{
            "name": "walls",
            "width": 6,
            "height": 1,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/tiles/walls-rocks.gif",
            "repeat": false,
            "preRender": true,
            "distance": "1",
            "tilesize": 80,
            "foreground": false,
            "data": [
                [3, 2, 2, 3, 2, 1]
            ]
        }, {
            "name": "wall_deco",
            "width": 6,
            "height": 1,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "media/tiles/walls-deco-veg.png",
            "repeat": false,
            "preRender": true,
            "distance": "1",
            "tilesize": 80,
            "foreground": false,
            "data": [
                [0, 2, 1, 0, 2, 4]
            ]
        }, {
            "name": "collision",
            "width": 60,
            "height": 10,
            "linkWithCollision": false,
            "visible": 1,
            "tilesetName": "",
            "repeat": false,
            "preRender": false,
            "distance": 1,
            "tilesize": 8,
            "foreground": false,
            "data": [
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }]
    };
    LevelTestResources = [new ig.Image('media/tiles/walls-rocks.gif'), new ig.Image('media/tiles/walls-deco-veg.png')];
});

// lib/game/main.js
ig.baked = true;
ig.module('game.main').requires('impact.game', 'impact.font', 'game.data.assets', 'game.data.apparel', 'game.data.spells.flames', 'game.data.spells.frost', 'game.data.spells.lightning', 'game.entities.player', 'game.entities.skeleton', 'game.entities.particles.emitter', 'game.gui.gui', 'game.levels.test').defines(function () {
    BitDungeon = ig.Game.extend({
        assets: null,
        gui: null,
        paused: false,
        init: function () {
            this.assets = new Assets();
            this.gui = new GUI();
            ig.input.bind(ig.KEY.LEFT_ARROW, "left");
            ig.input.bind(ig.KEY.RIGHT_ARROW, "right");
            ig.input.bind(ig.KEY.UP_ARROW, "jump");
            ig.input.bind(ig.KEY.X, "attack");
            ig.input.bind(ig.KEY.SPACE, "spawn");
            this.gravity = 400;
            this.loadLevel(LevelTest);
            this.gui.player = this.getEntityByName("player");
            this.gui.updateQuickSlots();
        },
        update: function () {
            if (this.paused) return;
            this.parent();
            this.gui.update();
            var player = this.getEntityByName("player");
            this.screen.x = player.pos.x - ig.system.width * 0.5;
            if (ig.input.pressed("spawn")) {
                var bgMap = this.backgroundMaps[0];
                var px = 40 + (bgMap.width * bgMap.tilesize * Math.random() - 80);
                ig.game.spawnEntity(EntitySkeleton, px, 40, {
                    health: 50 + 50 * Math.random()
                });
            }
        },
        draw: function () {
            if (this.paused) return;
            this.parent();
            this.gui.draw();
        }
    });
});

