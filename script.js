'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Mark document as JS-enabled for CSS hooks
  document.documentElement.classList.add('js');

  // --- DOM & Formatting Utilities ---
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const createEl = (tag, className = '', html = '') => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  };

  const formatCurrency = (amount) => {
    return 'R' + Math.round(amount).toLocaleString('en-US');
  };

  // --- Validation & Alert Helpers ---
  const clearFieldError = (input) => {
    input.removeAttribute('aria-invalid');
    const key = input.id || input.name;
    const existingErr = input.parentElement?.querySelector(`.error[data-for="${key}"]`);
    if (existingErr) existingErr.remove();
  };

  const showFieldError = (input, message) => {
    clearFieldError(input);
    input.setAttribute('aria-invalid', 'true');
    const errSpan = createEl('span', 'error', message);
    errSpan.dataset.for = input.id || input.name;
    errSpan.setAttribute('role', 'alert');
    input.insertAdjacentElement('afterend', errSpan);
  };

  const showFormAlert = (form, message, isError = false) => {
    qsa('.alert', form.parentElement).forEach((alert) => alert.remove());
    const alertDiv = createEl('div', `alert${isError ? ' bad' : ''}`, message);
    alertDiv.setAttribute('role', isError ? 'alert' : 'status');
    form.insertAdjacentElement('beforebegin', alertDiv);
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Auto-clear validation errors as the user types
  document.addEventListener('input', (e) => {
    if (e.target.matches('[aria-invalid]')) {
      clearFieldError(e.target);
    }
  });

  // --- 1. Image Fallback & Broken Image Handler ---
  const initImageFallbacks = () => {
    const handleImageError = (img) => {
      const filename = img.getAttribute('src')?.split('/').pop();
      // Check if IMG dictionary from script_3.js exists and has a fallback
      if (typeof IMG !== 'undefined' && filename && IMG[filename] && !img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = 'true';
        img.src = IMG[filename];
        return;
      }
      img.classList.add('img-missing');
    };

    qsa('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        handleImageError(img);
      }
      img.addEventListener('error', () => handleImageError(img));
    });
  };

  // --- 2. Header Navigation & Dropdown ---
  const initNavigation = () => {
    const nav = qs('header nav');
    if (!nav) return;

    const roomMenuItems = [
      ['All Rooms', 'rooms.html'],
      ['The Lost Temple', 'room-detail.html'],
      ['Haunted Mansion', 'rooms.html'],
      ['Prison Break', 'rooms.html'],
      ['Space Station', 'rooms.html'],
      ['Pirate Cove', 'rooms.html'],
      ['Zombie Lab', 'rooms.html'],
    ];

    const roomsLink = qs('a[href="rooms.html"]', nav);
    if (roomsLink) {
      const parentLi = roomsLink.closest('li');
      parentLi.classList.add('has-dropdown');
      roomsLink.setAttribute('aria-haspopup', 'true');
      roomsLink.setAttribute('aria-expanded', 'false');

      const dropdownHtml = roomMenuItems
        .map(([label, href]) => `<li><a href="${href}">${label}</a></li>`)
        .join('');
      const dropdownUl = createEl('ul', 'dropdown', dropdownHtml);
      parentLi.append(dropdownUl);

      roomsLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 860) {
          e.preventDefault();
          const isOpen = parentLi.classList.toggle('open');
          roomsLink.setAttribute('aria-expanded', String(isOpen));
        }
      });
    }

    // Highlight active page link
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    qsa('a', nav).forEach((anchor) => {
      const href = anchor.getAttribute('href');
      const isMatch =
        href === currentPage ||
        (currentPage === 'room-detail.html' && href === 'rooms.html' && !anchor.closest('.dropdown'));

      if (isMatch) {
        anchor.setAttribute('aria-current', 'page');
      }
    });

    // Mobile hamburger toggle
    const toggleBtn = createEl('button', 'nav-toggle', '&#9776;');
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-label', 'Toggle menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    nav.before(toggleBtn);

    toggleBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });
  };

  // --- 3. Footer Layout Restructuring ---
  const initFooter = () => {
    const footer = qs('body > footer');
    if (!footer) return;

    const children = [...footer.children];
    if (children.length < 2) return;

    const topSection = createEl('div', 'footer-top');
    const brandCol = createEl('div', 'footer-brand');
    const bottomSection = createEl('div', 'footer-bottom');

    brandCol.append(children[0], children[1]);
    topSection.append(brandCol);

    for (let i = 2; i < children.length; i++) {
      const node = children[i];
      if (node.tagName === 'H4' && children[i + 1]) {
        const col = createEl('div', 'footer-col');
        col.append(node, children[i + 1]);
        topSection.append(col);
        i++; // Skip next element since it was appended into the column
      } else if (node.tagName === 'UL') {
        const col = createEl('div', 'footer-col');
        col.append(node);
        topSection.append(col);
      } else {
        bottomSection.append(node);
      }
    }

    footer.append(topSection, bottomSection);
  };

  // --- 4. Card UI Polish (Difficulty Stars & Price Rows) ---
  const initCardEnhancements = () => {
    qsa('article > p').forEach((p) => {
      const difficultyMatch = p.textContent.trim().match(/^Difficulty:\s*(\d)\s*\/\s*5$/);
      if (difficultyMatch) {
        const score = Number(difficultyMatch[1]);
        const stars = '★'.repeat(score) + '☆'.repeat(5 - score);
        p.className = 'row';
        p.innerHTML = `<span>Difficulty</span><span class="stars" aria-label="${score} out of 5">${stars}</span>`;
        return;
      }

      const priceMatch = p.textContent.trim().match(/^(.+?)\s*\|\s*(R\d+\s*\/\s*person)$/);
      if (priceMatch) {
        p.className = 'row';
        p.innerHTML = `<span>${priceMatch[1]}</span><strong>${priceMatch[2]}</strong>`;
      }
    });
  };

  // --- 5. Home Page CTA & Accessible FAQ Accordion ---
  const initHomeAndFaq = () => {
    const heroImg = qs('main > section:first-child > img');
    const mainEl = qs('main');
    if (heroImg && mainEl && qs('main > section:last-child')) {
      const ctaSection = createEl(
        'section',
        'cta',
        '<h2 style="text-align:center">Ready for the Challenge?</h2><a href="booking.html"><button type="button">Book Your Adventure</button></a>'
      );
      mainEl.append(ctaSection);
    }

    qsa('dt').forEach((dt, index) => {
      dt.tabIndex = 0;
      dt.setAttribute('role', 'button');
      dt.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');

      const toggleFaq = () => {
        const isOpen = dt.classList.toggle('open');
        dt.setAttribute('aria-expanded', String(isOpen));
      };

      dt.addEventListener('click', toggleFaq);
      dt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFaq();
        }
      });

      if (index === 0) dt.classList.add('open');
    });
  };

  // --- 6. Rooms Page Category Filter ---
  const initRoomFilter = () => {
    const filterNav = qs('main > nav[aria-label="Room categories"]');
    if (!filterNav) return;

    const filterLinks = qsa('a', filterNav);
    const roomCards = qsa('main article');

    filterLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        filterLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');

        const selectedCategory = link.textContent.trim().toLowerCase();
        roomCards.forEach((card) => {
          const cardCategory = qs('small', card)?.textContent.trim().toLowerCase();
          card.hidden = selectedCategory !== 'all' && cardCategory !== selectedCategory;
        });
      });
    });

    if (filterLinks[0]) filterLinks[0].classList.add('active');
  };

  // --- 7. Contact Form Validation ---
  const initContactForm = () => {
    const contactForm = qs('main > section > form');
    if (!contactForm) return;

    contactForm.noValidate = true;
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const nameInput = qs('#name', contactForm);
        const emailInput = qs('#email', contactForm);
        const messageInput = qs('#message', contactForm);

        [nameInput, emailInput, messageInput].forEach(clearFieldError);
        let isValid = true;

        const senderName = nameInput.value.trim();
        const senderEmail = emailInput.value.trim();
        const senderMsg = messageInput.value.trim();

        if (senderName.length < 2) {
          showFieldError(nameInput, 'Enter your full name.');
          isValid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(senderEmail)) {
          showFieldError(emailInput, 'Enter a valid email address, like name@example.com.');
          isValid = false;
        }
        if (senderMsg.length < 10) {
          showFieldError(messageInput, 'Write at least 10 characters so we can help.');
          isValid = false;
        }

        if (!isValid) {
          showFormAlert(contactForm, 'Please fix the highlighted fields and send again.', true);
          qs('[aria-invalid]', contactForm)?.focus();
          return;
        }

        contactForm.reset();
        showFormAlert(
          contactForm,
          `Thanks ${senderName}, your message is on its way. We reply within one business day.`
        );
      } catch (err) {
        console.error('Contact form submission error:', err);
        showFormAlert(contactForm, 'Something went wrong sending your message. Please try again.', true);
      }
    });
  };

  // --- 8. Booking Calculator & Interactive Form ---
  const initBookingForm = () => {
    const bookingForm = qs('main > form');
    const roomSelect = qs('#room');
    if (!bookingForm || !roomSelect) return;

    bookingForm.noValidate = true;

    const ROOM_CONFIG = {
      'The Lost Temple': { price: 350, min: 2, max: 6 },
      'Haunted Mansion': { price: 380, min: 4, max: 8 },
      'Prison Break': { price: 320, min: 2, max: 5 },
      'Space Station': { price: 390, min: 3, max: 6 },
      'Pirate Cove': { price: 340, min: 4, max: 8 },
      'Zombie Lab': { price: 329, min: 2, max: 6 },
    };

    const PROMO_CODES = {
      ESCAPE10: 0.10,
      TEAM15: 0.15,
    };

    const dateInput = qs('#date', bookingForm);
    const playersInput = qs('#players', bookingForm);
    const promoInput = qs('#promo', bookingForm);
    const summaryParagraphs = qsa('aside p', bookingForm);
    const applyPromoBtn = qs('aside p:has(#promo) button', bookingForm);

    let currentDiscount = 0;

    // Promo status feedback element
    const promoStatus = createEl('p', 'msg');
    if (summaryParagraphs[6]) {
      summaryParagraphs[6].after(promoStatus);
    }

    // Calendar Picker
    const calendarTable = qs('table', bookingForm);
    if (calendarTable) {
      calendarTable.classList.add('cal');
      qsa('td', calendarTable).forEach((td) => {
        if (td.textContent.trim()) {
          td.tabIndex = 0;
          td.setAttribute('role', 'button');
        }
      });

      const selectCalendarDate = (td) => {
        const day = td.textContent.trim().padStart(2, '0');
        dateInput.value = `2026-03-${day}`;
        clearFieldError(dateInput);
        updateSummary();
      };

      calendarTable.addEventListener('click', (e) => {
        if (e.target.matches('td') && e.target.textContent.trim()) {
          selectCalendarDate(e.target);
        }
      });

      calendarTable.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('td') && e.target.textContent.trim()) {
          e.preventDefault();
          selectCalendarDate(e.target);
        }
      });
    }

    // Player Count Stepper
    const stepper = createEl('div', 'stepper');
    stepper.id = 'players-box';
    const minusBtn = createEl('button', '', '−');
    const plusBtn = createEl('button', '', '+');
    minusBtn.type = plusBtn.type = 'button';
    minusBtn.setAttribute('aria-label', 'Fewer players');
    plusBtn.setAttribute('aria-label', 'More players');

    playersInput.before(stepper);
    stepper.append(minusBtn, playersInput, plusBtn);

    minusBtn.addEventListener('click', () => {
      playersInput.value = (parseInt(playersInput.value, 10) || 0) - 1;
      updateSummary(true);
    });

    plusBtn.addEventListener('click', () => {
      playersInput.value = (parseInt(playersInput.value, 10) || 0) + 1;
      updateSummary(true);
    });

    playersInput.addEventListener('change', () => updateSummary(true));
    roomSelect.addEventListener('change', () => updateSummary(true));
    dateInput.addEventListener('change', () => updateSummary());
    bookingForm.addEventListener('change', (e) => {
      if (e.target.name === 'time') {
        qsa('.error[data-for="time"]', bookingForm).forEach((err) => err.remove());
        updateSummary();
      }
    });

    // Update Summary & Recalculate Pricing
    function updateSummary(enforceBounds = false) {
      const { price, min, max } = ROOM_CONFIG[roomSelect.value] || { price: 350, min: 2, max: 6 };
      playersInput.min = min;
      playersInput.max = max;

      let count = parseInt(playersInput.value, 10);

      if (enforceBounds && (isNaN(count) || count < min || count > max)) {
        const clamped = Math.min(max, Math.max(min, isNaN(count) ? min : count));
        playersInput.value = clamped;
        count = clamped;
        showFieldError(
          stepper,
          `${roomSelect.value} takes ${min} to ${max} players. We adjusted your group size.`
        );
      } else if (enforceBounds) {
        clearFieldError(stepper);
      }

      count = parseInt(playersInput.value, 10) || min;
      const subtotal = count * price;
      const finalTotal = subtotal * (1 - currentDiscount);

      // Sync active calendar cell
      if (calendarTable) {
        qsa('td', calendarTable).forEach((td) => {
          const day = td.textContent.trim().padStart(2, '0');
          const isSelected = Boolean(td.textContent.trim()) && dateInput.value === `2026-03-${day}`;
          td.classList.toggle('sel', isSelected);
        });
      }

      const parsedDate = dateInput.value ? new Date(`${dateInput.value}T00:00:00`) : null;
      const selectedTimeRadio = qs('input[name="time"]:checked', bookingForm);
      const formattedDate =
        parsedDate && !isNaN(parsedDate)
          ? parsedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
          : 'Choose a date';
      const formattedTime = selectedTimeRadio
        ? qs(`label[for="${selectedTimeRadio.id}"]`, bookingForm)?.textContent
        : 'Choose a time';

      if (summaryParagraphs[1]) summaryParagraphs[1].innerHTML = `<strong>${roomSelect.value}</strong>`;
      if (summaryParagraphs[2]) summaryParagraphs[2].textContent = `${formattedDate} • ${formattedTime}`;
      if (summaryParagraphs[4]) {
        summaryParagraphs[4].textContent = `${formatCurrency(price)} per player × ${count} — ${formatCurrency(subtotal)}`;
      }
      if (summaryParagraphs[7]) {
        summaryParagraphs[7].innerHTML = `<strong>Total Price: ${formatCurrency(finalTotal)}</strong>`;
      }
    }

    // Promo Code Handler
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        promoStatus.className = 'msg';
        promoStatus.style.color = '';
        currentDiscount = 0;

        if (!code) {
          promoStatus.textContent = 'Enter a promo code first.';
        } else if (PROMO_CODES[code]) {
          currentDiscount = PROMO_CODES[code];
          promoStatus.className = 'msg ok';
          promoStatus.textContent = `${code} applied: ${currentDiscount * 100}% off.`;
        } else {
          promoStatus.textContent = 'That code isn’t valid. Check the spelling and try again.';
          promoStatus.style.color = 'var(--err)';
        }

        updateSummary();
      });
    }

    // Final Booking Submission
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const errors = [];
        qsa('.error', bookingForm).forEach((err) => err.remove());

        if (!dateInput.value || isNaN(new Date(dateInput.value))) {
          showFieldError(dateInput, 'Pick a date from the calendar.');
          errors.push(dateInput);
        }

        if (!qs('input[name="time"]:checked', bookingForm)) {
          const timeFieldset = qs('fieldset:has([name="time"])', bookingForm);
          if (timeFieldset) {
            const errSpan = createEl('span', 'error', 'Select a time slot.');
            errSpan.dataset.for = 'time';
            errSpan.setAttribute('role', 'alert');
            timeFieldset.append(errSpan);
            errors.push(timeFieldset);
          }
        }

        updateSummary(true);

        if (errors.length > 0) {
          showFormAlert(bookingForm, 'Complete the highlighted steps to confirm your booking.', true);
          errors[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const playerCount = playersInput.value;
        const scheduleText = summaryParagraphs[2]?.textContent || '';
        const totalText = summaryParagraphs[7]?.textContent.replace('Total Price: ', '') || '';

        showFormAlert(
          bookingForm,
          `Booking confirmed! ${roomSelect.value}, ${scheduleText}, ${playerCount} players. Total ${totalText}. Arrive 15 minutes early.`
        );
      } catch (err) {
        console.error('Booking submission error:', err);
        showFormAlert(bookingForm, 'We couldn’t complete your booking. Please try again.', true);
      }
    });

    // Initialize default booking state
    updateSummary(true);
  };

  // --- Boot All Modules ---
  initImageFallbacks();
  initNavigation();
  initFooter();
  initCardEnhancements();
  initHomeAndFaq();
  initRoomFilter();
  initContactForm();
  initBookingForm();
});