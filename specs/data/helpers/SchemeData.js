"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var e = document.createElement('img');
    e.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABgCAIAAABaGO0eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAo9JREFUeNrsmuFxgkAQRjWTBmxBS9AStAQtQUrQErAELSGUoCVACVIClmC+4SY7DCqjmZNc4L0fxkGEy75j2T0ZDAD6zND9uV6vxKLt0A+HCEAAAhCAAAQgAAEIQAACEAAIQAAgAAGAAAQAAhAACEAAIAABgAAEAAIQAAhAACAAAYAABIAfAQMT4Ivj8fiL0czn81e//mgA+/1+vV7rgHZkEcdxmqZeRugLd9jPLs2pJEmiKLpcLtWNp9PJXs/n83g8DmrM/gWMRiObfbeBENPpVPvUPtXGu5Pu+fMeDgdF38awXC5drHXeLMtkRadwWzyO0BvX92PnUgZ4MoM9f3BNbfuW8k9RFLUdvkq8jJAUdIfdbufeaOLrHnC7g7aHOfKPbghQkgk80H0RcJu7EdAGVtuYCQS0ilU1uhnUylAEtIEqH/dG0Z9MJlZQIqAlVKRb8SMHixJ1Bv/mHwizD2ggjuO7ixC1m7DuDdrzti0Ipw/oyBVgiShNU0tHIs/z7XarpJQkSZhjDroR0+RtyDmPyiFdB5vNRhFXCpIAl5RWq5VbpCMFvWUp4hFSWE1KzacmBflHl4KiaQ5sxYIqqNUCyVKZytPQuoTuC6gtEIXWKvdCQMgLRL0Q4Gqh2qIFAtpDrUCY0e+OgNlspgqnOtNtWSKKIuvCVBTRiL3AYrFovrW6xir7QTNdjdi0xG2vlj2qhQK8AoIW0LyoadFUiHWbdYHOS2oLD/pUbXCYP5Z14TdhmSiKQkF314FM6FVBd49B6DXcFQiejPvL0PNoIgIQgAAEIAABCEAAAhCAAEAAAgABCAAEIAAQgABAAAIAAQgABCAAEIAAQAACAAEIAAQgABCAAEBABwQA9JtvAQYAjHQPgnvkJhsAAAAASUVORK5CYII=';
    e.onload = t.step_func_done(function(evt) {
        loadComplete(defProperties, e, evt);
    });
    e.onerror = e.onload;
    document.body.appendChild(e);
}
function loadComplete(defProperties, e, evt) {
    var eTarget = evt.target;
    test(function() {
        assert_equals(eTarget, e, 'onload target must be original image element');
    },  defProperties.expandedName + '-target-matches');
    test(function() {
        assert_true('naturalWidth' in eTarget, 'image element must have naturalWidth property');
        assert_equals(eTarget.naturalWidth, 128, 'natural width of loaded image must match');
    },  defProperties.expandedName + '-width-matches');
    test(function() {
        assert_true('naturalHeight' in eTarget, 'image element must have naturalHeight property');
        assert_equals(eTarget.naturalHeight, 96, 'natural height of loaded image must match');
    },  defProperties.expandedName + '-height-matches');
}
