/**{modularIdentifer}-start*/
.icon-{com}-{modularIdentifer}-max {
    background-image: url(../{path}/{icon}-{max}{suffix});
}
.icon-{com}-{modularIdentifer}-min {
    background-image:url( ../{path}/{icon}-{min}{suffix}) !important;
}
.icon-{com}-{modularIdentifer}-max-ie6 {
    background-image: none;
    filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{path}/{icon}-{max}{suffix}', sizingMethod='scale');
}
.icon-{com}-{modularIdentifer}-min-ie6 {
    background-image: none;
    filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{path}/{icon}-{min}{suffix}', sizingMethod='scale');
}
/**{modularIdentifer}-end*/