// Wires up the "Play in full screen" / "Exit full screen" buttons on
// #lesson-player. Owns nothing about the gate timer — your existing app.js
// keeps doing that via data-gate / data-elapsed / data-progress. This file
// only owns entering and leaving fullscreen, and it is deliberately small
// enough to sit next to that script rather than inside it.
(function () {
  const player = document.getElementById('lesson-player');
  if (!player) return;

  const enterBtn = document.getElementById('lesson-fullscreen-enter');
  const exitBtn = document.getElementById('lesson-fullscreen-exit');

  function requestFullscreen() {
    const request =
      player.requestFullscreen ||
      player.webkitRequestFullscreen || // Safari
      player.msRequestFullscreen; // old Edge
    if (request) request.call(player);
  }

  function exitFullscreen() {
    const exit =
      document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exit) exit.call(document);
  }

  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  function onFullscreenChange() {
    const active = isFullscreen();
    if (enterBtn) enterBtn.classList.toggle('hidden', active);
    if (exitBtn) {
      exitBtn.classList.toggle('hidden', !active);
      exitBtn.classList.toggle('flex', active);
    }
  }

  if (enterBtn) enterBtn.addEventListener('click', requestFullscreen);
  if (exitBtn) exitBtn.addEventListener('click', exitFullscreen);

  ['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'].forEach((evt) =>
    document.addEventListener(evt, onFullscreenChange),
  );
})();