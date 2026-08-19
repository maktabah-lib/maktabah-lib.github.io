// TIC Library Catalog - Application Logic
// This file will be populated with functionality for search, filtering, and sorting

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    const catalog = new Catalog();
    
    // Initialize dark mode
    catalog.initDarkMode();
    
    // Load initial data
    catalog.loadBooks();
    
    // Handle route based on query parameters
    catalog.handleRoute();
    
    // Add search event listener (only when search container is visible)
    if (catalog.searchContainer.style.display !== 'none') {
        catalog.searchInput.addEventListener('input', () => catalog.updateSearch());
    }
});

class Catalog {
    constructor() {
        this.books = [];
        this.currentPage = 1;
        this.booksPerPage = 15;
        this.totalPages = 0;
        
        // DOM Elements
        this.bookList = document.getElementById('bookList');
        this.bookDetail = document.getElementById('bookDetail');
        this.searchInput = document.getElementById('searchInput');
        this.searchContainer = document.getElementById('searchContainer');
        this.paginationContainer = document.getElementById('pagination');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        
        // Popup elements
        this.popupOverlay = document.getElementById('imagePopup');
        this.popupImage = document.getElementById('popupImage');
        this.popupPrevArrow = document.getElementById('popupPrevArrow');
        this.popupNextArrow = document.getElementById('popupNextArrow');
        this.popupImageCounter = document.getElementById('popupImageCounter');
        this.closePopup = document.querySelector('.close-popup');
        
        // Header navigation link
        this.headerLink = document.querySelector('.header h1 a');
        
        // Initialize popup events
        this.initializePopupEvents();
        
        // Handle window resize for responsive pagination
        window.addEventListener('resize', () => this.handleResize());
    }

    initDarkMode() {
        // Check for saved theme preference or default to light
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            this.darkModeToggle.querySelector('.toggle-icon').textContent = '☀️';
        }
        
        // Add event listener to toggle button
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        
        // Update icon
        const icon = this.darkModeToggle.querySelector('.toggle-icon');
        icon.textContent = isDarkMode ? '☀️' : '🌙';
        
        // Add rotation animation
        icon.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            icon.style.transform = '';
        }, 300);
    }

    initializePopupEvents() {
        // Close popup when clicking the X
        this.closePopup.addEventListener('click', () => this.closeImagePopup());
        
        // Close popup when clicking outside the image
        this.popupOverlay.addEventListener('click', (e) => {
            if (e.target === this.popupOverlay) {
                this.closeImagePopup();
            }
        });
        
        // Navigation arrows for popup
        this.popupPrevArrow.addEventListener('click', () => this.navigatePopup(-1));
        this.popupNextArrow.addEventListener('click', () => this.navigatePopup(1));
        
        // Keyboard navigation for popup
        document.addEventListener('keydown', (e) => {
            if (this.popupOverlay.style.display === 'flex') {
                if (e.key === 'Escape') {
                    this.closeImagePopup();
                } else if (e.key === 'ArrowLeft') {
                    this.navigatePopup(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigatePopup(1);
                }
            }
        });
    }

    loadBooks() {
        // Read books from TIC-Library-catalog.csv using Papa Parse to load as JSON
        fetch('./prod-library-catalog.csv')
        // fetch('./mock-library-catalog.csv')
            .then(response => response.text())
            .then(csvText => {
                const results = Papa.parse(csvText, { header: true });
                this.books = results.data;
                this.handleRoute();
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                // Fallback to placeholder data if file doesn't exist
                this.books = [
                    { ID: '9780262033848', Title: 'Introduction to Algorithms', Author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', Publisher: 'MIT Press', Year: 2009, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf_ID': null },
                    { ID: '9780131103627', Title: 'The C Programming Language', Author: 'Brian W. Kernighan, Dennis M. Ritchie', Publisher: 'Prentice Hall', Year: 1988, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf_ID': null },
                    { ID: '9780262046305', Title: 'Artificial Intelligence: A Modern Approach', Author: 'Stuart Russell, Peter Norvig', Publisher: 'Pearson', Year: 2021, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf_ID': null },
                ];
                this.handleRoute();
            });
    }

    handleRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('id');
        
        if (bookId) {
            const book = this.books.find(b => b.ID === bookId);
            if (book) {
                this.renderBookDetail(book);
            } else {
                this.bookDetail.innerHTML = '<p>Book not found.</p>';
                this.bookDetail.style.display = 'block';
            }
        } else {
            this.renderBooks();
            this.bookDetail.style.display = 'none';
        }
    }

    renderBooks() {
        this.bookList.innerHTML = '';
        
        if (this.books.length === 0) {
            this.bookList.innerHTML = '<p class="no-results">No books found.</p>';
            this.paginationContainer.style.display = 'none';
            return;
        }

        // Get search query from input
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        // Filter books based on search term
        const filteredBooks = this.books.filter(book => {
            const title = (book.Title || '').toLowerCase();
            const author = (book.Author || '').toLowerCase();
            const isbn = (book.ID || '').toLowerCase();
            const shelf = (book.Shelf_ID || '').toLowerCase()
            
            return title.includes(searchTerm) || 
                   author.includes(searchTerm) || 
                   isbn.includes(searchTerm) ||
                   shelf.includes(searchTerm);
        });

        // Calculate pagination
        this.totalPages = Math.ceil(filteredBooks.length / this.booksPerPage);
        const startIndex = (this.currentPage - 1) * this.booksPerPage;
        const endIndex = startIndex + this.booksPerPage;
        const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

        // Render books for current page
        booksToDisplay.forEach(book => {
            const title = book.Title || '(none)';
            const author = book.Author || '(none)';
            const isbn = book.ID || '(none)';
            
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            // Create image container
            const imageDiv = document.createElement('div');
            imageDiv.className = 'book-card-image';
            
            // Try to load the first image for this book
            const imageUrl = `./catalog-imgs/${book.ID}/1.jpg`;
            const img = new Image();
            img.onload = function() {
                // Image loaded successfully
                imageDiv.appendChild(this);
            };
            img.onerror = function() {
                // Image failed to load, show placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'book-card-image-placeholder';
                placeholder.innerHTML = '📖';
                imageDiv.appendChild(placeholder);
            };
            img.src = imageUrl;
            img.alt = `Cover of ${title}`;
            
            bookCard.appendChild(imageDiv);
            
            // Create details container
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'book-card-details';
            detailsDiv.innerHTML = `
                <h5>${title}</h5>
                <p class="author">${author}</p>
                <p class="isbn">ISBN: ${isbn}</p>
            `;
            bookCard.appendChild(detailsDiv);
            
            // Add click event to navigate to book detail
            bookCard.addEventListener('click', () => {
                window.location.href = `./index.html?id=${book.ID}`;
            });
            this.bookList.appendChild(bookCard);
        });

        // Render pagination controls
        this.renderPagination();
    }

    getMaxPagesToShow() {
        const width = window.innerWidth;
        if (width < 576) return 3;  // Extra small devices
        if (width < 768) return 5;  // Small devices (tablets)
        if (width < 992) return 7;  // Medium devices (small laptops)
        if (width < 1200) return 9; // Large devices (desktops)
        return 10;                  // Extra large devices
    }

    renderPagination() {
        this.paginationContainer.innerHTML = '';
        
        if (this.totalPages <= 1) {
            this.paginationContainer.style.display = 'none';
            return;
        }

        this.paginationContainer.style.display = 'flex';

        const maxPagesToShow = this.getMaxPagesToShow();
        let startPage, endPage;

        // Calculate the range of pages to display
        if (this.totalPages <= maxPagesToShow) {
            // If total pages are less than max, show all pages
            startPage = 1;
            endPage = this.totalPages;
        } else {
            // Calculate the starting page based on current page
            const halfRange = Math.floor(maxPagesToShow / 2);
            
            if (this.currentPage <= halfRange) {
                // Near the beginning
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (this.currentPage + halfRange >= this.totalPages) {
                // Near the end
                endPage = this.totalPages;
                startPage = this.totalPages - maxPagesToShow + 1;
            } else {
                // In the middle
                startPage = this.currentPage - halfRange;
                endPage = this.currentPage + halfRange;
            }
        }

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderBooks();
            }
        });
        this.paginationContainer.appendChild(prevButton);

        // If we're not at the beginning, add ellipsis
        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => {
                this.currentPage = 1;
                this.renderBooks();
            });
            this.paginationContainer.appendChild(firstPageButton);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0.75rem';
                ellipsis.style.color = 'var(--text-color)';
                this.paginationContainer.appendChild(ellipsis);
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === this.currentPage) {
                pageButton.style.backgroundColor = 'var(--link-color)';
                pageButton.style.color = 'white';
                pageButton.style.borderColor = 'var(--link-color)';
            }
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.renderBooks();
            });
            this.paginationContainer.appendChild(pageButton);
        }

        // If we're not at the end, add ellipsis
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0.75rem';
                ellipsis.style.color = 'var(--text-color)';
                this.paginationContainer.appendChild(ellipsis);
            }
            
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = this.totalPages;
            lastPageButton.addEventListener('click', () => {
                this.currentPage = this.totalPages;
                this.renderBooks();
            });
            this.paginationContainer.appendChild(lastPageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = this.currentPage === this.totalPages;
        nextButton.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderBooks();
            }
        });
        this.paginationContainer.appendChild(nextButton);
    }

    handleResize() {
        // Re-render pagination when window is resized to update page number display
        if (this.paginationContainer.style.display !== 'none') {
            this.renderPagination();
        }
    }

    renderBookDetail(book) {
        this.bookList.style.display = 'none';
        this.bookDetail.style.display = 'block';
        this.paginationContainer.style.display = 'none';
        
        // Hide search bar when viewing book detail
        this.searchContainer.style.display = 'none';
        
        const title = book.Title || '(none)';
        
        const fields = [
            { label: 'ID', value: book.ID },
            { label: 'Title', value: book.Title },
            { label: 'Volume #', value: book['Volume #'] },
            { label: 'Author', value: book.Author },
            { label: 'Translator', value: book.Translator },
            { label: 'Publisher', value: book.Publisher },
            { label: '# of Copies', value: book['# of Copies'] },
            { label: 'Shelf_ID', value: book['Shelf_ID'] },
        ];
        
        let detailHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <div class="image-gallery">
                            <div class="image-container">
                                <div class="image-placeholder">📖</div>
                                <img src="" alt="Book image" class="book-image" style="display: none;">
                            </div>
                            <div class="image-navigation">
                                <button class="nav-arrow prev-arrow" disabled>&#10094;</button>
                                <span class="image-counter">Image 1 of 1</span>
                                <button class="nav-arrow next-arrow" disabled>&#10095;</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="book-details">
                            <h2>${title}</h2>
                            <div class="detail-content">
        `;
        
        fields.forEach(field => {
            const displayValue = field.value !== null && field.value !== undefined ? field.value : '(none)';
            detailHTML += `<p><strong>${field.label}:</strong> ${displayValue}</p>`;
        });
        
        detailHTML += `
                            </div>
                            <button id="backToList">Back to Catalog</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.bookDetail.innerHTML = detailHTML;
        
        // Load and display book images
        this.loadBookImages(book.ID);
        
        // Attach event listener to back button
        document.getElementById('backToList').addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }

    async loadBookImages(bookId) {
        const imageContainer = this.bookDetail.querySelector('.image-container');
        const prevArrow = this.bookDetail.querySelector('.prev-arrow');
        const nextArrow = this.bookDetail.querySelector('.next-arrow');
        const imageCounter = this.bookDetail.querySelector('.image-counter');
        const bookImage = this.bookDetail.querySelector('.book-image');
        const placeholder = this.bookDetail.querySelector('.image-placeholder');
        
        let currentImageIndex = 0;
        let imageUrls = [];
        
        // Try to load images from the catalog-imgs folder
        try {
            // Try to load up to 10 images
            for (let i = 1; i <= 10; i++) {
                const imageUrl = `./catalog-imgs/${bookId}/${i}.jpg`;
                try {
                    const response = await fetch(imageUrl, { method: 'HEAD' });
                    if (response.ok) {
                        imageUrls.push(imageUrl);
                    } else {
                        break;
                    }
                } catch (error) {
                    break;
                }
            }
        } catch (error) {
            console.error('Error loading images:', error);
        }
        
        if (imageUrls.length === 0) {
            // Show placeholder if no images found
            placeholder.style.display = 'flex';
            bookImage.style.display = 'none';
            imageCounter.textContent = 'No images available';
            prevArrow.disabled = true;
            nextArrow.disabled = true;
            // Remove zoom cursor when no images
            imageContainer.classList.remove('has-image');
            return;
        }
        
        // Hide placeholder and show first image
        placeholder.style.display = 'none';
        bookImage.style.display = 'block';
        
        // Store image URLs for popup navigation
        this.currentBookImages = imageUrls;
        
        // Display first image
        bookImage.src = imageUrls[0];
        currentImageIndex = 0;
        imageCounter.textContent = `Image ${currentImageIndex + 1} of ${imageUrls.length}`;
        
        // Enable/disable navigation arrows based on image count
        prevArrow.disabled = imageUrls.length <= 1;
        nextArrow.disabled = imageUrls.length <= 1;
        
        // Add zoom cursor when images are available
        imageContainer.classList.add('has-image');
        
        // Add click event to image to open popup
        bookImage.addEventListener('click', () => {
            this.openImagePopup(imageUrls[currentImageIndex], currentImageIndex);
        });
        
        // Add event listeners to navigation arrows
        prevArrow.onclick = () => {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                bookImage.src = imageUrls[currentImageIndex];
                imageCounter.textContent = `Image ${currentImageIndex + 1} of ${imageUrls.length}`;
            }
        };
        
        nextArrow.onclick = () => {
            if (currentImageIndex < imageUrls.length - 1) {
                currentImageIndex++;
                bookImage.src = imageUrls[currentImageIndex];
                imageCounter.textContent = `Image ${currentImageIndex + 1} of ${imageUrls.length}`;
            }
        };
    }

    openImagePopup(imageSrc, startIndex) {
        // Store the starting index for popup navigation
        this.popupCurrentIndex = startIndex;
        
        // Update popup image and counter
        this.updatePopupImage();
        
        // Show the popup
        this.popupOverlay.style.display = 'flex';
    }

    updatePopupImage() {
        if (!this.currentBookImages || this.currentBookImages.length === 0) return;
        
        // Update popup image
        this.popupImage.src = this.currentBookImages[this.popupCurrentIndex];
        
        // Update popup counter - changed to X/Y format
        this.popupImageCounter.textContent = `${this.popupCurrentIndex + 1}/${this.currentBookImages.length}`;
        
        // Update navigation arrows state
        this.popupPrevArrow.disabled = this.currentBookImages.length <= 1 || this.popupCurrentIndex === 0;
        this.popupNextArrow.disabled = this.currentBookImages.length <= 1 || this.popupCurrentIndex === this.currentBookImages.length - 1;
    }

    navigatePopup(direction) {
        if (!this.currentBookImages || this.currentBookImages.length <= 1) return;
        
        const newIndex = this.popupCurrentIndex + direction;
        
        // Check bounds
        if (newIndex >= 0 && newIndex < this.currentBookImages.length) {
            this.popupCurrentIndex = newIndex;
            this.updatePopupImage();
        }
    }

    closeImagePopup() {
        this.popupOverlay.style.display = 'none';
        this.popupImage.src = '';
    }

    updateSearch() {
        // Reset to first page when searching
        this.currentPage = 1;
        // Search functionality - filter books based on input
        this.renderBooks();
    }

    updateSort() {
        // Sort functionality removed as requested
    }
}
