// The whole client-side story: one countdown, display only.
// The gate itself is enforced in POST /learn/continue — this just makes the
// wait read as intentional rather than broken, and keeps the player's
// elapsed/total figures moving while you read.
(function () {
  var gate = document.querySelector('[data-gate]');
  if (!gate) return;

  var total = parseInt(gate.getAttribute('data-total'), 10) || 0;
  var remaining = parseInt(gate.getAttribute('data-remaining'), 10) || 0;

  var label = document.querySelector('[data-countdown]');
  var button = document.querySelector('[data-gate-button]');
  var elapsed = document.querySelector('[data-elapsed]');
  var bar = document.querySelector('[data-progress]');

  function clock(s) {
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function render() {
    var done = Math.max(0, total - remaining);

    if (elapsed) elapsed.textContent = clock(done);
    if (bar) bar.style.width = (total > 0 ? Math.min(100, (done / total) * 100) : 100) + '%';

    if (label) {
      label.textContent =
        remaining > 0 ? 'Available in ' + clock(remaining) : 'You can continue when you are ready.';
    }
    if (button) button.disabled = remaining > 0;
  }

  render();
  if (remaining <= 0) return;

  var timer = setInterval(function () {
    remaining -= 1;
    render();
    if (remaining <= 0) clearInterval(timer);
  }, 1000);
})();
