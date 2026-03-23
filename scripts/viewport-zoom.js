(function () {
  var PHONE_ZOOM = .72; // scale factor for screens narrower than 640px
  var w = screen.width;
  if (w < 640) {
    document.querySelector('meta[name="viewport"]').content =
      'width=' + Math.round(w / PHONE_ZOOM) + ',initial-scale=' + PHONE_ZOOM + ',maximum-scale=' + PHONE_ZOOM;
  }
})();
