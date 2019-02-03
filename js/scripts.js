let userData = []; // Variable to hold random user data once retrieved.
let userCards = [];
let userModals = {};



function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .catch(error => console.log('Looks like there was a problem!', error))
}

fetchData('https://randomuser.me/api/?results=12&inc=picture,name,email,location,cell,DOB&nat=us&noinfo')
    .then(data => {
        userData = data.results;
        generateSearch();
        processData(userData);
        loadGallery(userCards);
        loadModalContainer(userModals);
    })
    .then(function () {
        $('.card').on('click', function (e) {
            const currentModal = e.currentTarget.id.replace('card', 'modal');
            $('.modal-container').show();
            $(`#${currentModal}`).show();
        });
        $('.modal').on('click', function (e) {
            if (e.target.parentNode.className === 'modal-close-btn') {
                const $currentModal = $(`#${e.target.parentNode.id}`).parent();
                $currentModal.hide();
                $('.modal-container').hide();
            }
        });
        $('.modal-btn-container').on('click', function (e) {
            // If the previous button on modal was clicked
            if (e.target.className === 'modal-prev btn') {
                const currentModal = $('#' + e.target.parentNode.parentNode.id);
                const visableModals = modalsToShow(); //Gets which modals to display based on visable cards
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
                $('#' + previousModal).show();
                // If the next button on modal clicked    
            } else if (e.target.className === 'modal-next btn') {
                const currentModal = $('#' + e.target.parentNode.parentNode.id);
                const visableModals = modalsToShow();
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
                $('#' + nextModal).show();
            }

        });
        $('.search-input').on('keyup', function () {
            search();
        });
        $('form').on('submit', function (e) {
            e.preventDefault();
            search();
        });
    })

function modalsToShow() {
    const modalsDisplayed = [];
    const cards = $('#gallery').children();
    $.each(cards, function (index, card) {
        if (!(card.style.display === 'none')) {
            modalsDisplayed.push(`modal-${card.id.substring(5)}`);
        }
    });
    return modalsDisplayed;
}

function processData(data) {
    $.each(data, (index, user) => {
        userCards.push(generateCard(index, user));
        userModals[`modal-${index + 1}`] = generateModal(index, user);
    })
}

function loadGallery(data) {
    $.each(data, (index, userCard) => {
        $('#gallery').append(userCard);
    })
}

function loadModalContainer(data) {
    $('#gallery').after(buildElement('div', undefined, 'modal-container'));
    $('.modal-container').hide();
    console.log(data);
    $.each(data, (index, userModal) => {
        $('.modal-container').append(userModal);
        $(`#${index}`).hide();
    })
}

function generateCard(cardIndex, data) {
    // Create Card Div   
    const cardDiv = buildElement('div', `card-${cardIndex + 1}`, 'card');

    //Create Card Image and Card Info Containers
    const cardImgDiv = buildElement('div', undefined, 'card-img-container');
    const cardInfoDiv = buildElement('div', undefined, 'card-info-container');

    //Create image and append to Card Image Container
    const img = buildElement('img', undefined, 'card-img', data.picture.large, 'profile picture');
    cardImgDiv.append(img);

    //Create h3 and append to Card Info Container
    const h3 = buildElement('h3', 'name', 'card-name cap');
    h3.textContent = `${data.name.first} ${data.name.last}`;
    cardInfoDiv.append(h3);

    //Create email and append to Card Info Container
    const email = buildElement('p', undefined, 'card-text');
    email.textContent = `${data.email}`;
    cardInfoDiv.append(email);

    //Create location and append to Card Info Container
    const location = buildElement('p', undefined, 'card-text cap');
    location.textContent = `${data.location.city}`;
    cardInfoDiv.append(location);

    //Append Card Image Container and Card Info Container to Card Div
    cardDiv.append(cardImgDiv);
    cardDiv.append(cardInfoDiv);

    return cardDiv;
}

function generateModal(modalIndex, data) {
    //Create Modal Div
    const modalDiv = buildElement('div', `modal-${modalIndex + 1}`, 'modal');

    //Create button and append to Modal Div
    const modalButton = buildElement('button', `modal-${modalIndex + 1}-close-btn`, 'modal-close-btn');
    modalButton.innerHTML = '<strong>X</strong>';
    modalDiv.append(modalButton);

    //Create Modal Info Container
    const modalInfoDiv = buildElement('div', undefined, 'modal-info-container');

    //Create image and append to Modal Info Container
    const img = buildElement('img', undefined, 'modal-img', `${data.picture.large}`, 'profile picture')
    modalInfoDiv.append(img);

    //Create h3 and append to Modal Info Container
    const h3 = buildElement('h3', 'name', 'card-name cap');
    h3.textContent = `${data.name.first} ${data.name.last}`;
    modalInfoDiv.append(h3);

    //Create email and append to Modal Info Container
    const email = buildElement('p', undefined, 'modal-text');
    email.textContent = `${data.email}`;
    modalInfoDiv.append(email);

    //Create location and append to Modal Info Container
    const location = buildElement('p', undefined, 'modal-text cap');
    location.textContent = `${data.location.city}`;
    modalInfoDiv.append(location);

    //Create horizontal line and append to Modal Info Container
    modalInfoDiv.append(buildElement('hr'));

    //Create cell and append to Modal Info Container
    const cell = buildElement('p', undefined, 'modal-text');
    cell.textContent = `${data.cell}`;
    modalInfoDiv.append(cell);

    //Create address and append to Modal Info Container
    const address = buildElement('p', undefined, 'modal-text');
    address.textContent = `${data.location.street} ${data.location.city}, ${data.location.state} ${data.location.postcode}`;
    modalInfoDiv.append(address);

    //Create birthday and append to Modal Info Container
    const birthday = buildElement('p', undefined, 'modal-text');
    const date = formatDate(data.dob.date)
    birthday.textContent = `Birthday: ${date}`;
    modalInfoDiv.append(birthday);

    //Append Modal Info Container to Modal Div
    modalDiv.append(modalInfoDiv);

    //Create Modal Button Container
    const modalBtnDiv = buildElement('div', undefined, 'modal-btn-container');

    //Create Modal Previous Button and append to Modal Button Container
    const modalPrevButton = buildElement('button', `modal-${modalIndex + 1}-prev`, 'modal-prev btn');
    modalPrevButton.textContent = 'Prev';
    modalBtnDiv.append(modalPrevButton);

    //Create Modal Next Button and append to Modal Button Container
    const modalNextButton = buildElement('button', `modal-${modalIndex + 1}-next`, 'modal-next btn');
    modalNextButton.textContent = 'Next';
    modalBtnDiv.append(modalNextButton);

    //Append Modal Button Container to Modal Div
    modalDiv.append(modalBtnDiv);

    return modalDiv;
}

function generateSearch() {
    //Select Search container
    const searchDiv = $('.search-container');

    //Create Form element
    const form = buildElement('form', undefined, undefined, undefined, undefined, '#', 'get');

    //create Search Input and append to Form
    const searchInput = buildElement('input', 'search-input', 'search-input', undefined, undefined, undefined, undefined, 'search', 'Search...');
    form.append(searchInput);

    //Create Submit Input and append to form
    const submitInput = buildElement('input', 'search-submit', 'search-submit', undefined, undefined, undefined, undefined, 'submit', undefined, 'Search');
    form.append(submitInput);

    //Append Form to Search Container
    searchDiv.append(form);
}

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
        if (parameter) {
            newElement.setAttribute(key, parameter);
        }
    });

    return newElement; // return new element with parameters
}

// function buildElement2(element, ...attributes) {
//     const newElement = document.createElement(element); // create new element



//     // Iterate through parameters and add to the new element
//     $.each(attributes, function (index, parameter) {
//         $.each(parameter, function (key, value) {
//             newElement.setAttribute(key, value);
//         })
//     });

//     return newElement; // return new element with parameters
// }

function formatDate(date) {

    //Return formatted date of mm/dd/yyyy
    const formattedDate = date.replace(/(\d{4})-([0-1][0-3])-([0-3]\d{1})T[0-2]\d{1}:[0-5]\d{1}:[0-5]\d{1}Z/, "$2/$3/$1");
    return formattedDate;
}

function search() {

    const input = $('#search-input');
    const search = input.val().toUpperCase();
    const names = $('.card-info-container h3');

    $.each(names, function (index, name) {
        const textContent = name.textContent.toUpperCase();
        const card = $('#' + name.parentElement.parentElement.id);

        card.show();
        if (!textContent.includes(search)) {
            card.hide();
        }
    })
}