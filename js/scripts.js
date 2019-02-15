let usersData = {}; // Data stored from fetch
let userCards = []; // User card objects
let userModals = {}; // User modal objects


/**
 * Function checkStatus
 * Return promise. Either it is ok and data is returned or return error there was a problem.
 * Code primarily from Fetch API lesson. I like the modular design to clean up an already messy promise chain
 * @param {object} response The response from the fetch
 */
function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

/**
 * Function fetchRandomUser()
 * This wrapper function returns fetch
 * Code primarily from Fetch API lesson. I like the modular design to clean up an already messy promise chain
 * @param {string} url 
 */
function fetchRandomUser(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json()) //parse the response to json
        .catch(error => console.log('Looks like there was a problem!', error)) // Catch the error and log it
}

/**
 * Gets data from API, processes data, calls functions to build employee list html, and finally creates event handlers.
 */
fetchRandomUser('https://randomuser.me/api/?results=12&inc=picture,name,email,location,cell,DOB&nat=us&noinfo')
    .then(data => {
        usersData = data.results
        processData(data.results); // Take data and add to varibles to be used later.
    })
    .then(() => { // Generate dynamic HTML for pag
        addSearch();
        addUserCardsToGalleryContainer(userCards);
        addUserModalsToModalContainer(userModals);
    })
    .then(function () { // once we have generated all the HTML we setup event handlers
        cardClickedHandler();
        modalCloseButtonClickedHandler();
        modalButtonContainerClickedHandler();
        searchHandler();
    })

/**
 * Function processData()
 * Populates an array for cards and object for modals
 * @param {array} data Results from fetch.
 */
function processData(data) {
    $.each(data, (index, user) => {
        userCards.push(generateCard(index, user));
        userModals[`modal-${ index + 1 }`] = generateModal(index, user);
    })
}

/*
    Event Handler functions
*/

/**
 * Function cardClickedHandler()
 * Handles clicks on employee cards and opens approiate modal.
 * Hides Modal prev and next buttons is it is only card displayed
 */
function cardClickedHandler() {
    $('.card').on('click', function (e) {
        const currentModal = $(`#${ e.currentTarget.id.replace('card', 'modal') }`); // Select the modal based on card clicked
        const visableModals = modalsToDisplay() // get list of modals that are visable based on cards that are visable

        // Ensure All modals hidden before showing currentModal and All modals show previous and next buttons
        $.each($('.modal-container').children(), (index, modal) => {
            const $modalObject = $(`#${ modal.id }`);

            $modalObject.children().last().show();
            $modalObject.hide();
        });
        // Hide previous and next button if only on one search result is visable
        if (visableModals.length <= 1) {
            const modalButtonContainer = currentModal.children().last();;
            modalButtonContainer.hide();
        }

        // Show the current modal and then show Modal Container
        currentModal.show();
        $('.modal-container').show();
    });
}

/**
 * Function modalCloseButtonClickedHandler()
 * Handles close button clicks and closes modal
 */
function modalCloseButtonClickedHandler() {
    $('.modal').on('click', function (e) {
        //If it was the close button then we hide the modal container
        if (e.target.parentNode.className === 'modal-close-btn' || e.target.className === 'modal-close-btn') {
            $('.modal-container').hide();
        }
    });
}

/**
 * Function modalButtonContainerClickedHandler()
 * Handles Previous and Next clicks
 */
function modalButtonContainerClickedHandler() {
    $('.modal-btn-container').on('click', function (e) {
        const currentModal = $('#' + e.target.parentNode.parentNode.id);
        const visableModals = modalsToDisplay(); //Gets which modals to display based on visable cards

        if (e.target.className === 'modal-prev btn') { // If the previous button on modal was clicked
            let previousModal = '';

            // Set what the previous Modal should be
            $.each(visableModals, function (index, modal) {
                if (modal === e.target.parentNode.parentNode.id) {
                    if (index === 0) {
                        previousModal = visableModals[visableModals.length - 1];
                    } else {
                        previousModal = visableModals[index - 1]
                    }
                }
            });

            //Hide the displayed modal and show the previous modal
            currentModal.hide();
            $(`#${ previousModal }`).show();
        } else if (e.target.className === 'modal-next btn') // If the next button on modal clicked    
        {
            let nextModal = '';
            // Set what the next Modal should be
            $.each(visableModals, function (index, modal) {
                if (modal === e.target.parentNode.parentNode.id) {
                    if (index === (visableModals.length - 1)) {
                        nextModal = visableModals[0];
                    } else {
                        nextModal = visableModals[index + 1]
                    }
                }
            })
            //Hide the displayed modal and show the next modal
            currentModal.hide();
            $(`#${ nextModal }`).show();
        }

    });
}

/**
 * Function searchHandler()
 * Handles keyup, search, and submit events and calls search function
 */
function searchHandler() {
    $('.search-input').on('keyup search submit', function () {
        search();
    });
}

/**
 * Function Search()
 * Searchs names on cards and shows only names that match search.
 */
function search() {
    const search = $('#search-input').val().toUpperCase(); // get search string from input field
    const names = $('.card-info-container h3'); // get all h3 tags from employee cards

    // iterate through h3's and see if the search string is included in the name
    $.each(names, function (index, name) {
        const textContent = name.textContent.toUpperCase();
        const card = $('#' + name.parentElement.parentElement.id);

        card.show(); // ensure all cards are shown

        if (!textContent.includes(search)) {
            card.hide(); // hide employee if search string is not in name
        }
    });
}

/**
 * Function modalsToDisplay()
 * Matches cards that are not hidden after search and builds array of strings with modal ids
 * @return {array} - Array of modal id strings
 */
function modalsToDisplay() {
    const modalsDisplayed = [];
    const cards = $('#gallery').children();
    // iterate through all employee cards
    $.each(cards, function (index, card) {
        //Check if card display is not set to none
        if (!(card.style.display === 'none')) {
            //We trim the card- from id and replace with modal-. Then add modal ID to array of corresponding card id. 
            modalsDisplayed.push(`modal-${ card.id.substring(5) }`);
        }
    });
    //return an array of modal ids strings that are visable based on cards that are visable
    return modalsDisplayed;
}

/*=================================
    Add HTML elements to page
==================================*/

/**
 * Function addSearch()
 * Adds search field to search container in header field
 */
function addSearch() {
    const searchDiv = $('.search-container');
    searchDiv.append(generateSearchForm());
}

/**
 * Function addUserCardsToGalleryContainer()
 * Adds employee cards to gallery container
 * @param {array} data - contains employee card HTML objects built by generateCard function 
 */
function addUserCardsToGalleryContainer(data) {
    $.each(data, (index, userCard) => {
        $('#gallery').append(userCard);
    })
}

/**
 * Function addUserModalsToModalContainer()
 * Adds modal HTML objects to modal container.
 * @param {object} data - Contains modal id as key and corresponding modal HTML Object as value
 */
function addUserModalsToModalContainer(data) {
    $('#gallery').after(buildElement('div', undefined, 'modal-container'));
    $('.modal-container').hide();

    $.each(data, (index, userModal) => {
        $('.modal-container').append(userModal);
        $(`#${ index }`).hide();
    })
}

/*=================================
    Generate HTML for page
==================================*/

/**
 * Function generateCard()
 * Generates HTML object for an employee
 * @param {number} cardIndex - the current index being iterated through by processDataFunction()
 * @param {object} data - Contains single user object obtained through fetch
 * @return {object} - Contains card HTML object
 */
function generateCard(cardIndex, data) {
    // Create Card Div   
    const cardDiv = buildElement('div', `card-${ cardIndex + 1 }`, 'card');

    //Create Card Image and Card Info Containers
    const cardImgDiv = buildElement('div', undefined, 'card-img-container');
    const cardInfoDiv = buildElement('div', undefined, 'card-info-container');

    //Create image and append to Card Image Container
    const img = buildElement('img', undefined, 'card-img', data.picture.large, 'profile picture');
    cardImgDiv.append(img);

    //Create h3 and append to Card Info Container
    const h3 = buildElement('h3', 'name', 'card-name cap');
    h3.textContent = `${ data.name.first } ${ data.name.last }`;
    cardInfoDiv.append(h3);

    //Create email and append to Card Info Container
    const email = buildElement('p', undefined, 'card-text');
    email.textContent = `${ data.email }`;
    cardInfoDiv.append(email);

    //Create location and append to Card Info Container
    const location = buildElement('p', undefined, 'card-text cap');
    location.textContent = `${ data.location.city }`;
    cardInfoDiv.append(location);

    //Append Card Image Container and Card Info Container to Card Div
    cardDiv.append(cardImgDiv);
    cardDiv.append(cardInfoDiv);

    return cardDiv; //Return employee card HTML Object
}

/**
 * Function generateModal()
 * Generates HTML object for an employee
 * @param {number} modalIndex - The current index being iterated through by processDataFunction()
 * @param {object} data - Contains single user object obtained through fetch
 */
function generateModal(modalIndex, data) {
    //Create Modal Div
    const modalDiv = buildElement('div', `modal-${ modalIndex + 1 }`, 'modal');

    //Create button and append to Modal Div
    const modalButton = buildElement('button', `modal-${ modalIndex + 1 }-close-btn`, 'modal-close-btn');
    modalButton.innerHTML = '<strong>X</strong>';
    modalDiv.append(modalButton);

    //Create Modal Info Container
    const modalInfoDiv = buildElement('div', undefined, 'modal-info-container');

    //Create image and append to Modal Info Container
    const img = buildElement('img', undefined, 'modal-img', `${ data.picture.large }`, 'profile picture')
    modalInfoDiv.append(img);

    //Create h3 and append to Modal Info Container
    const h3 = buildElement('h3', 'name', 'card-name cap');
    h3.textContent = `${ data.name.first } ${ data.name.last }`;
    modalInfoDiv.append(h3);

    //Create email and append to Modal Info Container
    const email = buildElement('p', undefined, 'modal-text');
    email.textContent = `${ data.email }`;
    modalInfoDiv.append(email);

    //Create location and append to Modal Info Container
    const location = buildElement('p', undefined, 'modal-text cap');
    location.textContent = `${ data.location.city }`;
    modalInfoDiv.append(location);

    //Create horizontal line and append to Modal Info Container
    modalInfoDiv.append(buildElement('hr'));

    //Create cell and append to Modal Info Container
    const cell = buildElement('p', undefined, 'modal-text');
    cell.textContent = `${ data.cell }`;
    modalInfoDiv.append(cell);

    //Create address and append to Modal Info Container
    const address = buildElement('p', undefined, 'modal-text cap');
    address.textContent = `${ data.location.street } ${ data.location.city }, ${ data.location.state } ${ data.location.postcode }`;
    modalInfoDiv.append(address);

    //Create birthday and append to Modal Info Container
    const birthday = buildElement('p', undefined, 'modal-text');
    const date = formatDate(data.dob.date)
    birthday.textContent = `Birthday: ${ date }`;
    modalInfoDiv.append(birthday);

    //Append Modal Info Container to Modal Div
    modalDiv.append(modalInfoDiv);

    //Create Modal Button Container
    const modalBtnDiv = buildElement('div', undefined, 'modal-btn-container');

    //Create Modal Previous Button and append to Modal Button Container
    const modalPrevButton = buildElement('button', `modal-${ modalIndex + 1 }-prev`, 'modal-prev btn');
    modalPrevButton.textContent = 'Prev';
    modalBtnDiv.append(modalPrevButton);

    //Create Modal Next Button and append to Modal Button Container
    const modalNextButton = buildElement('button', `modal-${ modalIndex + 1 }-next`, 'modal-next btn');
    modalNextButton.textContent = 'Next';
    modalBtnDiv.append(modalNextButton);

    //Append Modal Button Container to Modal Div
    modalDiv.append(modalBtnDiv);

    return modalDiv; //Return employee modal HTML Object
}

/**
 * function generateSearch()
 * Creates search form, inputs and submit button HTML and appends to search container
 */
function generateSearchForm() {
    //Create Form element
    const form = buildElement('form', undefined, undefined, undefined, undefined, '#', 'get');

    //create Search Input and append to Form
    const searchInput = buildElement('input', 'search-input', 'search-input', undefined, undefined, undefined, undefined, 'search', 'Search...');
    form.append(searchInput);

    //Create Submit Input and append to form
    const submitInput = buildElement('input', 'search-submit', 'search-submit', undefined, undefined, undefined, undefined, 'submit', undefined, 'Search');
    form.append(submitInput);

    return form;
}

/*===========================
    Helper Functions
=============================*/

/**
 * Function buildElement()
 * This takes html element name and optional attributes.
 * Contemplated rest arguments instead of set parameters, but in the end passing objects was a bit more work.
 * @param {string} element      - This the only required parameter. The html element we want to create.
 * @param {string} id           - The id attribute
 * @param {string} classname    - The classname attribute
 * @param {string} src          - The source attribute
 * @param {string} alt          - The Alt attribute
 * @param {string} action       - The action attribute
 * @param {string} method       - The Method attribute
 * @param {string} type         - The Type attribute
 * @param {string} placeholder  - The Placeholder Attribute
 * @param {string} value        - The Value Attribute
 */
function buildElement(element, id = '', classname = '', src = '', alt = '', action = '', method = '', type = '', placeholder = '', value = '') {
    const newElement = document.createElement(element); // create new element

    const parameters = { //Store parameters in object
        id: id,
        class: classname,
        src: src,
        alt: alt,
        action: action,
        method: method,
        type: type,
        placeholder: placeholder,
        value: value
    }

    // Iterate through parameters and add to the new element
    $.each(parameters, function (key, parameter) {
        // Uses truthy to determine if we need to add the parameter. If the string length is > 0 then we add the attribute to the element
        if (parameter) {
            newElement.setAttribute(key, parameter);
        }
    });

    return newElement; // return new element with parameters
}
/**
 * Function formatDate()
 * Takes a UTC date and formats it to mm/dd/yyyy and removes time 
 * @param {string} date - Takes date in UTC format
 * @return {string} - Formatted date string
 */
function formatDate(date) {

    //Return formatted date of mm/dd/yyyy
    const formattedDate = date.replace(/(\d{4})-([0-1][0-3])-([0-3]\d{1})T[0-2]\d{1}:[0-5]\d{1}:[0-5]\d{1}Z/, "$2/$3/$1");
    return formattedDate;
}