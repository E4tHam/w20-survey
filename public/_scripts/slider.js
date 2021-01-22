
/* slider.js */


hasSlider                   = true;
const Slider                = document.getElementById("Slider");

Actions[ "SliderRecord" ]   = new Object();



function handle_Slider() {

    let slider_value = parseInt( Slider.value );

    Actions[ "SliderRecord" ][ frame ] = slider_value;

    if ( DATA_SET == "independent" ) {
        slider_scalar = slider_value;
    }
    else if ( DATA_SET == "correlated" ) {
        slider_speed = slider_value;
    }
}
