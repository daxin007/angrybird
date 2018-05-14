var images = function () {
    
    var fin_imgs = [],
    imgs = ["bg", "platform", "bird","bird_1", "enemy","enemy1", "sling1", "sling2", "sling3", "ground", "wood1", "wood2", "smoke"];   
    // Les images que nous devons utiliser, il y a certain images que nous n'utilisons pas.
    for (var i = 0; i < imgs.length; i++) {
        fin_imgs.push({
            type: "image",
            src: 'img/' + imgs[i] + '.png'
        });
    }
    return fin_imgs;
}();