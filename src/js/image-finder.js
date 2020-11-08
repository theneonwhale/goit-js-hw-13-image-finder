import ImagesApiService from './apiService';
import getRefs from './get-refs';
import imageTpl from '../templates/image-card.hbs';
import LoadMoreBtn from './load-more-btn';
import debounce from 'lodash.debounce';

import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import { success, notice, error } from '@pnotify/core';

import 'basiclightbox/dist/basicLightbox.min.css';
import * as basicLightbox from 'basiclightbox';

const refs = getRefs();
const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});
let pageCount = 0;

refs.form.addEventListener('input', debounce(onSearch, 500));
loadMoreBtn.refs.button.addEventListener('click', getImages);
refs.imagesContainer.addEventListener('click', onOpenLightbox);

function onSearch(e) {
  clearImagesContainer();

  imagesApiService.query = e.target.value;

  if (imagesApiService.query === '') {
    loadMoreBtn.hide();

    onFetchError();

    return;
  }
  loadMoreBtn.show();

  imagesApiService.resetPage();

  loadMoreBtn.disable();

  getImages();
}

function getImages() {
  loadMoreBtn.disable();

  imagesApiService.fetchImages().then(({ total, hits }) => {
    if (hits.length === 0) {
      loadMoreBtn.hide();

      onFetchNoMatches();

      return;
    } else if (hits.length < 12) {
      loadMoreBtn.hide();
    }

    if (pageCount > 0) {
      scrollWin();
    }

    if (pageCount === 0) {
      onFetchMatches(total);
    }
    pageCount += 1;

    appendImagesMarkup(hits);

    loadMoreBtn.enable();
  });
}

function appendImagesMarkup(image) {
  refs.imagesContainer.insertAdjacentHTML('beforeend', imageTpl(image));
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
  pageCount = 0;
}

// Window scroll
function scrollWin() {
  setTimeout(() => {
    window.scrollBy({
      top: document.documentElement.clientHeight - refs.header.clientHeight,
      behavior: 'smooth',
    });
  }, 1000);
}

// Lightbox
function onOpenLightbox(e) {
  if (e.target.nodeName !== 'IMG') {
    return;
  }

  const instance = basicLightbox.create(`
    <img src="${e.target.dataset.source}">
`);

  instance.show();
}

// Pnotify
function onFetchMatches(total) {
  success({
    title: `Success!`,
    text: `Found ${total} images!`,
    delay: 2500,
  });
}

function onFetchNoMatches() {
  notice({
    title: 'No matches!',
    text: 'No matches found. Please enter another query.',
    delay: 2500,
  });
}

function onFetchError() {
  error({
    title: 'Error!',
    text: 'Please enter a query.',
    delay: 2500,
  });
}
