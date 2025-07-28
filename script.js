document.addEventListener('DOMContentLoaded', () => {

  // --- Feature 1: Staggered Animation on Scroll ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const animatableCards = document.querySelectorAll('.service-card');
  animatableCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 100}ms`;
    observer.observe(card);
  });

  // --- Feature 2: 3D Tilt Effect ---
  const tiltCards = document.querySelectorAll('.service-card:not(.coming-soon-card)');
  tiltCards.forEach(card => {
    const MAX_TILT = 8; // --- UPDATED: Reduced from 15 to 8 for a calmer effect
    let tiltEnabled = true;

    const disableTiltZone = card.querySelector('[data-tilt-disable]');
    if (disableTiltZone) {
      disableTiltZone.addEventListener('mouseenter', () => {
        tiltEnabled = false;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      });
      disableTiltZone.addEventListener('mouseleave', () => {
        tiltEnabled = true;
      });
    }
    
    card.addEventListener('mousemove', (e) => {
      if (!tiltEnabled) return;
      const cardRect = card.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const cardHeight = cardRect.height;
      const centerX = cardRect.left + cardWidth / 2;
      const centerY = cardRect.top + cardHeight / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const rotateX = (MAX_TILT * mouseY / (cardHeight / 2)).toFixed(2);
      const rotateY = (-1 * MAX_TILT * mouseX / (cardWidth / 2)).toFixed(2);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
  });

  // --- Feature 3: "Show More" Button ---
  document.querySelectorAll('.product-card').forEach(card => {
    const toggleBtn = card.querySelector('.toggle-details-btn');
    const fullDescription = card.querySelector('.product-description-full');
    const chevron = card.querySelector('.chevron'); // --- NEW: Get the chevron icon

    if (toggleBtn && fullDescription && chevron) {
      toggleBtn.addEventListener('click', () => {
        const isExpanded = fullDescription.classList.toggle('expanded');
        chevron.classList.toggle('rotated'); // --- NEW: Rotate chevron
        toggleBtn.firstChild.nodeValue = isExpanded ? 'إخفاء النص ' : 'مشاهدة المزيد ';
      });
    }
  });

  // --- Feature 4: Product Slider (Manual Swipe Only) ---
  document.querySelectorAll('.product-slider').forEach(slider => {
    const sliderWrapper = slider.querySelector('.slider-wrapper');
    const dotsContainer = slider.querySelector('.slider-dots');
    if (!sliderWrapper || !dotsContainer) return;

    const images = Array.from(sliderWrapper.children);
    const imageCount = images.length;
    if (imageCount <= 1) return;

    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let dots = [];

    // --- Create dots
    for (let i = 0; i < imageCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            currentIndex = i;
            setPosition();
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
    }
    
    const updateDots = () => {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    sliderWrapper.style.width = `${imageCount * 100}%`;
    images.forEach(img => {
      img.style.width = `${100 / imageCount}%`;
    });

    const getPositionX = (event) => {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    };

    const setPosition = (animate = true) => {
      sliderWrapper.style.transition = animate ? 'transform 0.5s ease-out' : 'none';
      const offset = -currentIndex * slider.offsetWidth;
      sliderWrapper.style.transform = `translateX(${offset}px)`;
      updateDots();
    };
    
    const dragStart = (event) => {
      isDragging = true;
      startX = getPositionX(event);
      currentX = startX;
      sliderWrapper.style.transition = 'none';
    };

    const dragging = (event) => {
      if (!isDragging) return;
      currentX = getPositionX(event);
      const diff = currentX - startX;
      const baseOffset = -currentIndex * slider.offsetWidth;
      sliderWrapper.style.transform = `translateX(${baseOffset + diff}px)`;
    };

    const dragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentX - startX;
      const threshold = slider.offsetWidth / 5; // Swipe threshold

      // --- UPDATED LOGIC: No longer loops from last to first image on swipe
      if (diff < -threshold && currentIndex < imageCount - 1) {
        currentIndex++;
      } else if (diff > threshold && currentIndex > 0) {
        currentIndex--;
      }
      
      setPosition();
    };

    // Attach Listeners
    slider.addEventListener('mousedown', dragStart);
    slider.addEventListener('mouseup', dragEnd);
    slider.addEventListener('mouseleave', dragEnd);
    slider.addEventListener('mousemove', dragging);

    slider.addEventListener('touchstart', dragStart, { passive: true });
    slider.addEventListener('touchend', dragEnd);
    slider.addEventListener('touchmove', dragging, { passive: true });
    
    // Initial Setup
    setPosition(false);
  });
});
