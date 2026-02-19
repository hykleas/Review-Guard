// Popup script
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['pending_review'], (result) => {
    const statusDiv = document.getElementById('status');
    if (result.pending_review) {
      statusDiv.className = 'status success';
      statusDiv.textContent = 'Yorum hazır - Google Maps\'te otomatik doldurulacak';
    } else {
      statusDiv.className = 'status info';
      statusDiv.textContent = 'Hazır - Yorum bekleniyor...';
    }
  });
});
