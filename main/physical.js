//------Définir les actions physiques
//---Prédéfini
var //Tous les effets physiques doivent être simulés dans le b2World
    b2World = Box2D.Dynamics.b2World,
    b2WorldManifold = Box2D.Collision.b2WorldManifold,
    //b2Body est le corps rigide de notre physique, une fois créé, la forme ne changera pas.
    b2Body = Box2D.Dynamics.b2Body,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    //C'est une relation qui attache une forme à un objet.
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    //---La b2shape est attachée à l'appareil et a des propriétés telles que le "friction" et la "restitution".
    //---Il est principalement utilisé pour la détection de collision.
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef,
    b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2Shape = Box2D.Collision.Shapes.b2Shape,
    //---Opérations mathématiques
    b2Math = Box2D.Common.Math.b2Math,
    b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2Vec3 = Box2D.Common.Math.b2Vec3,
    //---contacter et collision
    b2Collision = Box2D.Collision.b2Collision,
    b2ContactListener = Box2D.Dynamics.b2ContactListener,
    b2Distance = Box2D.Collision.b2Distance,
    b2DistanceProxy = Box2D.Collision.b2DistanceProxy,
    b2Point = Box2D.Collision.b2Point,
    Features = Box2D.Collision.Features;
 
// --- rendre un Système physique
var b2 = (function () {
    var self = this,
        deadsCount = 0,  //nombre de mort
        userScore = 0,  //score de user
        world,  //b2world
        bodies = [],   //sprits
        PTMRatio = 30.0, //pixel to meter, foi 30.
        // pour calcule dans box2d
        toWorld = function (n) {
            return n / PTMRatio;
        },
        // pour afficher
        toScreen = function (n) {
            return n * PTMRatio;
        },
        //角度转弧度
        b2AngleToCCRotation = function (n) {
            return (-1 * cc.RADIANS_TO_DEGREES(n));
        },
        CCRotationToB2Angle = function (n) {
            return cc.DEGREES_TO_RADIANS(-1 * n);
        };
    //---Écouteur d'événement
    var contactListener = new b2ContactListener();
    //-- commencer a contacter
    contactListener.BeginContact = function (contact) {
        var bodyA = contact.GetFixtureA().GetBody(),
            bodyB = contact.GetFixtureB().GetBody(),
            bAData = bodyA.GetUserData(),
            bBData = bodyB.GetUserData();
        //--- changer isContacted a vrais
        var setContacted = function (data) {
            data && (data.isContacted = true);
        };

        setContacted(bAData);
        setContacted(bBData);
    }; 
    //-- apres le collision
    contactListener.PostSolve = function (contact, impulse) {
        var bodyA = contact.GetFixtureA().GetBody(),
            bodyB = contact.GetFixtureB().GetBody(),
            bAData = bodyA.GetUserData(),
            bBData = bodyB.GetUserData();

        var imp0 = impulse.normalImpulses[0];
        //console.log(img0);
        if (imp0 <= 2) return; // éviter les petites impulsions
        //--- Détruit après une collision
        var damage = function (bodyData) {
            if (!bodyData || (bodyData.getHealth() == bodyData.getFullHealth())) return;
            //console.log(img0);
            var objRoll = bodyData.getObjectRoll();
            if (objRoll === GameObjectRoll.Enemy  ) {
                bodyData.damage(imp0);
            }
            /*else if (objRoll === GameObjectRoll.Bird  ) {
                
                setTimeout(function(){bodyData.damage(imp0);},5000);
            } */
        };

        damage(bAData);
        damage(bBData);
    };  

    return {
        // pour calcule dans box2d
        toWorld: function (n) {
            return n / PTMRatio;
        },
        // pour afficher
        toScreen: function (n) {
            return n * PTMRatio;
        },
        // Initialisation le world
        initWorld: function () {
            deadsCount = userScore = 0;
            world = new b2World(new b2Vec2(0,-10), true);  // Gravité vers le bas, valeur 10
            world.SetContinuousPhysics(true);
            world.SetContactListener(contactListener);  // ajouter l'Écouteur d'événement
            bodies = [];
        },
        // Obtenir des points
        getUserScore: function () {
            return userScore;
        },
        // creer l'objet "body", et le ajouter dans l'ensemble des bodies, toutes dans l'ensemble sont objet dans box2d
        enablePhysicsFor: function (desc) {
            var bodyDef = new b2BodyDef(),  // creer body
            //---Définition des propriétés de body
                scale = {
                    x: desc.sprite.getScaleX(),
                    y: desc.sprite.getScaleY()
                },
                anch = desc.sprite.getAnchorPointInPoints(),
                anchPoint = cc.p(anch.x * scale.x, anch.y * scale.y),
                position = desc.sprite.getPosition(),
                contentSize = desc.sprite.getContentSize(),
                size = {
                    width: contentSize.width * scale.x,
                    height: contentSize.height * scale.y
                },
                center = cc.p(position.x - anchPoint.x + size.width / 2, position.y - anchPoint.y + size.height / 2);
            //bodyDef.type = desc.type;
            // definir est-ce que le body peut bouger ou pas
            bodyDef.type = desc.type === "static" ? b2Body.b2_staticBody : desc.type === "dynamic" ? b2Body.b2_dynamicBody : b2Body.b2_kinematicBody;
            
            bodyDef.position.Set(toWorld(center.x), toWorld(center.y));
            bodyDef.angle = CCRotationToB2Angle(desc.sprite.getRotation());

            var fixDef = new b2FixtureDef();  // creer fixture, et le attacher dans body
            //---Définition des propriétés de body
            switch (desc.shape) {
            case "circle":
                fixDef.shape = new b2CircleShape(toWorld(desc.radius || (size.height / 2)));
                break;
            case "box":
                fixDef.shape = new b2PolygonShape();
                fixDef.shape.SetAsBox(toWorld(size.width) / 2, toWorld(size.height) / 2);
                break;
            }

            fixDef.density = desc.density || 1;   //密度
            fixDef.friction = desc.friction || 0.5;  //摩擦
            fixDef.restitution = desc.restitution || 0.1; //恢复

            var body = world.CreateBody(bodyDef);  // ajoute body dans le world
            body.CreateFixture(fixDef); //ajoute fixture dans le body

            desc.userData && body.SetUserData(desc.userData);

            body.sprite = desc.sprite;
            desc.sprite.body = body;

            bodies.push(body);  // ajouter dans l'ensemble de bodies
        },
        //--- Simuler de vraies scènes de mouvement
        simulate: function () {
            world.Step(1/60, // pas de temps fixe, changer le vitesse
            10, // itérations de vitesse
            10); // positionner les itérations

            

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i],
                    bodyData = body.GetUserData(),
                    bPos = body.GetPosition(),
                    bAngle = body.GetAngle();

                if (bodyData && bodyData.isDead) {
                    world.DestroyBody(body);  // enleve le body

                    userScore = (++deadsCount) * 100;  // calculer le score
                    body.sprite.runAction(cc.FadeOut.create(0.5)); //淡出
                    //setTimeout(alert("you win"),10000);
                    //alert("you win");
                    body.SetUserData(null);

                    continue;
                }

                var scale = {
                    x: body.sprite.getScaleX(),
                    y: body.sprite.getScaleY()
                },
                anch = body.sprite.getAnchorPointInPoints(),
                anchPoint = cc.p(anch.x * scale.x, anch.y * scale.y),
                position = body.sprite.getPosition(),
                contentSize = body.sprite.getContentSize(),
                size = {
                        width: contentSize.width * scale.x,
                        height: contentSize.height * scale.y
                    };

                body.sprite.setPosition(cc.p(toScreen(bPos.x) + anchPoint.x - size.width / 2, toScreen(bPos.y) + anchPoint.y - size.height / 2));
                body.sprite.setRotation(b2AngleToCCRotation(bAngle));
            }

            world.ClearForces();  //enleve toute les forces
        }
       
    };
}());