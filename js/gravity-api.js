/*
 * Class Orientation
 * based on the code from http://www.pjhome.net/web/Orientation.html
 * changed by ray
 *
 * Usage:
 *   var ori = new Orientation(function(alpha, beta, gamma) {
 *      // the callback function which deals with the gravity variation
 *      // parameters

 *      // the alpha axis is perpendicular to the screen and points to the front
 *      // the beta axis is perpendicular to the groud
 *      // the gamma axis is parallel to the screen and points to the right side
 *   
 *   });
 */
function Orientation(handler) {
    this.handler = handler;
    var self = this;
    this.orientationListener = function(evt) {
        // For FF3.6
        if (!evt.gamma && !evt.beta) {
            // angle=radian*180.0/PI 在firefox中x和y是弧度值,
            evt.gamma = (evt.x * (180 / Math.PI)); //转换成角度值,
            evt.beta = (evt.y * (180 / Math.PI)); //转换成角度值
            evt.alpha = (evt.z * (180 / Math.PI)); //转换成角度值
        }
        if(evt.accelerationIncludingGravity){
            gamma = event.accelerationIncludingGravity.x * 10
            beta = -event.accelerationIncludingGravity.y * 10
            alpha = event.accelerationIncludingGravity.z * 10
        }
        
        var gamma = evt.gamma;
        var beta = evt.beta;
        var alpha = evt.alpha;
        self.handler(alpha, beta, gamma);
    }
}

Orientation.prototype.init = function(){
    window.addEventListener('deviceorientation', this.orientationListener, false);
    window.addEventListener('MozOrientation', this.orientationListener, false);
    window.addEventListener('devicemotion', this.orientationListener, false);
}