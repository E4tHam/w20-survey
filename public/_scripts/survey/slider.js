
/* slider.js */


hasSlider                   = true;
const BreadthSliderMin =
      (DATA_SET=="independent") ? 3
    : (DATA_SET=="correlated")  ? 1
    : NaN;
const BreadthSliderMax =
      (DATA_SET=="independent") ? 8
    : (DATA_SET=="correlated")  ? 5
    : NaN;
const BreadthSliderStart    = BreadthSliderMin;
const SliderStep            = 0.001;
const SliderDiv             = document.getElementById("SliderDiv");
const BreadthSlider         = document.getElementById("BreadthSlider");
const CostSlider            = document.getElementById("CostSlider");
const SliderCostSpan        = document.getElementById("SliderCostSpan");
const SliderBreadthSpan     = document.getElementById("SliderBreadthSpan");
const SliderTimeUnitSpan    = document.getElementById("SliderTimeUnitSpan");
const BreadthSliderMinSpan  = document.getElementById("BreadthSliderMinSpan");
const BreadthSliderMaxSpan  = document.getElementById("BreadthSliderMaxSpan");
const CostSliderMinSpan     = document.getElementById("CostSliderMinSpan");
const CostSliderMaxSpan     = document.getElementById("CostSliderMaxSpan");

SliderDiv.setAttribute("style","");
SliderTimeUnitSpan.innerHTML
    = (DATA_SET=="independent") ? "draw"
    : (DATA_SET=="correlated")  ? "second"
    : "";

BreadthSlider.min           = BreadthSliderMin;
BreadthSlider.max           = BreadthSliderMax;
BreadthSlider.value         = BreadthSliderStart;
BreadthSlider.step          = SliderStep;

CostSlider.min              = costOf(BreadthSliderMin);
CostSlider.max              = costOf(BreadthSliderMax);
CostSlider.value            = clamp(costOf(BreadthSliderMin), costOf(BreadthSliderStart), costOf(BreadthSliderMax));
CostSlider.step             = SliderStep;

BreadthSliderMinSpan.innerHTML = parseFloat(BreadthSlider.min).toFixed(2);
BreadthSliderMaxSpan.innerHTML = parseFloat(BreadthSlider.max).toFixed(2);
CostSliderMinSpan.innerHTML = parseFloat(CostSlider.min).toFixed(2);
CostSliderMaxSpan.innerHTML = parseFloat(CostSlider.max).toFixed(2);

var BreadthSlider_current = parseFloat( BreadthSlider.value );
var CostSlider_current = parseFloat( CostSlider.value );

SliderBreadthSpan.innerHTML     = BreadthSliderStart.toFixed(2);
SliderCostSpan.innerHTML        = costOf(BreadthSliderStart).toFixed(2);


Actions[ "BreadthSliderRecord" ]    = new Object();
Actions[ "CostSliderRecord" ]       = new Object();


function enable_Sliders() {
    BreadthSlider.disabled = false;
    BreadthSlider.style.opacity = 1;
    CostSlider.disabled = false;
    CostSlider.style.opacity = 1;
}
function disable_Sliders() {
    BreadthSlider.disabled = false;
    BreadthSlider.style.opacity = 0.5;
    CostSlider.disabled = false;
    CostSlider.style.opacity = 0.5;
}

function handle_BreadthSlider() {
    BreadthSlider_current = parseFloat( BreadthSlider.value );
    let new_cost = costOf( BreadthSlider_current );
    new_cost = clamp( parseFloat(CostSlider.min), new_cost, parseFloat(CostSlider.max) );
    CostSlider_current = new_cost;
    CostSlider.value = CostSlider_current;
    handle_Sliders();
}

function handle_CostSlider() {
    CostSlider_current = parseFloat( CostSlider.value );
    let new_breadth = breadthOf( CostSlider_current );
    new_breadth = clamp( parseFloat(BreadthSlider.min), new_breadth, parseFloat(BreadthSlider.max) );
    BreadthSlider_current = new_breadth;
    BreadthSlider.value = BreadthSlider_current;
    handle_Sliders();
}


let BreadthSlider_recent = NaN;

function handle_Sliders() {

    SliderBreadthSpan.innerHTML = BreadthSlider_current.toFixed(2);
    SliderCostSpan.innerHTML = CostSlider_current.toFixed(2);

    if ( BreadthSlider_current == BreadthSlider_recent || isNaN(frame) )
        return;

    BreadthSlider_recent = BreadthSlider_current;

    // console.log(`frame: ${frame}, BreadthSlider_current: ${BreadthSlider_current}, CostSlider_current: ${CostSlider_current}`);
    Actions[ "BreadthSliderRecord" ][ frame ] = BreadthSlider_current;
    Actions[ "CostSliderRecord" ][ frame ] = CostSlider_current;

    if ( DATA_SET == "independent" ) {
        slider_scalar = BreadthSlider_current;
    }
    else if ( DATA_SET == "correlated" ) {
        slider_speed = BreadthSlider_current;
    }
}
