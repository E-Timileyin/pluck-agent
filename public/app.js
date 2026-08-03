// The whole client-side story: one countdown, display only.
// The gate itself is enforced in POST /learn/continue — this just makes the
// wait read as intentional rather than broken.
(function () {
  var label = document.querySelector('[data-countdown]');
  var button = document.querySelector('[data-gate-button]');
  if (!label) return;

  var remaining = parseInt(label.getAttribute('data-countdown'), 10) || 0;

  function clock(s) {
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function render() {
    if (remaining > 0) {
      label.textContent = 'Available in ' + clock(remaining);
      if (button) button.disabled = true;
    } else {
      label.textContent = 'You can continue when you are ready.';
      if (button) button.disabled = false;
    }
  }

  render();
  if (remaining <= 0) return;

  var timer = setInterval(function () {
    remaining -= 1;
    render();
    if (remaining <= 0) clearInterval(timer);
  }, 1000);
})();
