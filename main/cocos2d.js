(function () {
    
    var c = {
        box2d: true,   //utliser la bibiotheque box2d
        tag: 'canvas',
        engine: './cocos2d/cocos2dx.min.js',  //engine
        appFiles: ['imgs.js', 'physical.js', 'game.js']
    };
    window.addEventListener('load', function () {
        var s = document.createElement('script');
        s.src = c.engine;
        document.body.appendChild(s);
        c.frameRate=60; //60 images par secondes
        s.c = c;
        s.id = 'cocos2d-html5'; // version est cocos2d-html5
    });
})();
