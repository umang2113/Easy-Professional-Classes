// App Logic for Easy Professional Classes Results Portal

document.addEventListener("DOMContentLoaded", () => {
  // State variables
  let currentFilter = "all";
  let searchQuery = "";
  let currentSort = "rank";
  let activeTestimonialIndex = 0;
  let testimonialInterval;

  // Initialize Elements
  const searchInput = document.getElementById("search-input");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const sortSelect = document.getElementById("sort-select");
  const qrUrlInput = document.getElementById("qr-url-input");
  const refreshQrBtn = document.getElementById("refresh-qr-btn");
  const testimonialContainer = document.getElementById("testimonial-slides-container");
  const prevBtn = document.querySelector(".carousel-btn-prev");
  const nextBtn = document.querySelector(".carousel-btn-next");
  const modal = document.getElementById("quote-modal");
  const closeModalBtn = document.getElementById("close-modal");

  // Load and Render Students
  function getFilteredStudents() {
    return studentsData
      .filter(student => {
        // Category Filter
        const matchesCategory = currentFilter === "all" || student.category === currentFilter;
        
        // Search Filter
        const term = searchQuery.toLowerCase();
        const matchesSearch = 
          student.name.toLowerCase().includes(term) ||
          student.university.toLowerCase().includes(term) ||
          student.exam.toLowerCase().includes(term) ||
          (student.rank && student.rank.toLowerCase().includes(term));
          
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        // Sort Function
        if (currentSort === "rank") {
          // Extract rank digits (e.g. "AIR 14" -> 14)
          const rankA = a.rank ? (parseInt(a.rank.replace(/\D/g, '')) || 9999) : 9999;
          const rankB = b.rank ? (parseInt(b.rank.replace(/\D/g, '')) || 9999) : 9999;
          return rankA - rankB;
        } else if (currentSort === "name-asc") {
          return a.name.localeCompare(b.name);
        } else if (currentSort === "name-desc") {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
  }

  function renderStudentsGrid() {
    const students = getFilteredStudents();
    const grid = document.getElementById("students-grid");
    grid.innerHTML = "";

    if (students.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px; display: block;"></i>
          <h3 style="font-size: 1.5rem; margin-bottom: 8px; font-family: var(--font-display);">No Selections Found</h3>
          <p style="color: var(--text-secondary);">Try adjusting your search terms or filters.</p>
        </div>
      `;
      return;
    }

    students.forEach(student => {
      const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      const card = document.createElement("div");
      card.className = "student-card";
      card.innerHTML = `
        <div class="student-card-glow"></div>
        <div class="student-header">
          <div class="avatar-container">
            <img src="${student.avatar}" class="student-avatar" alt="${student.name}" onerror="handleImageError(this, '${initials}')" />
            ${student.rank ? `<div class="rank-badge">${student.rank}</div>` : ''}
          </div>
          <div class="student-title">
            <h3 class="student-name">${student.name}</h3>
            <div class="exam-tags-container">
              ${student.exam.split(',').map(ex => `<span class="exam-tag">${ex.trim()}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="student-details">
          <div class="selection-info">
            <span class="selection-label">Selected At</span>
            <span class="selection-value"><i class="fas fa-university"></i> ${student.university}</span>
          </div>
          <p class="student-quote" onclick="openQuoteModal(${student.id})">"${student.testimonial}"</p>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Handle Missing Image Fallback
  window.handleImageError = function(imgElement, initials) {
    const container = imgElement.parentElement;
    imgElement.style.display = 'none';
    
    if (!container.querySelector('.avatar-fallback')) {
      const fallback = document.createElement('div');
      fallback.className = 'avatar-fallback';
      fallback.textContent = initials;
      container.insertBefore(fallback, imgElement);
    }
  };

  // Event Listeners for Search and Filters
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderStudentsGrid();
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.getAttribute("data-filter");
      renderStudentsGrid();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderStudentsGrid();
    });
  }

  // Render Testimonials Carousel
  function buildTestimonials() {
    if (!testimonialContainer) return;
    testimonialContainer.innerHTML = "";

    // Let's pick 5 students with quotes
    const featuredStudents = studentsData.slice(0, 5);

    featuredStudents.forEach((student, idx) => {
      const slide = document.createElement("div");
      slide.className = `testimonial-slide ${idx === activeTestimonialIndex ? "active" : ""}`;
      
      const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      slide.innerHTML = `
        <div class="testimonial-quote-icon">
          <i class="fas fa-quote-left"></i>
        </div>
        <p class="testimonial-text">"${student.testimonial}"</p>
        <div class="testimonial-user">
          <div class="avatar-container" style="width: 60px; height: 60px; margin-bottom: 12px;">
            <img src="${student.avatar}" class="student-avatar" alt="${student.name}" onerror="handleImageError(this, '${initials}')" style="border: 2px solid var(--accent-indigo)" />
          </div>
          <span class="testimonial-name">${student.name}</span>
          <span class="testimonial-desc">${student.rank ? `${student.rank} - ` : ''}Selected in ${student.university.split(',')[0]}</span>
        </div>
      `;
      testimonialContainer.appendChild(slide);
    });
  }

  function showTestimonial(index) {
    const slides = document.querySelectorAll(".testimonial-slide");
    if (slides.length === 0) return;

    slides.forEach(slide => slide.classList.remove("active"));
    
    // Wrap around index
    if (index >= slides.length) activeTestimonialIndex = 0;
    else if (index < 0) activeTestimonialIndex = slides.length - 1;
    else activeTestimonialIndex = index;

    slides[activeTestimonialIndex].classList.add("active");
  }

  function nextTestimonial() {
    showTestimonial(activeTestimonialIndex + 1);
  }

  function startTestimonialTimer() {
    stopTestimonialTimer();
    testimonialInterval = setInterval(nextTestimonial, 6000);
  }

  function stopTestimonialTimer() {
    if (testimonialInterval) clearInterval(testimonialInterval);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showTestimonial(activeTestimonialIndex - 1);
      startTestimonialTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showTestimonial(activeTestimonialIndex + 1);
      startTestimonialTimer();
    });
  }

  // QR Code Generation
  function generateQR() {
    const canvas = document.getElementById("qr-canvas");
    const downloadBtn = document.getElementById("qr-download");
    if (!canvas || !qrUrlInput) return;

    const targetUrl = qrUrlInput.value.trim() || window.location.href;

    // Use official qrcode library
    if (typeof QRCode !== "undefined") {
      QRCode.toCanvas(canvas, targetUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: "#08090d",  // Premium dark
          light: "#ffffff"  // High contrast white background
        }
      }, function (error) {
        if (error) {
          console.error("QR Code Error:", error);
          return;
        }
        // Set download links
        const dataUrl = canvas.toDataURL("image/png");
        downloadBtn.href = dataUrl;
        
        // Update live banner preview image
        const bannerQr = document.getElementById("banner-qr-img");
        if (bannerQr) {
          bannerQr.src = dataUrl;
        }
      });
    } else {
      console.warn("QRCode library is not loaded yet.");
    }
  }

  if (refreshQrBtn) {
    refreshQrBtn.addEventListener("click", generateQR);
  }

  if (qrUrlInput) {
    qrUrlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        generateQR();
      }
    });
  }

  // Quote Modal Functionality
  window.openQuoteModal = function(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student || !modal) return;

    const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    document.getElementById("modal-avatar-container").innerHTML = `
      <img src="${student.avatar}" class="modal-avatar" alt="${student.name}" onerror="handleImageError(this, '${initials}')" />
    `;
    document.getElementById("modal-name").textContent = student.name;
    const rankText = student.rank ? ` - ${student.rank}` : '';
    document.getElementById("modal-university").textContent = `Selected in: ${student.university} (${student.exam}${rankText})`;
    document.getElementById("modal-quote").textContent = `"${student.testimonial}"`;

    modal.classList.add("active");
    stopTestimonialTimer();
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("active");
      startTestimonialTimer();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        startTestimonialTimer();
      }
    });
  }

  // Contact form submission mock
  const contactForm = document.getElementById("enquiry-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("contact-name").value;
      const phone = document.getElementById("contact-phone").value;
      const email = document.getElementById("contact-email").value;
      const message = document.getElementById("contact-msg").value;
      
      // Check validation
      if (!name || !phone) {
        alert("Please fill in Name and Phone number.");
        return;
      }
      
      // Create WhatsApp message API link
      const text = `Hi Easy Professional Classes, my name is ${name}. I am interested in joining your MCA coaching classes. Phone: ${phone}, Email: ${email}. Query: ${message}`;
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=919876543210&text=${encodedText}`; // Replace with actual institute phone
      
      // Create modern feedback banner
      const successBanner = document.createElement("div");
      successBanner.style.position = "fixed";
      successBanner.style.bottom = "24px";
      successBanner.style.right = "24px";
      successBanner.style.background = "var(--gradient-primary)";
      successBanner.style.color = "#fff";
      successBanner.style.padding = "16px 24px";
      successBanner.style.borderRadius = "14px";
      successBanner.style.boxShadow = "0 8px 30px rgba(99, 102, 241, 0.4)";
      successBanner.style.zIndex = "1000";
      successBanner.style.fontSize = "0.95rem";
      successBanner.style.fontWeight = "600";
      successBanner.style.display = "flex";
      successBanner.style.alignItems = "center";
      successBanner.style.gap = "12px";
      successBanner.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
        <span>Enquiry Saved! Opening WhatsApp...</span>
      `;
      document.body.appendChild(successBanner);
      
      // Redirect to WhatsApp after 1.5 seconds
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        successBanner.remove();
        contactForm.reset();
      }, 1500);
    });
  }

  // Initialize App
  renderStudentsGrid();
  buildTestimonials();
  startTestimonialTimer();

  // Wait for QRCode script load
  let checkQrCount = 0;
  function tryInitQR() {
    if (typeof QRCode !== "undefined") {
      // Setup default QR URL to current hostname or mock website
      if (qrUrlInput) {
        qrUrlInput.value = window.location.origin + window.location.pathname;
      }
      generateQR();
    } else if (checkQrCount < 30) {
      checkQrCount++;
      setTimeout(tryInitQR, 100);
    }
  }
  
  tryInitQR();
});
