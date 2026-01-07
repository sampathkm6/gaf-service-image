document.addEventListener('DOMContentLoaded', () => {
    const packages = document.querySelectorAll('.package-card');
    const totalPriceEl = document.querySelector('.total-price');
    const originalPriceEl = document.querySelector('.original-price');
    const savingsEl = document.querySelector('.savings');
    const followersTextEl = document.querySelector('#followers-count tspan'); // Select the tspan inside the text
    const plusOneContainer = document.getElementById('plus-one-container');

    // Summary line items
    const summaryTextMain = document.getElementById('summary-text-main');
    const summaryPrice = document.getElementById('summary-price');
    const summaryDiscount = document.getElementById('summary-discount');

    // Base followers on the card
    const baseFollowers = 242; // 242
    let currentFollowers = baseFollowers;

    // Function to create floating +1 symbols
    function createPlusOne() {
        const plusOne = document.createElement('div');
        plusOne.className = 'plus-one';
        plusOne.textContent = '+1';

        // Random position before (left of) the follower count area
        const randomX = 38 + (Math.random() * 4 - 2); // Position left of count, around 36-40%
        const randomY = 35 + (Math.random() * 4 - 2); // Start from top, around 33-37%

        plusOne.style.left = randomX + '%';
        plusOne.style.top = randomY + '%';

        plusOneContainer.appendChild(plusOne);

        // Remove after animation completes
        setTimeout(() => {
            plusOne.remove();
        }, 1000);
    }

    // Helper to format numbers (e.g. 5800 -> 5.8k)
    function formatFollowers(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }

    // Animation function
    function animateFollowers(startValue, endValue, duration) {
        let startTimestamp = null;
        const animatedBorder = document.getElementById('animated-border');
        const profileBase = document.getElementById('profile-image-base');
        const profileActive = document.getElementById('profile-image-active');
        const arrow = document.getElementById('Arrow 1');

        if (animatedBorder) animatedBorder.classList.add('animating');

        // Reset to base image and hide arrow instantly at start of animation
        if (profileBase) profileBase.style.opacity = '1';
        if (profileActive) profileActive.style.opacity = '0';
        if (arrow) arrow.style.transform = 'scaleY(0)';

        // Cross-fade to active image and grow arrow halfway through
        setTimeout(() => {
            if (profileBase) profileBase.style.opacity = '0';
            if (profileActive) profileActive.style.opacity = '1';
            if (arrow) arrow.style.transform = 'scaleY(1)';
        }, duration * 0.6);

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (endValue - startValue) + startValue);

            followersTextEl.textContent = formatFollowers(value);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                followersTextEl.textContent = formatFollowers(endValue);
                currentFollowers = endValue;
                if (animatedBorder) {
                    // Slight delay before removing to make it feel smoother
                    setTimeout(() => {
                        animatedBorder.classList.remove('animating');
                    }, 500);
                }
            }
        };
        window.requestAnimationFrame(step);
    }

    // Handle package click
    packages.forEach(pkg => {
        pkg.addEventListener('click', () => {
            // Remove active from all
            packages.forEach(p => p.classList.remove('active'));
            // Add active to clicked
            pkg.classList.add('active');

            // Get Data
            const followers = parseInt(pkg.dataset.followers);
            const price = parseFloat(pkg.dataset.price);
            const discountStr = pkg.dataset.discount || '0%';
            const discountVal = parseFloat(discountStr) / 100;

            // Update Price Display
            totalPriceEl.textContent = '$' + price.toFixed(2);

            // Calculate Original Price (Price is the discounted one?)
            // Usually "Price" is what you pay.
            // If Discount is 25%, and Pay is 16.
            // Original = 16 / (1 - 0.25) = 21.33

            let originalPrice = 0;
            if (discountVal > 0) {
                originalPrice = price / (1 - discountVal);
            } else {
                originalPrice = price;
            }

            originalPriceEl.textContent = '$' + originalPrice.toFixed(2);

            const saved = originalPrice - price;
            savingsEl.textContent = `You save $${saved.toFixed(2)} 🎁`;

            // Update Summary Lines
            summaryTextMain.textContent = `${followers} TikTok Followers`;
            summaryPrice.textContent = `$${price.toFixed(2)}`;
            summaryDiscount.textContent = `${discountStr} OFF`;

            // Animate Followers on Card
            // We animate from Base (4800) to Base + New Selection?
            // Or from Current Displayed to Base + New Selection?
            // Let's animate from Base to (Base + Followers) to show the effect of THIS package.
            // But if we clicked multiple times, resetting to Base first might look jerky.
            // Let's animate from currentDisplayValue (which might be the previous package total) to the new total.

            // Wait, logic: The card shows "4.8k" (Base).
            // If I select 1000, it should show 5.8k.
            // If I then select 50, it should show 4.85k.
            // So target is always Base + Selected Amount.

            const target = baseFollowers + followers;

            // We start animation from the *current displayed* value?
            // The displayed value acts as the state.
            // Let's read the current displayed value? No, let's use a variable.
            // Actually, for better UX: always animate from Base to Target?
            // Or from Previous Target to New Target?
            // If I switch from 1000 to 5000: Animate 5.8k -> 9.8k?
            // Yes, that implies "changing the order size changes the result".

            // However, the `currentFollowers` variable tracks the last state.
            // If this is the first click, currentFollowers is 4800.

            animateFollowers(baseFollowers, target, 1000);
        });
    });

    // Initialize with active package
    const activePkg = document.querySelector('.package-card.active');
    if (activePkg) {
        // Trigger a click to set initial state without animation or just set text
        // We'll mimic the logic but maybe skip animation or animate from base
        const followers = parseInt(activePkg.dataset.followers);
        const price = parseFloat(activePkg.dataset.price);
        const discountStr = activePkg.dataset.discount || '0%';
        const discountVal = parseFloat(discountStr) / 100;

        let originalPrice = price / (1 - discountVal);
        const saved = originalPrice - price;

        totalPriceEl.textContent = '$' + price.toFixed(2);
        originalPriceEl.textContent = '$' + originalPrice.toFixed(2);
        savingsEl.textContent = `You save $${saved.toFixed(2)} 🎁`;

        // Animate from Base to Target on load with delay
        const target = baseFollowers + followers;
        setTimeout(() => {
            animateFollowers(baseFollowers, target, 1000);
        }, 800);
    }
});
