// TIC Library Catalog - Application Logic
// This file will be populated with functionality for search, filtering, and sorting

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    const catalog = new Catalog();
    
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
        
        // DOM Elements
        this.bookList = document.getElementById('bookList');
        this.bookDetail = document.getElementById('bookDetail');
        this.searchInput = document.getElementById('searchInput');
        this.searchContainer = document.getElementById('searchContainer');
        this.paginationContainer = document.getElementById('pagination');
        
        // Popup elements
        this.popupOverlay = document.getElementById('imagePopup');
        this.popupImage = document.getElementById('popupImage');
        this.popupPrevArrow = document.getElementById('popupPrevArrow');
        this.popupNextArrow = document.getElementById('popupNextArrow');
        this.popupImageCounter = document.getElementById('popupImageCounter');
        this.closePopup = document.querySelector('.close-popup');
        
        // Initialize popup events
        this.initializePopupEvents();
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
        fetch('./TIC-Library-catalog.csv')
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
                    { ID: '9780262033848', Title: 'Introduction to Algorithms', Author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', Publisher: 'MIT Press', Year: 2009, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780131103627', Title: 'The C Programming Language', Author: 'Brian W. Kernighan, Dennis M. Ritchie', Publisher: 'Prentice Hall', Year: 1988, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780262046305', Title: 'Artificial Intelligence: A Modern Approach', Author: 'Stuart Russell, Peter Norvig', Publisher: 'Pearson', Year: 2021, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780132350884', Title: 'Clean Code', Author: 'Robert C. Martin', Publisher: 'Prentice Hall', Year: 2008, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780201633610', Title: 'Design Patterns', Author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', Publisher: 'Addison-Wesley', Year: 1994, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780321573513', Title: 'Algorithms', Author: 'Robert Sedgewick, Kevin Wayne', Publisher: 'Addison-Wesley', Year: 2011, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780132121553', Title: 'Computer Networks', Author: 'Andrew S. Tanenbaum, David J. Wetherall', Publisher: 'Pearson', Year: 2010, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780123747501', Title: 'Operating System Concepts', Author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', Publisher: 'Wiley', Year: 2012, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780133594140', Title: 'Database System Concepts', Author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', Publisher: 'McGraw-Hill', Year: 2019, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781492051367', Title: 'Fluent Python', Author: 'Luciano Ramalho', Publisher: 'O’Reilly Media', Year: 2022, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781491950296', Title: 'Python Data Science Handbook', Author: 'Jake VanderPlas', Publisher: 'O’Reilly Media', Year: 2016, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780134685991', Title: 'Effective Java', Author: 'Joshua Bloch', Publisher: 'Addison-Wesley', Year: 2018, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780262533058', Title: 'Structure and Interpretation of Computer Programs', Author: 'Harold Abelson, Gerald Jay Sussman', Publisher: 'MIT Press', Year: 1996, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780131101630', Title: 'Computer Architecture: A Quantitative Approach', Author: 'John L. Hennessy, David A. Patterson', Publisher: 'Morgan Kaufmann', Year: 2017, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780321125217', Title: 'The Pragmatic Programmer', Author: 'David Thomas, Andrew Hunt', Publisher: 'Addison-Wesley', Year: 1999, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780135957059', Title: 'Physics for Scientists and Engineers', Author: 'Raymond A. Serway, John W. Jewett', Publisher: 'Cengage Learning', Year: 2018, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781118230718', Title: 'University Physics with Modern Physics', Author: 'Hugh D. Young, Roger A. Freedman', Publisher: 'Pearson', Year: 2015, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781108422413', Title: 'Classical Mechanics', Author: 'John R. Taylor', Publisher: 'Cambridge University Press', Year: 2005, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780201380279', Title: 'Introduction to Electrodynamics', Author: 'David J. Griffiths', Publisher: 'Pearson', Year: 2017, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781108479035', Title: 'Introduction to Quantum Mechanics', Author: 'David J. Griffiths, Darrell F. Schroeter', Publisher: 'Cambridge University Press', Year: 2018, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780138053260', Title: 'Fundamentals of Physics', Author: 'David Halliday, Robert Resnick, Jearl Walker', Publisher: 'Wiley', Year: 2013, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780521670562', Title: 'Thermal Physics', Author: 'Charles Kittel, Herbert Kroemer', Publisher: 'W. H. Freeman', Year: 2000, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780471404591', Title: 'Introduction to Solid State Physics', Author: 'Charles Kittel', Publisher: 'Wiley', Year: 2004, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780321501219', Title: 'Modern Physics', Author: 'Kenneth S. Krane', Publisher: 'Wiley', Year: 2012, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780073523323', Title: 'Optics', Author: 'Eugene Hecht', Publisher: 'Pearson', Year: 2016, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780199577716', Title: 'Statistical Physics', Author: 'Franz Mandl', Publisher: 'Wiley', Year: 2014, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781119453918', Title: 'Chemistry: The Molecular Science', Author: 'John W. Moore, Conrad L. Stanitski', Publisher: 'Cengage Learning', Year: 2019, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780134293936', Title: 'Chemistry & Chemical Reactivity', Author: 'John C. Kotz, Paul M. Treichel, John Townsend', Publisher: 'Cengage Learning', Year: 2015, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780321809247', Title: 'Organic Chemistry', Author: 'Paula Yurkanis Bruice', Publisher: 'Pearson', Year: 2016, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781259631757', Title: 'Inorganic Chemistry', Author: 'Gary L. Miessler, Paul J. Fischer, Donald A. Tarr', Publisher: 'Pearson', Year: 2014, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780199730845', Title: 'Physical Chemistry', Author: 'Peter Atkins, Julio de Paula', Publisher: 'Oxford University Press', Year: 2010, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781118133576', Title: 'Analytical Chemistry', Author: 'Gary D. Christian', Publisher: 'Wiley', Year: 2014, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780321803221', Title: 'Biochemistry', Author: 'Donald Voet, Judith G. Voet, Charlotte W. Pratt', Publisher: 'Wiley', Year: 2016, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780321957184', Title: 'General Chemistry', Author: 'Linus Pauling', Publisher: 'Dover Publications', Year: 2014, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780073402697', Title: 'Principles of Instrumental Analysis', Author: 'Douglas A. Skoog, F. James Holler, Stanley R. Crouch', Publisher: 'Cengage Learning', Year: 2017, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781111427107', Title: 'Quantitative Chemical Analysis', Author: 'Daniel C. Harris', Publisher: 'W. H. Freeman', Year: 2015, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780198727488', Title: 'Inorganic Chemistry', Author: 'Shriver & Atkins', Publisher: 'Oxford University Press', Year: 2010, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780133382832', Title: 'Organic Chemistry as a Second Language', Author: 'David R. Klein', Publisher: 'Wiley', Year: 2015, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9781118134412', Title: 'Molecular Driving Forces', Author: 'Ken A. Dill, Sarina Bromberg', Publisher: 'Garland Science', Year: 2010, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780134164031', Title: 'Physical Chemistry for the Biosciences', Author: 'Raymond Chang', Publisher: 'University Science Books', Year: 2005, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
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
            
            return title.includes(searchTerm) || 
                   author.includes(searchTerm) || 
                   isbn.includes(searchTerm);
        });

        // Calculate pagination
        const totalPages = Math.ceil(filteredBooks.length / this.booksPerPage);
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
            bookCard.innerHTML = `
                <h5>${title}</h5>
                <p class="author">${author}</p>
                <p class="isbn">ISBN: ${isbn}</p>
            `;
            // Add click event to navigate to book detail
            bookCard.addEventListener('click', () => {
                window.location.href = `./index.html?id=${book.ID}`;
            });
            this.bookList.appendChild(bookCard);
        });

        // Render pagination controls
        this.renderPagination(totalPages);
    }

    renderPagination(totalPages) {
        this.paginationContainer.innerHTML = '';
        
        if (totalPages <= 1) {
            this.paginationContainer.style.display = 'none';
            return;
        }

        this.paginationContainer.style.display = 'flex';

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

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === this.currentPage) {
                pageButton.style.backgroundColor = '#3498db';
                pageButton.style.color = 'white';
                pageButton.style.borderColor = '#3498db';
            }
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.renderBooks();
            });
            this.paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderBooks();
            }
        });
        this.paginationContainer.appendChild(nextButton);
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
            { label: 'Shelf ID', value: book['Shelf ID'] },
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
