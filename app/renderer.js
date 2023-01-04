const parser = new DOMParser();
const { shell } = require('electron');

const linkSection = document.querySelector('.links');
const errorMessage = document.querySelector('.error-message');
const newLinkForm = document.querySelector('.new-link-form');
const newLinkUrl = document.querySelector('.new-link-url');
const newLinkSubmit = document.querySelector('.new-link-submit');
const clearStorageButton = document.querySelector('.clear-storage');

function clearForm () {
  newLinkUrl.value = null;
}

function parseResponse (text) {
  const parsed = parser.parseFromString(text, 'text/html');

  return parsed;
}

function findTitle (nodes) {
  const title = nodes.querySelector('title').innerText;

  return title;
}

function storeLink (title, url) {
  localStorage.setItem(title, JSON.stringify(url));
}

function getLinks () {
  console.log(localStorage);
  return Object.entries(localStorage);
}

function convertToElement (link) {
  return `
    <li class="link">
      <h3>${link.title}</h3>
      <p><a href="${link.url}">${link.url}</a></p>
    </li>
  `;
}

function renderLinks () {
  const linkElements = getLinks()
    .map(link => {
      return convertToElement({
        title: link[0],
        url: link[1]
      });
    })
    .join('');

  linkSection.innerHTML = linkElements;
}

function handleError (error, url) {
  errorMessage.innerHTML = `
    There was an issue adding "${url}": ${error.message}
  `.trim();

  setTimeout(() => {
    errorMessage.innerText = null;
  }, 5000);
}

function validateResponse (response) {
  if (response.ok) {
    return response;
  } else {
    throw new Error(`Status code of ${response.status} ${response.statusText}`);
  }
}

// Check if new link is valid
newLinkUrl.addEventListener('keyup', () => {
  newLinkSubmit.disabled = !newLinkUrl.validity.valid;
});

// New HTTP request
newLinkForm.addEventListener('submit', event => {
  event.preventDefault();

  const url = newLinkUrl.value;

  fetch(url)
    .then(validateResponse)
    .then(response => {
      return response.text();
    })
    .then(parseResponse)
    .then(findTitle)
    .then(title => storeLink(title, url))
    .then(clearForm)
    .then(renderLinks)
    .catch(error => handleError(error, url));
});

// Send URL to browser when clicked
linkSection.addEventListener('click', event => {
  if (event.target.href) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

// Clear Storage
clearStorageButton.addEventListener('click', () => {
  localStorage.clear();
  linkSection.innerHTML = '';
});

renderLinks();
