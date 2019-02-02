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
    .then(data => loadGallery(data))



function loadGallery(data) {
    $.each(data.results, (index, randomUser) => {
        $('#gallery').append(generateCard(randomUser, index));
    })
}

function generateCard(data, cardIndex) {
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

function buildElement(element, id = '', classname = '', source = '', alt = '') {
    newElement = document.createElement(element);
    if (id) {
        newElement.id = id;
    }
    if (classname) {
        newElement.className = classname;
    }
    if (source) {
        newElement.src = source;
    }
    if (alt) {
        newElement.alt = alt;
    }
    return newElement;
}