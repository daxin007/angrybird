//------Créer une scène de jeu

//---Créer une scène de jeu

var GameScene = cc.Scene.extend({
    // entree de le scene
    onEnter: function () {
        this._super();

        var layer = new GameLayer();
        layer.init();
        //alert("welcome to our game");
        this.addChild(layer);

    }
});

//---Créer un layer de jeu
var GameLayer = cc.Layer.extend({
    birdSprite: null,  //le bird
    isDraggingSling: false,  // si la corde est-elle tirée
    birdStartPos: cc.p(260, 440.5),  // la position initiale
    slingRadius: {
        min: 20,
        max: 80
    },  // la longueur de la corde
    slingAngle: {
        min: cc.DEGREES_TO_RADIANS(250),
        max: cc.DEGREES_TO_RADIANS(500)
    },  // tous les angles
    smokeDistance: 16,
    lastSmoke: null,
    slingRubber1: null,
    slingRubber2: null,
    slingRubber3: null,
    // charger les images
    getTexture: function (name) {
        return cc.TextureCache.getInstance().addImage('img/' + name + '.png');
    },
    //--- ajouter les sprite
    addObject: function (desc) {
        var sprite = cc.Sprite.createWithTexture(this.getTexture(desc.name));  // creer un sprite
        //---Définition des propriétés de sprite
        sprite.setAnchorPoint(desc.anchor || cc.p(0.5, 0.5));
        sprite.setScaleX(desc.scaleX || desc.scale || 1);
        sprite.setScaleY(desc.scaleY || desc.scale || 1);
        sprite.setRotation(desc.rotation || 0);
        sprite.setPosition(cc.p(desc.x || 0, desc.y || 0));
        //--- creer body dans box2d
        desc.shape && b2.enablePhysicsFor({
            type: desc.type,
            shape: desc.shape,
            sprite: sprite,
            radius: desc.radius,
            density: desc.density,  //密度
            userData: desc.userData
        });

        this.addChild(sprite, desc.z || 0);
        return sprite;
    },
    init: function () {
        this._super();
        this.removeAllChildrenWithCleanup(true);
        this.setTouchEnabled(true);
        // Chargement des fichiers json
        // different niveaux
        var niveau=document.getElementById("niveau");
        var filename="level"+niveau.value+".json";
    // --xml request
    let xhr;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();  //Navigateur général
    } else if (window.ActiveXObject) {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");  //Internet Explorer
    }
    xhr.open("GET", filename,false); // Chargement asynchrone
    xhr.send(null);
    var t=xhr.responseText;
    var o=eval(t);  //Parser les données
    var winSize=cc.Director.getInstance().getWinSize(); // taille de l'ecran
    var self=this;
        //Initialiser le monde physique
        b2.initWorld();

        // background
        var bgSprite = this.addObject({
            name: "bg",
            scaleY: 1.0,
            anchor: cc.p(0, 0),
            z: -1
        }); 

        // ground
        var groundSprite = this.addObject({
            name: "ground",
            scaleX: 2.5,
            anchor: cc.p(0, 0),
            type: "static",
            shape: "box",
            density: 0
        });
        // platforme
        var platformSprite = this.addObject({
            name: "platform",
            y: 30,
            scale: 1.5,
            anchor: cc.p(0, 0),
            type: "static",
            shape: "box",
            density: 0
        });
        //--- sling
        var sling1Sprite = this.addObject({
            name: "sling1",
            x: 284.5,
            y: 319.5,
            scale: 0.7,
            anchor: cc.p(1, 0)
        });
        var sling2Sprite = this.addObject({
            name: "sling2",
            x: 268.5,
            y: 376.5,
            scale: 0.7,
            anchor: cc.p(1, 0),
            z: 3  // Priorité pour l'affichage
        });
        // Sortez la valeur de le fichier json et la ajouter dans le layer
        for(var i=0;i<o.length;i++)
        {
            if(o[i].shape=="box")
            {
            o[i].userData=new BodyUserData(GameObjectRoll.Wood, 200);
        }
        else
            {
            o[i].userData=new BodyUserData(GameObjectRoll.Enemy, 400);
        }
            this.addObject(o[i]);
        } 
        //--- bird sprite
        this.birdSprite = this.addObject({
            name: "bird",
            x: 100,
            y: 345,
            z: 1
        });
        // rubber dans le sling
        this.slingRubber1 = this.addObject({
            name: "sling3",
            x: 278,
            y: 436,
            scaleY: 0.7,
            scaleX: 0,
            anchor: cc.p(1, 0.5),
            z: 0
        });
        this.slingRubber2 = this.addObject({
            name: "sling3",
            x: 250,
            y: 440,
            scaleY: 0.7,
            scaleX: 0,
            anchor: cc.p(1, 0.5),
            z: 2
        });
        this.slingRubber3 = null;  // Affectation dans le fonction onTouchesBegan
        // --- chosir le niveau
        var ok=document.getElementById("ok");
        ok.addEventListener('click', function () {
        self.init();
    });
        // -- recharger
        var recharger=document.getElementById("recharger");
        recharger.addEventListener('click', function () {
        self.init();
    });
         // Définir le score, tuer un ennemi, ajouter 100 points
        var scoreLabel = cc.LabelTTF.create("0", "fantasy", 20, cc.size(0, 0), cc.TEXT_ALIGNMENT_LEFT);
        scoreLabel.setPosition(cc.p(winSize.width - 80, winSize.height));
        scoreLabel.schedule(function () {
            var showingScore = parseInt(scoreLabel.getString());  // changer a int
            if (showingScore < b2.getUserScore()) {
                scoreLabel.setString((showingScore + 100).toString()); // changer le vitesse de affichage
            }
        });
        this.addChild(scoreLabel);   

        // ---beginning
if(!this.birdSprite.isDead)
{
        var action = cc.Spawn.create(cc.RotateBy.create(1.5, 360), cc.JumpTo.create(1.5, this.birdStartPos, 100, 1));  //Action simultanée
        this.birdSprite.runAction(action);  // bird saute sur le sling, premier action

        this.scheduleUpdate();  // Appelez "update ()" à chaque image 
    }
    },
    //Mettre à jour chaque image
    update: function () {
        // ---Simuler de scènes
        b2.simulate();
        // --- afficher le trajectoire de cible
        if (this.birdSprite.body) {
            var bData = this.birdSprite.body.GetUserData();
            if (!bData || bData.isContacted) return;
            // -- la position de bird
            var birdPos = this.birdSprite.getPosition(),
                vector = cc.pSub(birdPos, (this.lastSmoke && this.lastSmoke.getPosition()) || cc.p(0, 0)),
                length = cc.pLength(vector);
            // -- creer le sprite bird
            if (length >= this.smokeDistance) {
                this.lastSmoke = this.addObject({
                    name: "smoke",
                    x: birdPos.x,
                    y: birdPos.y,
                    scale: 0.8
                });
            }
        }
    },
    //---Commencer le contact le rubber  
    onTouchesBegan: function (touch, evt) {
        //---Affectation le slingRubber3 et le afficher
        var currPoint = touch[0].getLocation(),
            vector = cc.pSub(this.birdStartPos, currPoint);
    
        if ((this.isDraggingSling = (cc.pLength(vector) < this.slingRadius.max)) && !this.birdSprite.body && !this.slingRubber3) {
            this.slingRubber3 = this.addObject({
                name: "sling3",
                x: currPoint.x,
                y: currPoint.y,
                scaleY: 1.5,
                scaleX: 2,
                anchor: cc.p(0, 0.5),
                z: 1
            });
        } 
    },
    //--- bouger dans le rubber
    onTouchesMoved: function (touch, evt) {
        //Actualiser le position de bird
        if (!this.isDraggingSling || this.birdSprite.body) return;

        var currPoint = touch[0].getLocation(),
            vector = cc.pSub(currPoint, this.birdStartPos),
            radius = cc.pLength(vector),
            angle = cc.pToAngle(vector);
        //--- changer l'angle et le radius
        angle = angle < 0 ? (Math.PI * 2) + angle : angle;       
        radius=Math.min(this.slingRadius.max, Math.max(radius, this.slingRadius.min));
        if (angle <= this.slingAngle.max && angle >= this.slingAngle.min) {
            radius = this.slingRadius.min;
        }  
        // Réinitialiser la position
        this.birdSprite.setPosition(cc.pAdd(this.birdStartPos, cc.p(radius * Math.cos(angle), radius * Math.sin(angle))));
        // Actualiser le rubber
        var updateRubber = function (rubber, to) {  // "to" reprensent le nouveau position
            var from = rubber.getPosition(),
                rubberVec = cc.pSub(to, from),
                rubberAng = cc.pToAngle(rubberVec),
                rubberDeg = cc.RADIANS_TO_DEGREES(rubberAng),
                length = cc.pLength(rubberVec) + 8;
            rubber.setRotation(-rubberDeg);
            rubber.setScaleX(-(length / rubber.getContentSize().width));
            rubber.setScaleY(1.1 - ((0.7 / this.slingRadius.max) * length));
            // Actualiser le rubber3
            this.slingRubber3.setRotation(-rubberDeg);
            this.slingRubber3.setPosition(cc.pAdd(from, cc.p((length) * Math.cos(rubberAng), (length) * Math.sin(rubberAng))));
             
        }.bind(this);  //绑定当前函数

        var rubberToPos = this.birdSprite.getPosition();
        updateRubber(this.slingRubber2, rubberToPos);
        updateRubber(this.slingRubber1, rubberToPos);
        // meme scale
        this.slingRubber1.setScaleY(this.slingRubber2.getScaleY());
    },
    // Relâchez la souris, et finir le contact avec rubber
    onTouchesEnded: function () {
        

        if (!this.birdSprite.body && this.isDraggingSling) {
            //  Faire disparaître le rubber
            this.slingRubber1.setVisible(false);
            this.slingRubber2.setVisible(false);
            this.slingRubber3.setVisible(false);

           // ajouter le nouveau bird dans le world
           b2.enablePhysicsFor({
                type: "dynamic",
                shape: "circle",
                sprite: this.birdSprite,
                density: 15,  //密度
                restitution: 0.4,  //恢复
                userData: new BodyUserData(GameObjectRoll.Bird, 250)
            }); 
            
            var vector = cc.pSub(this.birdStartPos, this.birdSprite.getPosition()),
                impulse = cc.pMult(vector, 12),
                bPos = this.birdSprite.body.GetWorldCenter();
            // Appliquer une impulsion à un point. Cela modifie immédiatement la vitesse.
            this.birdSprite.body.ApplyImpulse(impulse, bPos);

            this.isDraggingSling = false;
        }
    }
    
});

// Structure de données de different role
var BodyUserData = function (objectRoll, fullHealth) {
    var self = this,
        currentHealth = fullHealth||200;  // Santé des objets, seulement utile pour "enemy", plus haut, plus difficile de le tuer  

    this.isDead = false;  // si mort ou pas
    this.isContacted = false; // si contacted ou pas
    //--- rendre le role
    this.getObjectRoll = function () {
        return objectRoll;
    };
    // fullhealth
    this.getFullHealth = function () {
        return fullHealth;
    };
    // vrais health
    this.getHealth = function () {
        return self.currentHealth;
    };
    // destuire l'objet
    this.damage = function (impulse) {
        this.isDead = ((currentHealth -= impulse) <= 0);
    };
}

// trois rolls 
var GameObjectRoll = {
    Wood: "Wood!",     //Obstacles
    Enemy: "ENEMY!",   // cible
    Bird: "BIRD!"      // engine
};
Object.freeze(GameObjectRoll); // ne changer pas




