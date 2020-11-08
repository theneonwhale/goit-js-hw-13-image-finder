import ImagesApiService from './apiService';
import getRefs from './get-refs';
import imageTpl from '../templates/image-card.hbs';
import LoadMoreBtn from './load-more-btn';
import debounce from 'lodash.debounce';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import { notice, error } from '@pnotify/core';

import * as basicLightbox from 'basiclightbox';
// import '../../node_modules/basiclightbox/dist/basicLightbox.min.css';
import 'basiclightbox/dist/basicLightbox.min.css';
const refs = getRefs();
const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

refs.form.addEventListener('input', debounce(onSearch, 500));
loadMoreBtn.refs.button.addEventListener('click', getImages);

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

  imagesApiService.fetchImages().then(images => {
    if (images.length === 0) {
      loadMoreBtn.hide();

      onFetchNoMatches();
    } else if (images.length < 12) {
      loadMoreBtn.hide();
    }

    console.log(images.length);
    scrollWin();
    appendImagesMarkup(images);
    loadMoreBtn.enable();
  });
}

function appendImagesMarkup(image) {
  refs.imagesContainer.insertAdjacentHTML('beforeend', imageTpl(image));
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
}

function scrollWin() {
  setTimeout(() => {
    window.scrollBy({
      top: document.documentElement.clientHeight - refs.header.clientHeight,
      behavior: 'smooth',
    });
  }, 1000);
}

//
refs.imagesContainer.addEventListener('click', onOpenLightbox);

function onOpenLightbox(e) {
  if (e.target.nodeName !== 'IMG') {
    return;
  }
  console.dir(e.target);
  const instance = basicLightbox.create(`
    <img src="${e.target.dataset.source}" width="800" height="600">
`);

  instance.show();
}

//

function onFetchManyMatches() {
  notice({
    title: 'Too many matches!',
    text: 'Too many matches found. Please enter a more specific query.',
    delay: 2500,
  });
}

function onFetchNoMatches() {
  error({
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
