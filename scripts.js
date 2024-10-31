import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

const BookApp = {
    page: 1,
    matches: books,

    // Initialize the application
    init() {
        this.populateBookPreviews(this.matches.slice(0, BOOKS_PER_PAGE));
        this.populateDropdowns();
        this.setTheme();
        this.updateShowMoreButton();
        this.setupEventListeners();
    },


    // Function to populate book previews on the page
    populateBookPreviews(bookList) {
        const fragment = document.createDocumentFragment();
        bookList.forEach(book => fragment.appendChild(this.createBookPreviewElement(book)));
        const listContainer = document.querySelector('[data-list-items]');
        listContainer.innerHTML = ''; // Clear previous items
        listContainer.appendChild(fragment);
    },

    // Function to populate dropdown menus for genres and authors
    populateDropdowns() {
        this.populateDropdown('[data-search-genres]', {
            firstOptionText: 'All Genres',
            items: genres,
        });
        this.populateDropdown('[data-search-authors]', {
            firstOptionText: 'All Authors',
            items: authors,
        });
    },

    // Function to populate a single dropdown
    populateDropdown(elementSelector, options) {
        const dropdownFragment = document.createDocumentFragment();
        const firstElement = document.createElement('option');
        firstElement.value = 'any';
        firstElement.innerText = options.firstOptionText;
        dropdownFragment.appendChild(firstElement);

        Object.entries(options.items).forEach(([id, name]) => {
            const element = document.createElement('option');
            element.value = id;
            element.innerText = name;
            dropdownFragment.appendChild(element);
        });

        document.querySelector(elementSelector).appendChild(dropdownFragment);
    },

    // Function to set the theme based on user preference
    setTheme() {
        const themeInput = document.querySelector('[data-settings-theme]');
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        themeInput.value = isDarkMode ? 'night' : 'day';
        document.documentElement.style.setProperty('--color-dark', isDarkMode ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', isDarkMode ? '10, 10, 20' : '255, 255, 255');
    },

    // Function to update the "Show more" button
    updateShowMoreButton() {
        const showMoreButton = document.querySelector('[data-list-button]');
        const remainingBooks = this.matches.length - (this.page * BOOKS_PER_PAGE);
        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>`;
        showMoreButton.disabled = remainingBooks <= 0;
    },

    // Function to handle search form submission
    handleSearchSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        const result = books.filter(book => this.filterBooks(book, filters));

        this.matches = result;
        this.page = 1;

        document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length < 1);
        this.populateBookPreviews(result.slice(0, BOOKS_PER_PAGE));
        this.updateShowMoreButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelector('[data-search-overlay]').open = false;
    },


    // Function to filter books based on given filters
    filterBooks(book, filters) {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;

        return titleMatch && authorMatch && genreMatch;
    },
       // Function to handle the "Show more" button click
       handleShowMoreClick() {
        const nextBooks = this.matches.slice(this.page * BOOKS_PER_PAGE, (this.page + 1) * BOOKS_PER_PAGE);
        this.populateBookPreviews(nextBooks);
        this.page++;
        this.updateShowMoreButton();
    },

    // Function to handle individual book preview clicks
    handleBookPreviewClick(event) {
        const pathArray = Array.from(event.composedPath());
        const activeNode = pathArray.find(node => node?.dataset?.preview);
        
        if (activeNode) {
            const activeBook = books.find(book => book.id === activeNode.dataset.preview);
            if (activeBook) {
                this.displayBookDetails(activeBook);
            }
        }
    },