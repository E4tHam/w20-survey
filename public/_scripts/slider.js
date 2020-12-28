
/* slider.js */


const Slider                = document.getElementById("Slider");

Actions[ "SliderRecord" ]   = new Object();


function handle_Slider() {
    scalar = parseInt( Slider.value );
    Actions[ "SliderRecord" ][ frame ] = scalar;
}
