//------Entrée de programme
var cocos2dApp = cc.Application.extend({
    config: document.querySelector('#cocos2d-html5')['c'],
    //---Constructeur  
    ctor: function (scene) {
        this._super();
        this.startScene = scene;
        //cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
        cc.setup(this.config['tag']); //canvas
        //--- cc.Loader est un API utilisé pour charger des ressources
        cc.Loader.getInstance().onloading = function () {
            cc.LoaderScene.getInstance().draw();
        }; 
        cc.Loader.getInstance().onload = function () {
            cc.AppController.shareAppController().didFinishLaunchingWithOptions();
        }; 

         cc.Loader.getInstance().preload(images);  //préchargement de ressources, images est dans imgs.js
    },
    //---Initialisation de l'application
    applicationDidFinishLaunching: function () {
        var director = cc.Director.getInstance(); //Initialisation de le director
        //director.setDisplayStats(this.config['showFPS']);
        director.setAnimationInterval(1.0 / this.config['frameRate']);
        director.runWithScene(new this.startScene()); //Démarrer le moteur

        return true;
    }
});
// jeu commence !!
var game = new cocos2dApp(GameScene);