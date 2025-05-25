const yocoSDK = new window.YocoSDK({
    publicKey: 'pk_test_ed3c54a6gOol69qa7f45'
});

$('.popup-button').click(() => {
    const amountInRands = parseFloat($('#popup-amount').val());
    if (isNaN(amountInRands) || amountInRands <= 0) {
        $('.status-message').html('Please enter a valid amount.');
        return;
    }
    const amountInCents = amountInRands * 100;

    yocoSDK.showPopup({
        currency: 'ZAR',
        amountInCents: amountInCents,
        name: 'Lance',
        callback: response => {
            if (response.error) {
                $('.status-message').html(response.error.message);
            } else {
                fetch('/pay', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: response.id, amountInCents })
                })
                .then(res => res.json())
                .then(data => {
                    $('.status-message').html(data.status || data.displayMessage);
                })
                .catch(error => {
                    $('.status-message').html(error.message);
                });
            }
        }
    });
});